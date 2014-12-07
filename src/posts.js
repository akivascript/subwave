(function () {
	'use strict';

	var io = require ('./io');

	var archivesFilePath	= 'resources/archives/';
	var siteFilePath 			= 'resources/public/';
	var postsPath 				= 'posts/';
	var postsFilePath 		= siteFilePath + postsPath;

	// Archives a processed post by moving it from inbox to archives.
	function movePost (filename) {
		
	}

	function process (post) {
		var archivePath;
		
		archivePath 	= io.createPostDirectoryPath (post.date, archivesFilePath + postsPath);
		post.filename	= io.createPostFilename (post.title, post.date);
		post.path 		= io.createPostDirectoryPath (post.date, postsFilePath);
		post.location = archivePath + '/' + post.filename + '.md';

		return post;
	}
	
	module.exports.process = process;
} ());
