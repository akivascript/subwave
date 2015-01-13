// the inbox and generates necessary support pages such as archive.html.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $archive = require ('./archive');
	var $config = require ('../config');
	var $home = require ('./home');
	var $info = require ('./info');
	var $io = require ('./io');
	var $links = require ('./links');
	var $miniposts = require ('./miniposts');
	var $pages = require ('./pages');
	var $posts = require ('./posts');
	var $repository = require ('./repository');
	var $rss = require ('./rss');
	var $tags = require ('./tags');

	var publish;


	// Ceci n'est pas un commentaire
	function buildSite () {
		var entries, files, pages, path, posts, repo;

		// Loads all of the files to be published
		files = $pages.getPages ($config.paths.inbox);

		if (files.length === 0) {
			console.log ('No new items found.');

			return 1;
		}

		// Loads an existing repo or creates a new one
		repo = _.compose ($repository.getRepository, $repository.loadRepository) ();

		// Publishes each type of content page
		_.each ($config.items, function (type) {
			pages = $pages.filterPages (files, type);

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

		// tag index files
		publish.tags (repo);

		// RSS news feed
		$rss.updateRssFeed (repo);

		// And finally...
		
		// Support resources such as css and media files
		copyResources ();

		// Saves the state of the site
		$repository.saveRepository (repo);
	}


	// This function copies all of the resource directories specified
	// in the configuration file to their published locations.
	function copyResources () {
		var files, targets;

		_.each ($config.resources, function (resource) {
			files = $io.getFiles ($config.paths.resources + resource);

			_.each (files, function (path, file) { 
				$io.copyFile (path + file,
										 $config.paths.output + resource + file);
			});
		});
	}


	// Clears out the public directory, copies everything from resource/archive
	// then builds the site again. Useful for when changing templates that affect the
	// entire site.
	function rebuildSite () {
		var files, path;

		files = [];

		if ($config.verbose) {
			console.log ('Rebuilding the site...');
		}

		$io.removeDirectory ($config.paths.output);

		files = $io.getFiles ($config.paths.repository);

		for (var file in files) {
			path = files [file];

			if (file !== 'repository.json') {
				$io.copyFile (path + file, $config.paths.inbox + file);
			}
		}

		$io.removeDirectory ($config.paths.repository);

		buildSite ();
	}


	publish = {
		archive: $archive.publishArchive,
		home: $home.publishHome,
		info: $info.publishInfo,
		link: $links.publishLinks,
		mini: $miniposts.publishMiniposts,
		post: $posts.publishPosts,
		tags: $tags.publishTags
	};

	module.exports.buildSite = buildSite;
	module.exports.rebuildSite = rebuildSite;
} ());
