(function () {
	'use strict';

	var jade = require ('jade');
	var io = require ('./io');
	var archive = require ('./archives');
	var posts = require ('./posts');
	var md = require ('markdown').markdown;

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
			page.template = templatesPath + 'post.jade';

			page = posts.process (page);
		} else if (page.type === "page") {
			page.template = templatesPath + 'page.jade';
		} else if (page.type === "archives") {
			page.template = templatesPath + 'archives.jade';
			page.filename = 'archives.html';
			page.path = 'resources/public/';
		} else {
			throw new Error ('Unable to determine template type from page.');
		}

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
		io.writeFile ('resources/data/archives.json', JSON.stringify (archives.entries));
		io.writeFile (archives.path + archives.filename, archives.output);

		entries.forEach (function (entry) {
			io.savePage (entry);
		});
	}

	function compile () {
		var archives, archivesCompiler, entriesCompiler, entries, path;

		// TODO: Oof, this needs to be cleared up.
		path = ('resources/inbox/');

		entries = processDirectory (path);
		archives = archive.getArchives ();
		archives = archive.process (entries, archives);
		archives = processPage (JSON.stringify (archives));
		archivesCompiler = jade.compileFile (archives.template, { pretty: true });
		archives.output = archivesCompiler (archives);

		entries.forEach (function (entry) {
			entriesCompiler = jade.compileFile (entry.template, { pretty: true });
			entry.output = entriesCompiler (entry);
		});

		commitCompile (archives, entries, path);
	}

	compile ();

	module.exports.processPage = processPage;
} ());
