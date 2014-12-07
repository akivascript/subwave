(function () {
	'use strict';

	var jade = require ('jade');
	
	var archives = {
		type: "archives",
		entries: []
	};

	function addEntry (entry) {
		var contains, listing = {};

		listing.title			= entry.title;
		listing.date 			= entry.date;
		listing.uri 			= entry.path + '/' + entry.filename + '.html';
		listing.location 	= entry.location;

		// Avoids duplicating entries into the table of contents
		contains = archives.entries.filter (function (n) {
			return JSON.stringify (n) === JSON.stringify (listing);
		});

		if (!contains || contains.length === 0) {
			archives.entries.push (listing);
		}
	}

	function getArchives () {
		var file;

		file = 'resources/data/archives.json';

		try {
			archives.entries = JSON.parse (io.readFile (file));
		} catch (e) {
			// If there's no archive.json file, we'll start with 
			// a new, empty one. In other words, nothing to do here.
		}

		return archives;
	}

	function process (entries) {
		var index;

		if (!entries) {
			throw new Error ('process needs entries.');
		}

		entries.forEach (addEntry);

		index = archives.entries.length - entries.length;
		
		entries.forEach (function (entry) {
			var next, previous;

			next 			= archives.entries [index + 1];
			previous 	= archives.entries [index - 1];

			if (previous) {
				entry.previous = {};

				entry.previous.title 	= previous.title;
				entry.previous.date 	= previous.date;
				entry.previous.uri 		= previous.uri;
			}

			if (next) {
				entry.next = {};

				entry.next.title 			= next.title;
				entry.next.date 			= next.date;
				entry.next.uri 				= next.uri;
			}

			index = index + 1;
		});

		return archives;
	}

	module.exports.process 			= process;
	module.exports.getArchives 	= getArchives;
} ());
