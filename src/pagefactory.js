(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages').getExcerpt;


	function configure (page, callback) {
		var pg;

		pg = _.compose (callback, _.snapshot) (page);
		pg.template = cf.paths.templates + pg.type.toLowerCase () + '.jade';

		return pg;
	}


	function configureArchive (page) {
		return configure (page, function (pg) {
			pg.title = cf.archive.title;
			pg.filename = pg.title.toLowerCase ();
			pg.outputPath = cf.paths.output;
			
			if (!page.entries) {
				pg.entries = [];
			}

			return pg;
		});
	}


	function configureHome (page) {
		return configure (page, function (pg) {
			pg.filename = 'index';
			pg.outputPath = cf.paths.output;
			pg.tags = [];
			pg.title = cf.blog.title;

			if (!pg.posts) {
				pg.posts = [];
			}

			return pg;
		});
	}


	function configureInfo (page) {
		return configure (page, function (pg) {
			pg.filename = pg.title.toLowerCase ();
			pg.outputPath = cf.paths.output;

			return pg;
		});
	}


	function configureMini (page) {
		return configure (page, function (pg) {
			pg.date = convertStringToDate (pg.date);
			pg.filename = io.getPostFilename (pg.title, pg.date);
			pg.path = 'minis/';
			pg.outputPath = cf.paths.output;

			return pg;
		});
	}


	function configurePost (page) {
		return configure (page, function (pg) {
			pg.date = convertStringToDate (pg.date);
			pg.filename = io.getPostFilename (pg.title, pg.date);
			pg.path = io.getPostDirectoryPathname (pg.date);
			pg.outputPath = cf.paths.output + 'posts/';

			if (cf.index.useExcerpts) {
				pg.excerpt = getExcerpt (pg.content);
			}

			return pg;
		});
	}


	// Creates a page object that is used to configure an html page
	function createPage (page) {
		if (!page) {
			return undefined; // Should this be an empty object?
		}

		return module.internals ['configure' + _.capitalize (page.type)] (page);
	}


	// Takes a string in the format of 'YYYY-MM-DD HH:MM' and returns a
	// Date object.
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}


	// Create an excerpt for a post.
	function getExcerpt (postBody) {
		var excerpt, output;

		excerpt = postBody.match (/<excerpt>((.|\s)+?)<\/excerpt>/);

		if (excerpt) {
			output = excerpt [1];
		} else {
			output = postBody;
		}

		return output;
	}


	_.mixin ({
		capitalize: function (string) {
			return string.charAt (0).toUpperCase () + 
				string.substring (1).toLowerCase ();
		}
	});


	module.internals = {
		configureArchive: configureArchive,
		configureHome: configureHome,
		configureInfo: configureInfo,
		configurePost: configurePost
	};

	module.exports.createPage = createPage;
	module.exports.getExcerpt = getExcerpt;
} ());
