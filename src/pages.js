(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');
	var moment = require ('moment');

	var io = require ('./io');

	marked.setOptions ({
		smartypants: true
	});
	
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	// Runs a page through Jade so that it is formatted for display.
	function compilePage (page) {
		var compiler;

		compiler = jade.compileFile (page.template, { pretty: true });

		page.displayDate = formatDateForDisplay (page.date);
		page.title = marked (page.title);

		return compiler (page);
	}
	
	// Creates a new index homepage. This gets rebuilt each time a new post is added
	// to the site.
	function createHomePage (posts) {
		var homePage;

		homePage = {
			type: 'index',
			title: 'Blog Title',
			filename: 'index',
			posts: posts,
			tags: [],
			template: io.templatesPath + 'index.jade'
		};

		return homePage;
	}

	// Converts a file into a page. A file has some front matter which is converted
	// to JSON. This front matter is used to configure the page, determine its type,
	// and so forth
	function createPage (source) {
		var content, compiler, filename, metadata, matches, page;

		matches = processFile (source);

		metadata = JSON.parse (matches [1]);
		page = {};

		for (var attr in metadata) {
			page [attr] = metadata [attr];
		}

		content = marked (matches [2]);

		if (content) {
			page.content = content;
		}

		if (page.type === 'post') {
			page.template = io.templatesPath + 'post.jade';
			page.date = convertStringToDate (page.date);
			page.filename = io.getPostFilename (page.title, page.date);
			page.path = io.getPostDirectoryPathname (page.date);
		} else if (page.type === 'page') {
			page.template = io.templatesPath + 'page.jade';
			page.filename = page.title.toLowerCase ();
		} else if (page.type === 'archives') {
			page.template = io.templatesPath + 'archives.jade';
			page.filename = 'archives';
		} else {
			throw {
				type: 'Error',
				message: 'Unable to determine template type from page.'
			};
		}

		return page;
	}
	
	// This is the display format for archives.html and individual posts.
	function formatDateForDisplay (date) {
		var postDate;

		postDate = moment (date);

		return postDate.format ('MMMM DD, YYYY');
	}

	// Processes a file and returns only its content (e.g., the body of a post).
	function getFileContent (source) {
		var matches;

		matches = processFile (source);

		return marked (matches [2]);
	}

	// An indirector for clarity.
	function getNewPages () {
		return io.readFiles (io.inboxPath, createPage);
	}

	// Takes the contents of a file as a string and separates the metadata from the
	// content of the page. 
	function processFile (source) {
		var matches, pattern;

		// Matches '{key: value, key: value, ...} content ...'
		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
		matches = source.match (pattern);

		if (!matches || matches.length === 0) {
			throw {
				name: 'Error',
				message: 'The file isn\'t the correct format.'
			};
		}

		return matches;
	}

	// Compile and commit HTML file to disk.
	function savePage (page) {
		page.output = compilePage (page);

		io.saveHtmlPage (page);
	}

	module.exports.compilePage = compilePage;
	module.exports.createHomePage = createHomePage;
	module.exports.createPage = createPage;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.getFileContent = getFileContent;
	module.exports.getNewPages = getNewPages;
	module.exports.savePage = savePage;
} ());
