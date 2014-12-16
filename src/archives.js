(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pa = require ('./pages');

	function compile (archives) {
		var compiler;

		compiler = jade.compileFile (archives.template, { pretty: true });

		archives.posts.reverse (); // Reverse ordering so newest is at the top

		archives.posts.forEach (function (post) {
			post.displayDate = pa.formatDateForDisplay (post.date);
		});

		return compiler (archives);
	}

	function createArchives (posts) {
		var archives;

		archives = {
			type: "archives",
			title: "Blog Title - Archives",
			posts: posts
		};

		return archives;
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
			newEntry.tags = posts [i].tags;

			newEntries.push (newEntry);
		}

		return newEntries;
	}

	function saveArchives (archives) {
		archives.output = compile (archives);

		io.savePage (archives);
	}

	module.exports.createArchives = createArchives;
	module.exports.createNewEntries = createNewEntries;
	module.exports.saveArchives = saveArchives;
} ());
