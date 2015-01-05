(function () {
	'use strict';

	var config = module.exports = {};

	config.archive = {
		title: 'Archive'
	};
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
		postCount: 3,
		useExcerpts: true
	};
	config.pages = {
		content: ['post', 'info', 'mini']
	};
	config.paths = {
		inbox: 'resources/' + 'inbox/',
		output: 'public/',
		repository: 'resources/' + 'repository/',
		resources: 'resources/',
		templates: 'resources/' + 'templates/',
	};
	config.resources = ['css/', 'js/', 'img/'];
	config.rss = { 
		filename: 'rss.xml',
		postCount: 5,
		useExcerpts: true
	};
	config.verbose = false;
} ());
