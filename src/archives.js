(function () {
	'use strict';

	var jade = require ('jade');
	var archives = {};

	function addEntries (entry) {
		var contains, listing = {};

		listing.title = entry.title;
		listing.date = entry.date;
		listing.url = entry.path + '/' + entry.filename;

		contains = archives.entries.filter (function (n) {
			return JSON.stringify (n) === JSON.stringify (listing);
		});

		if (!contains || contains.length === 0) {
			archives.entries.push(listing);
		}
	}

	function process (entries) {
		var contains, count, file, listing, page;

		file = 'ressources/data/archives.dat';

		try {
			archives = JSON.parse (io.readFile (file));
		} catch (e) {
			archives = {
				"type": "archives",
				"entries": []
			};
		}

		entries.forEach (addEntries);

		return archives;
	}

	module.exports.process = process;
} ());
