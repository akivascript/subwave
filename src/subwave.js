#!/usr/bin/env node

// The gateway to the subwave garden of blogonomic delights. Sooner or later it'll
// contain some argument switches which will allow a user to do things like force
// a complete site rebuild. It will also eventually do some initialization work such
// as loading a configuration options.
(function () {
	'use strict';

	var subwave = require ('commander');

	var co = require ('./compiler');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');

	var verbose = false;


	subwave
		.command ('build')
		.description ('Build a new iteration of the site')
		.action (function () {
			co.compile (verbose);

			process.exit ();
		});

	subwave
		.command ('new-post')
		.description ('Create a new post')
		.action (function () {
			io.createNewFile ('post');

			process.exit ();
		});

	subwave
		.command ('new-page')
		.description ('Create a new page')
		.action (function () {
			io.createNewFile ('page');

			process.exit ();
		});

	subwave
		.command ('rebuild')
		.description ('Cleans and rebuilds entire site')
		.action (function () {
			co.rebuild (verbose);

			process.exit ();
		});

	subwave
		.command ('get-post [index]')
		.description ('Copies a post to the inbox for updating')
		.action (function (index) {
			po.copyPostFromArchive (index, verbose);

			process.exit ();
		});

	subwave
		.command ('find-post [criterion]')
		.description ('Returns a list of qualifying posts (does NOT search post content)') 
		.action (function (criterion) {
			var post, posts;

			posts = po.findPosts (criterion);

			console.log ('Found:');

			for (var i = 0; i < posts.length; i++) {
				post = posts [i];

				console.log (post.title + ' from ' + pa.formatDateForDisplay (post.date) +
										 ' at index ' + post.index + '.');
			}
			
			process.exit ();
		});
			
	subwave
		.version ('0.8')
		.option ('-cp, --clean', 'Clean /public directories')
		.option ('-ca, --clean-archive', 'Clean /resources/archive directories')
		.option ('-v, --verbose', 'Be chatty about what\'s being done');

	try {
		subwave.parse (process.argv);
	} catch (e) {
		console.log (e.stack);

		process.exit ();
	}

	if (subwave.verbose) {
		verbose = true;
	}
		
	if (subwave.clean) {
		io.cleanPublic (verbose);
	}

	if (subwave.cleanArchive) {
		io.cleanArchive (verbose);
	}
} ());
