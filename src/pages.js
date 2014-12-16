(function () {
	'use strict';

	var jade = require ('jade');
	var mkdwn = require ('markdown').markdown;
	var moment = require ('moment');

	var io = require ('./io');

	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	function compilePage (page, fn) {
		var compiler;

		compiler = jade.compileFile (page.template, { pretty: true });

		page.displayDate = formatDateForDisplay (page.date);

		return compiler (page);
	}
	
	function createHomePage (posts) {
		var homePage;

		homePage = {
			type: 'index',
			title: 'Backed Up Somewhere',
			filename: 'index',
			posts: posts,
			template: io.templatesPath + 'index.jade'
		};

		return homePage;
	}

	// Converts a file into a page. A file has some front matter which is converted
	// to JSON. This front matter is used to configure the page, determine its type,
	// and so forth
	function createPage (source) {
		var content, compiler, page, metadata, matches, filename, pattern, template;

		// Matches '{key: value, key: value, ...} content ...'
		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
		matches = source.match (pattern);

		if (!matches || matches.length === 0) {
			throw {
				type: 'Error',
				message: 'The file isn\'t the correct format.'
			};
		}

		metadata = JSON.parse (matches [1]);
		page = {};

		for (var attr in metadata) {
			page [attr] = metadata [attr];
		}

		content = mkdwn.toHTML (matches [2]);

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
	
	function formatDateForDisplay (date) {
		var postDate;

		postDate = moment (date);

		return postDate.format ('MMMM DD, YYYY');
	}

	function savePage (page) {
		page.output = compilePage (page);

		io.savePage (page);
	}

	module.exports.compilePage = compilePage;
	module.exports.createHomePage = createHomePage;
	module.exports.createPage = createPage;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.savePage = savePage;
} ());
