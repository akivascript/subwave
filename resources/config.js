(function () {
	'use strict';

	var config = module.exports = {};

	config.blog = {
		title: 'Blog Title',
		description: 'Blog description',
		url: 'http://www.example.com',
		copyright: '&copy; 2014 Bob Sacamano',
		dateFormat: 'MMMM DD, YYYY'
	};
	config.htmlElements = {
		scrub: ['excerpt']
	};
	config.index = {
		useExcerpts: true,
		postCount: 3
	};
	config.paths = {
		resources: 'resources/',
		inbox: 'resources/' + 'inbox/',
		repository: 'resources/' + 'repository/',
		templates: 'resources/' + 'templates/',
		output: 'public/',
		posts: 'public/' + 'posts/',
		tags: 'public/' + 'tags/'
	};
	config.resources = ['css/', 'js/', 'img/'];
	config.rss = { 
		useExcerpts: true,
		postCount: 5
	};
	config.verbose = false;
} ());
