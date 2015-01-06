// the inbox and generates necessary support pages such as archive.html.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');
	var fs = require ('fs-extra');

	var ar = require ('./archive');
	var cf = require ('../resources/config');
	var ho = require ('./home');
	var inf = require ('./info');
	var io = require ('./io');
	var mi = require ('./miniposts');
	var pa = require ('./pages');
	var po = require ('./posts');
	var rp = require ('./repository');
	var rs = require ('./rss');
	var ta = require ('./tags');

	var publish;


	// Ceci n'est pas un commentaire
	function buildSite () {
		var entries, files, pages, path, posts, repo;

		// Loads all of the files to be published
		files = pa.getPages (cf.paths.inbox);

		if (files.length === 0) {
			console.log ('No pages found to be built.');

			return 1;
		}

		// Loads an existing repo or creates a new one
		repo = _.compose (rp.getRepository, rp.loadRepository) ();

		// Publishes each type of content page
		_.each (cf.pages.content, function (type) {
			pages = pa.filterPages (files, type);

			if (pages.length > 0) {
				publish [type] (pages, repo);
			}
		});	

		// The following are calculated from content pages and are thus
		// handled separately.
		
		// index.html
		publish.home (repo);

		// archive.html
		publish.archive (repo.posts, repo.tags);

		// tags/[tag].html files
		publish.tags (repo);

		// RSS news feed
//		rs.updateRssFeed (repo);

		// And finally...
		
		// Support resources such as css and media files
		copyResources ();

		// Saves the state of the site
		rp.saveRepository (repo);
	}


	// This function copies all of the resource directories specified
	// in the configuration file to their published locations.
	function copyResources () {
		var files, targets;

		_.each (cf.resources, function (resource) {
			files = io.getFiles (cf.paths.resources + resource);

			_.each (files, function (path, file) { 
				io.copyFile (path + file,
										 cf.paths.output + resource + file);
			});
		});
	}


	// Clears out the public directory, copies everything from resource/archive
	// then builds the site again. Useful for when changing templates that affect the
	// entire site.
	function rebuildSite () {
		var files, path;

		files = [];

		if (cf.verbose) {
			console.log ('Rebuilding the site...');
		}

		io.cleanPublic ();

		files = io.getFiles (cf.paths.repository);

		for (var file in files) {
			path = files [file];

			if (file !== 'repository.json') {
				io.copyFile (path + file, cf.paths.inbox + file);
			}
		}

		io.cleanRepository ();

		buildSite ();
	}


	publish = {
		archive: ar.publishArchive,
		home: ho.publishHome,
		info: inf.publishInfo,
		mini: mi.publishMiniposts,
		post: po.publishPosts,
		tags: ta.publishTags
	};

	module.exports.buildSite = buildSite;
	module.exports.rebuildSite = rebuildSite;
} ());
