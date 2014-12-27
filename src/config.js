(function () {
	'use strict';

	var config = module.exports = {};


	config.blog = {
		title: 'Blog Title',
		description: 'Blog description',
		url: 'http://www.example.com',
		copyright: '&copy; 2014 Bob Sacamano',
	};
	config.paths = {
		resources: 'resources/',
		inbox: 'resources/' + 'inbox/',
		archive: 'resources/' + 'archive/',
		templates: 'resources/' + 'templates/',
		output: 'public/',
		posts: 'public/' + 'posts/',
		tags: 'public/' + 'tags/'
	};
	config.resources = ['css/', 'js/', 'img/'];
	config.verbose = false;
} ());
