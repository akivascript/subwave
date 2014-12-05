(function () {
	'use strict';

	var jade = require ('jade');
	var archives = {};

	function addEntry (entry) {
		var contains, listing = {};

		listing.title = entry.title;
		listing.date = entry.date;
		listing.uri = entry.path + '/' + entry.filename + '.html';
		listing.location = entry.location;

		contains = archives.entries.filter (function (n) {
			return JSON.stringify (n) === JSON.stringify (listing);
		});

		if (!contains || contains.length === 0) {
			archives.entries.push (listing);
		}

		return archives.entries.length - 1;
	}

	function getArchives () {
		var file;

		file = 'resources/data/archives.json';

		try {
			archives = JSON.parse (io.readFile (file));
		} catch (e) {
			archives = {
				"type": "archives",
				"entries": []
			};
		}

		return archives;
	}

	function process (entries, archives) {
		var contains, count, listing, page;

		if (!entries) {
			throw new Error ('process needs entries.');
		}

		if (!archives) {
			archives = getArchives ();
		}

		// Adds each new entry to the archives vector
		entries.forEach (addEntry);

		entries.forEach (function (entry, index, entries) {
			var next, previous;

			next = entries [index + 1];
			previous =  entries [index - 1];

			if (previous) {
				entry.previous = {};
				
				entry.previous.title = previous.title;
				entry.previous.date = previous.date;
				entry.previous.uri = previous.path + '/' + previous.filename + '.html';
			}

			if (next) {
				entry.next = {};
				
				entry.next.title = next.title;
				entry.next.date = next.date;
				entry.next.uri = next.path + '/' + next.filename + '.html';
			}
		});

		return archives;
	}

	module.exports.process = process;
	module.exports.getArchives = getArchives;
} ());
