(function () {
	'use strict';

	var jade = require ('jade');
	var io = require ('./io');
	
	var archives = {
		type: "archives",
		title: "Archives",
		posts: []
	};

	function addPost (post) {
		var contains, listing = {};

		listing.title	= post.title;
		listing.date = post.date;
		listing.filename = post.filename;
		listing.path = post.path;

		// Avoids duplicating entries into the table of contents
		contains = archives.posts.filter (function (n) {
			return JSON.stringify (n) === JSON.stringify (listing);
		});

		if (!contains || contains.length === 0) {
			archives.posts.push (listing);
		}
	}

	function getArchives () {
		var file;

		file = 'resources/data/archives.json';

		try {
			archives.posts = JSON.parse (io.readFile (file));
		} catch (e) {
			// If no archives.json, assume we're starting from scratch
			// so do nothing about the lack of that file existing
		}

		return archives;
	}

	module.exports.addPost = addPost;
	module.exports.getArchives = getArchives;
} ());
