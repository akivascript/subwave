(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');
	var moment = require ('moment');

	var config = require ('./config');
	var io = require ('./io');
	var st = require ('./state');

	marked.setOptions ({
		smartypants: true
	});


	// Runs a page through Jade so that it is formatted for display.
	function compilePage (page, tags) {
		var compiler, locals;

		compiler = jade.compileFile (page.template, { pretty: true });

		page.displayDate = formatDateForDisplay (page.date);
		page.headTitle = page.title;
		page.displayTitle = convertToHtml (page.title);
		page.title = convertToHtml (page.title);
		
		if (page.content) {
			page.content = convertToHtml (page.content);
		}

		// Use a local object so multiple objects can be passed to Jade.
		locals = {
			page: page,
			tags: Object.keys (tags),
			config: config
		};

		return compiler (locals);
	}
	

	// Takes a string and processes it through marked to prepare it
	// for display.
	function convertToHtml (input) {
		return marked (input);
	}


	// Takes a string in the format of 'YYYY-MM-DD HH:MM' and returns a
	// Date object.
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	
	// Duplicates a page's attributes.
	function copyAttributes (source) {
		var target;

		target = {};

		for (var attr in source) {
			target [attr] = source [attr];
		}

		return target;
	}


	// Creates a new index homepage. This gets rebuilt each time a new post is added
	// to the site.
	function createHomePage (posts) {
		var entries, entry, homePage, file, filename, homePath, path;

		entries = [];

		// TODO: Refactor this (with processSibling in posts?): readPost?
		for (var i = 0; i < posts.length; i++) {
			entry = copyAttributes (posts [i]);
			entry.path = io.getPostDirectoryPathname (entry.date);
			file = io.readFile (config.paths.archive + 'posts/' + entry.path + entry.filename + '.md');
			entry.content = getContent (file);
			entry.displayTitle = convertToHtml (entry.title);
			entry.displayDate = formatDateForDisplay (entry.date);

			if (entry.content && config.index.useExcerpts) {
				entry.excerpt = getExcerpt (entry.content, config.index.excerptParagraphs);
			}

			entries.push (entry);
		}

		homePage = {
			type: 'index',
			title: config.blog.title,
			filename: 'index',
			posts: entries,
			tags: [],
			template: config.paths.templates + 'index.jade'
		};

		return homePage;
	}


	// Converts a file into a page. A file has some front matter which is converted
	// to JSON. This front matter is used to configure the page, determine its type,
	// and so forth.
	function createPage (file) {
		var attr, content, compiler, filename, i, metadata, matches, page;

		matches = parseFile (file);

		page = copyAttributes (JSON.parse (matches [1]));

		content = matches [2];

		if (content) {
			page.content = content;
		}

		if (page.type === 'post') {
			page.template = config.paths.templates + 'post.jade';
			page.date = convertStringToDate (page.date);
			page.filename = io.getPostFilename (page.title, page.date);
			page.path = io.getPostDirectoryPathname (page.date);
		} else if (page.type === 'page') {
			page.template = config.paths.templates + 'page.jade';
			page.filename = page.title.toLowerCase ();
		} else if (page.type === 'archives') {
			page.template = config.paths.templates + 'archives.jade';
			page.filename = 'archives';
		} else {
			throw new Error ('Unable to determine template type from page: ' + page);
		}

		return page;
	}


	// Takes a date object and converts it to the specified date format for display
	// on both the index and individual post pages.
	function formatDateForDisplay (date) {
		var postDate;

		postDate = moment (date);

		return postDate.format (config.blog.dateFormat);
	}


	// Create an excerpt for a post.
	function getExcerpt (content, total) {
		var count, excerpt, graf, i, paragraphs;

		i = 0;
		count = 0;
		excerpt = [];
		paragraphs = content.split (/\n/);

		while (count < total && i < paragraphs.length) {
			graf = convertToHtml (paragraphs [i]);

			if (graf.search (/(<p>.+<\/p>)+/) !== -1) {
				count = count + 1;
			}

			excerpt.push (graf);

			i = i + 1;
		}

		return excerpt.join ('\n');
	}


	// Parses a file and returns only its content (e.g., the body of a post).
	function getContent (file) {
		return parseFile (file) [2];
	}


	// Parses a file and returns only its metadata.
	function getMetadata (file) {
		return parseFile (file) [1];
	}


	// An indirector for clarity.
	function getNewPages () {
		return io.readFiles (config.paths.inbox, createPage);
	}


	// Takes the contents of a file as a string and separates the metadata from the
	// content of the page. 
	function parseFile (file) {
		var matches, pattern;

		// Matches '{key: value, key: value, ...} content ...'
		pattern = /({[\s\w"'\?!,: \-\[\]\{\}\.\n]*})?\n*((.|[\n\r])*)/;

		matches = file.match (pattern);

		if (!matches || matches.length === 0) {
			throw new Error ('The file isn\'t the correct format: ' + file);
		}

		return matches;
	}


	// Compile and commit HTML file to disk.
	function savePage (page, tags) {
		page.output = compilePage (page, tags);

		io.saveHtmlPage (page);
	}


	module.exports.compilePage = compilePage;
	module.exports.convertToHtml = convertToHtml;
	module.exports.copyAttributes = copyAttributes;
	module.exports.createHomePage = createHomePage;
	module.exports.createPage = createPage;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.getExcerpt = getExcerpt;
	module.exports.getContent = getContent;
	module.exports.getMetadata = getMetadata;
	module.exports.getNewPages = getNewPages;
	module.exports.savePage = savePage;
} ());
