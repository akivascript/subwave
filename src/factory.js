(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $io = require ('./io');
	


	function configure (page, callback) {
		var pg;

		pg = _.compose (callback, _.snapshot) (page);
		pg.template = $config.paths.templates + pg.type.toLowerCase () + '.jade';

		return pg;
	}


	function configureArchive (page) {
		return configure (page, function (pg) {
			pg.title = $config.archive.title;
			pg.filename = pg.title.toLowerCase ();
			pg.outputPath = $config.paths.output;
			
			if (!page.entries) {
				pg.entries = [];
			}

			return pg;
		});
	}


	function configureHome (page) {
		return configure (page, function (pg) {
			pg.filename = 'index';
			pg.outputPath = $config.paths.output;
			pg.tags = [];
			pg.title = $config.blog.title;

			if (!pg.posts) {
				pg.posts = [];
			}

			return pg;
		});
	}


	function configureInfo (page) {
		return configure (page, function (pg) {
			pg.filename = pg.title.toLowerCase ();
			pg.outputPath = $config.paths.output;

			return pg;
		});
	}


	function configureMini (page) {
		return configure (page, function (pg) {
			pg.path = $config.miniposts.title.toLowerCase () + '/';
			pg.outputPath = $config.paths.output;

			if (!pg.id) {
				pg.id = generateId ();
			}

			return pg;
		});
	}


	function configurePost (page) {
		return configure (page, function (pg) {
			pg.date = convertStringToDate (pg.date);
			pg.filename = $io.getPostFilename (pg.title, pg.date);
			pg.path = $io.getPostDirectoryPathname (pg.date);
			pg.outputPath = $config.paths.output + 'posts/';

			if (!pg.id) {
				pg.id = generateId ();
			}

			if ($config.index.useExcerpts) {
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


	function generateId () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
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
		configureMini: configureMini,
		configurePost: configurePost
	};

	module.exports.createPage = createPage;
	module.exports.generateId = generateId;
	module.exports.getExcerpt = getExcerpt;
} ());
