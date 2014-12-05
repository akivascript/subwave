(function () {
	'use strict';

	var jade = require ('jade');
	var archives = {};

	function addEntries (entry) {
		var contains, listing = {};

		listing.title = entry.title;
		listing.date = entry.date;
		listing.uri = entry.path + '/' + entry.filename + '.html';
		listing.location = entry.location;

		contains = archives.entries.filter (function (n) {
			return JSON.stringify (n) === JSON.stringify (listing);
		});

		if (!contains || contains.length === 0) {
			archives.entries.push(listing);
		}
	}

	function process (entries) {
		var contains, count, file, listing, page;

		file = 'resources/data/archives.json';

		try {
			archives = JSON.parse (io.readFile (file));
		} catch (e) {
			archives = {
				"type": "archives",
				"entries": []
			};
		}

		entries.forEach (function (entry, index, entries) {
			var extension, next, previous;

			extension = '.html';
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
				entry.next.uri = next.path + '/' + next.filename;
				entry.next = next.path + '/' + next.filename + '.html';
			}
		});

		entries.forEach (addEntries);

		return archives;
	}

	module.exports.process = process;
} ());
