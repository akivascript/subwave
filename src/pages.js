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
	

	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	// Runs a page through Jade so that it is formatted for display.
	function compilePage (page, tags) {
		var compiler, locals;

		compiler = jade.compileFile (page.template, { pretty: true });

		page.displayDate = formatDateForDisplay (page.date);
		page.headTitle = page.title;
		page.title = marked (page.title);
		
		if (page.content) {
			page.content = marked (page.content);
		}

		locals = {
			page: page,
			tags: Object.keys (tags)
		};

		return compiler (locals);
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

	function copyPageFromArchive (index, verbose) {
		var filename, date, post, path, state;

		if (index) {

			state = st.getState ();
			post = st.getPostByIndex (index, state.posts);

			if (!post) {
				throw new Error ('Unable to find post with index ' + index + '.');
			}

			date = formatDateForDisplay (post.date);
			path = io.getPostDirectoryPathname (post.date);

			if (verbose) {
				console.log ('Copying from ' + config.path.archive + 'posts/' + path + post.filename + '.md' +
									 ' to ' +	config.path.inbox + post.filename + '.md');
			}
			
				io.copyFile (config.path.archive + 'posts/' + path + post.filename + '.md',
										 config.path.inbox + post.filename + '.md');

			console.log (post.title + ' from ' + date + ' ready for editing.');
		} else {
			throw new Error ('Please provide an index.');
		}
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
			file = io.readFile (config.path.archive + 'posts/' + entry.path + entry.filename + '.md');
			entry.content = getContent (file, false);
			entry.displayTitle = marked (entry.title);
			entry.displayDate = formatDateForDisplay (entry.date);

			if (entry.content) {
				entry.excerpt = getExcerpt (marked (entry.content));
			}

			entries.push (entry);
		}

		homePage = {
			type: 'index',
			title: 'Blog Title',
			filename: 'index',
			posts: entries,
			tags: [],
			template: config.path.templates + 'index.jade'
		};

		return homePage;
	}

	// Converts a file into a page. A file has some front matter which is converted
	// to JSON. This front matter is used to configure the page, determine its type,
	// and so forth
	function createPage (file) {
		var attr, content, compiler, filename, i, metadata, matches, page;

		matches = parseFile (file);

		page = copyAttributes (JSON.parse (matches [1]));

		content = matches [2];

		if (content) {
			page.content = content;
		}

		if (page.type === 'post') {
			page.template = config.path.templates + 'post.jade';
			page.date = convertStringToDate (page.date);
			page.filename = io.getPostFilename (page.title, page.date);
			page.path = io.getPostDirectoryPathname (page.date);
		} else if (page.type === 'page') {
			page.template = config.path.templates + 'page.jade';
			page.filename = page.title.toLowerCase ();
		} else if (page.type === 'archives') {
			page.template = config.path.templates + 'archives.jade';
			page.filename = 'archives';
		} else {
			throw new Error ('Unable to determine template type from page: ' + page);
		}

		return page;
	}

	function formatDateForDisplay (date) {
		var postDate;

		postDate = moment (date);

		return postDate.format ('MMMM DD, YYYY');
	}

	// Create an excerpt for a post.
	//
	// The excerpt is 140 words or less but it is drawn against <p></p> content
	// only. It skips any other tags, such as <h3> or <img>.
	function getExcerpt (content) {
		var count, excerpt, graf, i, paragraphs, total;

		count = 0;
		total = 0;
		excerpt = [];
		paragraphs = content.split (/\n/);

		for (i = 0; i < paragraphs.length; i++) {
			graf = paragraphs [i];

			if (graf.search (/(<p>.+<\/p>)+/) !== -1) {
				count = graf.split (' ').length;
				
				if (total + count < 141) {
					excerpt.push (graf);

					total = total + count;
				} else {
					break;
				}
			} else {
				excerpt.push (graf);
			}
		}

		return excerpt.join ('\n');
	}

	// Parses a file and returns only its content (e.g., the body of a post).
	function getContent (file, marked) {
		if (marked) {
			return marked (parseFile (file)) [2];
		}
		
		return parseFile (file) [2];
	}

	// Parses a file and returns only its metadata.
	function getMetadata (file) {
		return parseFile (file) [1];
	}

	// An indirector for clarity.
	function getNewPages () {
		return io.readFiles (config.path.inbox, createPage);
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

	function copyPage (index) {

	}

	// Compile and commit HTML file to disk.
	function savePage (page, tags) {
		page.output = compilePage (page, tags);

		io.saveHtmlPage (page);
	}

	module.exports.compilePage = compilePage;
	module.exports.createHomePage = createHomePage;
	module.exports.createPage = createPage;
	module.exports.copyAttributes = copyAttributes;
	module.exports.copyPageFromArchive = copyPageFromArchive;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.getExcerpt = getExcerpt;
	module.exports.getContent = getContent;
	module.exports.getMetadata = getMetadata;
	module.exports.getNewPages = getNewPages;
	module.exports.savePage = savePage;
} ());
