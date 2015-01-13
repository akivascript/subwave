(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $io = require ('./io');
	


	function configure (page, callback) {
		var pg;

		if (callback) {
			pg = callback (page);
		}

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


	function configureLink (page) {
		return configure (page, function (pg) {
			pg.path = 'links/';
			pg.outputPath = $config.paths.output;

			if (!pg.id) {
				pg.id = generateId ();
			}

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
			pg.filename = $io.getPostFilename (pg.title, pg.date);
			pg.path = $io.getPostDirectoryPathname (pg.date);
			pg.outputPath = $config.paths.output + 'posts/';

			return pg;
		});
	}


	function configureTag (page) {
		return configure (page, function (pg) {
			pg.filename = pg.name.toLowerCase ();
			pg.outputPath = $config.paths.output + 'tags/';

			return pg;
		});
	}


	function configureTaglist (page) {
		return configure (page, function (pg) {
			pg.filename = 'index';
			pg.outputPath = $config.paths.output + 'tags/';

			return pg;
		});
	}


	// Creates a page object that is used to configure an html page
	function createPage (page) {
		var name;

		if (!page) {
			return {}; 
		}

		name = _.compose (_.capitalize, _.camelCase) (page.type);

		return module.internals ['configure' + name] (page);
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
			return string.charAt (0).toUpperCase () + string.substring (1);
		}
	});

	// This allows us to refer to functions dynamically.
	module.internals = {
		configureArchive: configureArchive,
		configureHome: configureHome,
		configureInfo: configureInfo,
		configureLink: configureLink,
		configureMini: configureMini,
		configurePost: configurePost,
		configureTag: configureTag,
		configureTaglist: configureTaglist
	};

	module.exports.createPage = createPage;
	module.exports.generateId = generateId;
	module.exports.getExcerpt = getExcerpt;
} ());
