// This file brings together functions related to the creation and upkeep of
// the 'archives.html' file.
(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');

	var io = require ('./io');
	var pa = require ('./pages');

	// Compile archives.html through Jade.
	function compile (archives) {
		var compiler;

		compiler = jade.compileFile (archives.template, { pretty: true });

		archives.posts.reverse (); // Reverse ordering so newest is at the top

		archives.posts.forEach (function (post) {
			post.displayDate = pa.formatDateForDisplay (post.date);
			post.title = marked (post.title);
		});

		return compiler (archives);
	}

	// Copies relevant metadata from one page to another.
	function copyPostData (source) {
		var target;

		target = {};
		target.title = source.title;
		target.date = source.date;
		target.author = source.author;
		target.filename = source.filename;
		target.path = source.path;
		target.tags = source.tags;

		return target;
	}

	// Creates a new archives object. The archives.html file is recreated each time
	// a post is added to the blog.
	function createArchives (posts) {
		var archives;

		archives = {
			type: "archives",
			title: "Archives",
			posts: []
		};

		posts.forEach (function (post) {
			archives.posts.push (copyPostData (post));
		});

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

		return entries;
	}

	// Compiles archives.html and commits it to disk.
	function saveArchives (archives) {
		archives.output = compile (archives);

		io.saveHtmlPage (archives);
	}

	module.exports.createArchives = createArchives;
	module.exports.createNewArchiveEntries = createNewArchiveEntries;
	module.exports.saveArchives = saveArchives;
} ());
