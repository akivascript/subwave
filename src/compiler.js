(function () {
	'use strict';

	var jade = require ('jade');
	var io = require ('./io');
	var md = require ('markdown').markdown;

	var parentDir = 'resources/public/';
	var postsPath = parentDir + 'posts/';
	var templatesPath = 'resources/templates/';

	function parsePage (page) {
		var content, compiler, pagedata, matches,
			filename, output, path, pattern, srcfile, template;
		
		if (!page) {
			throw new Error ("parsePage requires a page.");
		}

		pattern = /(\{(?:.|\n)+\})(?:\n)+((.|\n)+)/;
		matches = page.match (pattern);

		if (!matches || matches.length === 0) {
			throw new Error ("The file isn't the correct format.");
		}

		pagedata = JSON.parse (matches [1]);
		content = md.toHTML (matches [2]);

		page = {};

		for (var attr in pagedata) {
			page [attr] = pagedata [attr];
		}

		page.content = content;

		if (page.type === "post") {
			template = templatesPath + 'post.jade';
			page.filename = io.createPostFilename (pagedata.title, pagedata.date);
			page.path = io.createPostDirectoryPath (pagedata.date, postsPath);
		} else if (page.type === "page") {
			template = templatesPath + 'page.jade';
			//page.path = io.createPageDirectoryPath (pagesPath);
			//page.filename = io.createPageFilename (pagedata.title);
		}

		compiler = jade.compileFile (template, { pretty: true });
		page.output = compiler (page);

		return page;
	}

	function processDirectory (path) {
		var fileList, file, pages = [];

		if (!path) {
			throw new Error ('processDirectory requires an path.');
		}

		fileList = io.getFileList (path);

		fileList.forEach (function (post) {
			file = io.readFile (path + post);

			pages.push (parsePage (file));
		});

		pages.forEach (function (page) {
			io.savePage (page);
		});
	}

	processDirectory ('resources/inbox/');

	module.exports.parsePage = parsePage;
} ());
