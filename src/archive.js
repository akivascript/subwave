// This file brings together functions related to the creation and upkeep of
// the 'archive.html' file.
(function () {
	'use strict';

	var jade = require ('jade');
	var _ = require ('underscore-contrib');

	var io = require ('./io');
	var pa = require ('./pages');


	function addEntryToArchive (entries, post) {
		entries = _.snapshot (entries);
		post = _.pick (post, 'path', 'filename', 'title', 'displayDate');
		
		entries.push (post);

		return entries;
	}


	// Compile archive.html through Jade.
	function compileArchive (page, tags) {
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


	// Creates a new, empty archive.
	function createArchive () {
		return { 
			type: 'archive'
		};
	}


	function createArchiveEntry (post) {
		var attributes;

		attributes = ['author', 'date', 'filename', 'index', 'tags', 'title'];

		return pa.copyObject (post, attributes);
	}


	// Creates an archive page from all of the published posts stored
	// in the repository.
	function publishArchive (posts, tags) {
		var archive;

		archive = _.compose (pa.createPage, createArchive) ();

		archive.entries = _.reduce (posts, function (res, post) {
			return res.concat (addEntryToArchive (archive.entries, post));
		}, []);
			
		saveArchive (archive, tags);
	}


	// Compiles archive.html and commits it to disk.
	function saveArchive (archive, tags) {
		archive.output = compileArchive (archive, tags);
		
		io.saveHtmlPage (archive);
	}


	module.exports.createArchiveEntry = createArchiveEntry;
	module.exports.publishArchive = publishArchive;
} ());
