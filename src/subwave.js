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

	var verbose = false;

	subwave
		.command ('build')
		.description ('Build a new iteration of the site')
		.action (function () {
			co.compile ();

			process.exit ();
		});

	subwave
		.version ('0.8')
		.option ('-cp, --clean-public', 'Clean /public directories')
		.option ('-ca, --clean-archive', 'Clean /resources/archive directories')
		.option ('-v, --verbose', 'Be chatty about what\'s being done');

	subwave.parse (process.argv);

	if (subwave.verbose) {
		verbose = true;
	}
		
	if (subwave.cleanPublic) {
		io.cleanPublic (verbose);
	}

	if (subwave.cleanArchive) {
		io.cleanArchive (verbose);
	}
} ());
