(function () {
	'use strict';

	var jade = require ('jade');
	var sub_compiler = require ('./compiler');
	var sub_io = require ('./io');
	var sub_posts	= require ('./posts');
	
	var archives = {
		type: "archives",
		title: "Archives",
		posts: []
	};

	function addPost (post) {
		var contains, listing = {};

		listing.title	= post.title;
		listing.date = post.date;
		listing.uri	= post.path + '/' + post.filename + '.html';
		listing.location = post.location;

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
			archives.posts = JSON.parse (sub_io.readFile (file));
		} catch (e) {
			// If no archives.json, assume we're starting from scratch
			// so do nothing about the lack of that file existing
		}

		return archives;
	}

	module.exports.addPost = addPost;
	module.exports.getArchives = getArchives;
} ());
