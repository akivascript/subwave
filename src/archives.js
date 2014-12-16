(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pr = require ('./processor');

	function compile (archives) {
		var compiler;

		archives.posts.reverse (); // Reverse ordering so newest is at the top

		compiler = jade.compileFile (archives.template, { pretty: true });

		archives.posts.forEach (function (post) {
			post.displayDate = pr.formatDateForDisplay (post.date);
		});

		return compiler (archives);
	}

	function createNewEntries (posts) {
		var i, newEntry, newEntries;

		newEntries = [];

		for (i = 0; i < posts.length; i = i + 1) {
			newEntry = {};
			newEntry.title = posts [i].title;
			newEntry.date = posts [i].date;
			newEntry.filename = posts [i].filename;
			newEntry.path = posts [i].path;

			newEntries.push (newEntry);
		}

		return newEntries;
	}

	function getArchives () {
		var archives, file;

		archives = {
			type: "archives",
			title: "Archives",
			posts: []
		};

		file = 'resources/data/archives.json';

		try {
			archives.posts = JSON.parse (io.readFile (file));
		} catch (e) {
			// If no archives.json, assume we're starting from scratch
			// so do nothing about the lack of that file existing
		}

		return archives;
	}

	function saveArchives (archives) {
		io.writeFile ('resources/data/archives.json', JSON.stringify (archives.posts));

		archives.output = compile (archives);

		io.savePage (archives);
	}

	module.exports.createNewEntries = createNewEntries;
	module.exports.getArchives = getArchives;
	module.exports.saveArchives = saveArchives;
} ());
