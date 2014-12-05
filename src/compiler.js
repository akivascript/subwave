(function () {
	'use strict';

	var jade = require ('jade');
	var io = require ('./io');
	var arc = require ('./archives');
	var md = require ('markdown').markdown;

	var siteFilePath = 'resources/public/';
	var postsPath = 'posts/';
	var postsFilePath = siteFilePath + postsPath;
	var templatesPath = 'resources/templates/';

	function processPage (page) {
		var content, compiler, pagedata, matches,
			filename, output, path, pattern, srcfile, template;
		
		if (!page) {
			throw new Error ("processPage requires a page.");
		}

		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
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
			page.path = io.createPostDirectoryPath (pagedata.date, postsFilePath);
		} else if (page.type === "page") {
			template = templatesPath + 'page.jade';
		} else if (page.type === "archives") {
			template = templatesPath + 'archives.jade';
			page.filename = 'archives.html';
			page.path = 'resources/public/';
		} else {
			throw new Error ('Unable to determine template type from page.');
		}

		compiler = jade.compileFile (template, { pretty: true });
		page.output = compiler (page);

		return page;
	}

	function processDirectory (path) {
		var filelist, file, pages = [];

		if (!path) {
			throw new Error ('processDirectory requires an path.');
		}

		filelist = io.getFileList (path);

		filelist.forEach (function (entry) {
			file = io.readFile (path + entry);

			pages.push (processPage (file));
		});

		return pages;
	}
	
	function commitCompile (archives, entries) {
		archives = JSON.stringify (archives);

		io.writeFile ('resources/data/archives.dat', archives);
		io.savePage (processPage (archives));

		entries.forEach (function (entry) {
			io.savePage (entry);
		});
	}

	function compile () {
		var archives, entries, path;

		path = ('resources/inbox/');
		entries = processDirectory (path);
		archives = arc.process (entries);

		commitCompile (archives, entries, path);
	}

	compile ();

	module.exports.processPage = processPage;
} ());
