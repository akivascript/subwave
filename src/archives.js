// This file brings together functions related to the creation and upkeep of
// the 'archives.html' file.
(function () {
	'use strict';

	var jade = require ('jade');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');

	
	// Compile archives.html through Jade.
	function compile (archives, tags) {
		var compiler, i, locals, post;

		compiler = jade.compileFile (archives.template, { pretty: true });

		for (i = 0; i < archives.posts.length; i++) {
			post = archives.posts [i];

			post.path = io.getPostDirectoryPathname (new Date (post.date));
			post.displayDate = pa.formatDateForDisplay (post.date);
			post.title = pa.convertToHtml (post.title);
		}

		locals = {
			page: archives,
			tags: Object.keys (tags),
			config: config
		};

		return compiler (locals);
	}


	// Copies relevant metadata from one page to another.
	function copyPostData (source) {
		var target;

		target = {};
		target.index = source.index;
		target.title = source.title;
		target.date = source.date;
		target.author = source.author;
		target.filename = source.filename;
		target.tags = source.tags;

		return target;
	}


	// Creates a new archives object. The archives.html file is recreated each time
	// a post is added to the blog.
	function createArchives (posts) {
		var archives, i, post;

		archives = {
			type: "archives",
			title: "Archives",
			posts: []
		};

		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			archives.posts.push (copyPostData (post));
		}

		return archives;
	}


	// This... maybe unnecessary. Hold tight.
	function createNewArchiveEntries (files) {
		var i, entries;

		entries = [];

		for (i = 0; i < files.length; i = i + 1) {
			if (files [i].type === 'post') {
				entries.push (copyPostData (files [i]));
			}
		}

		return entries.sort (po.comparePosts);
	}


	// Compiles archives.html and commits it to disk.
	function saveArchives (archives, tags) {
		archives.output = compile (archives, tags);

		io.saveHtmlPage (archives);
	}


	module.exports.createArchives = createArchives;
	module.exports.createNewArchiveEntries = createNewArchiveEntries;
	module.exports.saveArchives = saveArchives;
} ());
