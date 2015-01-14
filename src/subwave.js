#!/usr/bin/env node

// The gateway to the subwave garden of blogonomic delights. Sooner or later it'll
// contain some argument switches which will allow a user to do things like force
// a complete site rebuild. It will also eventually do some initialization work such
// as loading a configuration options.
(function () {
	'use strict';

	var subwave = require ('commander');

	var config = require ('../config');
	var co = require ('./compiler');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');

	var verbose = false;


	subwave
		.command ('build')
		.description ('Build a new iteration of the site')
		.action (function () {
			co.buildSite (verbose);

			process.exit ();
		});

	subwave
		.command ('gen-id')
		.description ('Create a new ID')
		.action (function () {
			console.log (pa.generateId ());

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
			co.rebuildSite (verbose);

			process.exit ();
		});

	subwave
		.command ('get-post [index]')
		.description ('Copies a post to the inbox for updating')
		.action (function (index) {
			po.copyPostFromRepository (index, verbose);

			process.exit ();
		});
			
	subwave
		.version ('0.8')
		.option ('-cp, --clean', 'Clean /public directories')
		.option ('-ca, --clean-repo', 'Clean /resources/repository directories')
		.option ('-v, --verbose', 'Be chatty about what\'s being done');


	if (subwave.verbose) {
		config.verbose = true;
	}
		
	if (subwave.clean) {
		io.removeDirectory (config.paths.output);
	}

	if (subwave.cleanRepo) {
		io.removeDirectory (config.paths.repository);
	}

	function main () {
		try {
			subwave.parse (process.argv);
		} catch (e) {
			console.log (e.stack);

			process.exit ();
		}
	}

	main ();
} ());
