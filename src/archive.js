// This file brings together functions related to the creation and upkeep of
// the 'archive.html' file.
(function () {
	'use strict';

	var jade = require ('jade');
	var _ = require ('underscore-contrib');

	var $io = require ('./io');
	var $pages = require ('./pages');


	// Compile archive.html through Jade.
	function compileArchive (page, tags) {
		var compileFn;

		compileFn = function (page) {
			_.map (page.posts, function (post) {
				post.path = $io.getPostDirectoryPathname (new Date (post.date));
				post.displayDate = $pages.formatDateForDisplay (post.date);
				post.title = $pages.convertToHtml (post.title);
			});
		};

		return $pages.compilePage (page, tags, compileFn);
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

		return $pages.copyObject (post, attributes);
	}


	function processItem (item) {
		item.displayDate = $pages.formatDateForDisplay (item.date);
		item.displayTitle = $pages.convertToHtml (item.title);

		return item;
	}


	// Creates an archive page from all of the published posts stored
	// in the repository.
	function publishArchive (posts, tags) {
		var archive;

		archive = _.compose ($pages.createPage, createArchive) ();

		archive.entries = _.map (posts, function (post) {
			return processItem (post);
		});
			
		saveArchive (archive, tags);
	}


	// Compiles archive.html and commits it to disk.
	function saveArchive (archive, tags) {
		archive.output = compileArchive (archive, tags);
		
		$io.saveHtmlPage (archive);
	}


	module.exports.publishArchive = publishArchive;
} ());
