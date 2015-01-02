// This file brings together functions related to the creation and upkeep of
// the 'archives.html' file.
(function () {
	'use strict';

	var jade = require ('jade');
	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');

	
	// Compile archives.html through Jade.
	function compileArchives (page, tags) {
		var compileFn;

		compileFn = function (page) {
			_.map (page.posts, function (post) {
				post.path = io.getPostDirectoryPathname (new Date (post.date));
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.title = pa.convertToHtml (post.title);
			});
		};

		return pa.compilePage (page, tags, compileFn);
	}


	// Copies relevant metadata from one page to another.
	function copyPostData (source) {
		var attributes;

		attributes = ['author', 'date', 'filename', 'index', 'tags', 'title'];

		return pa.copyPageData (source, attributes);
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

		archives.posts = _.map (posts, function (post) {
			return copyPostData (post);
		});

		return archives;
	}


	// This... maybe unnecessary. Hold tight.
	function createNewArchiveEntries (files) {
		var entries;

		entries = [];

		_.each (files, function (file) {
			if (file.type === 'post') {
				entries.push (copyPostData (file));
			}
		});

		return entries.sort (po.comparePosts);
	}


	// Compiles archives.html and commits it to disk.
	function saveArchives (archives, tags) {
		archives.output = compileArchives (archives, tags);

		io.saveHtmlPage (archives);
	}


	module.exports.createArchives = createArchives;
	module.exports.createNewArchiveEntries = createNewArchiveEntries;
	module.exports.saveArchives = saveArchives;
} ());
