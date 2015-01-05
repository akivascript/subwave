// the inbox and generates necessary support pages such as archive.html.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');
	var fs = require ('fs-extra');

	var ar = require ('./archive');
	var cf = require ('../resources/config');
	var ho = require ('./home');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var rp = require ('./repository');
	var rs = require ('./rss');
	var ta = require ('./tags');


	// Ceci n'est pas un commentaire
	function buildSite () {
		var homePage, entries, files, pages, path, posts, repo;

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
				module.internals ['publish' + _.capitalize (type)] (repo, pages);
			}
		});	

		// The following are calculated from content pages and are thus
		// handled separately.
		
		// index.html
		publishHome (repo);

		// archive.html
		publishArchive (repo.posts, repo.tags);

		// tags/[tag].html files
		ta.createTagPages (repo);

		// RSS news feed
//		rs.updateRssFeed (repo);

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


	// Creates an archive page from all of the published posts stored
	// in the repository.
	function processArchive (posts, tags) {
		var archive;

		archive = _.compose (pa.createPage, ar.createArchive) ();

		archive.entries = _.reduce (posts, function (res, post) {
			return res.concat (ar.addEntryToArchive (archive.entries, post));
		}, []);
			
		ar.saveArchive (archive, tags);
	}


	// The home page is generated here. A number of posts specified
	// in the site configuration file are displayed with or without
	// excerpts.
	function processHome (repo) {
		homePage = _.compose (pa.createPage, ho.createHome) ();

		homePage.posts = _.map (repo.posts.slice (-cf.index.postCount), 
														function (post) {
															post.excerpt = pa.prepareForDisplay (post.excerpt);
															return post;
														});
														
		pa.savePage (homePage, repo.tags);
	}

	// The various info pages, usually static pages such as an About page
	// are handled by this function.
	function processInfo (repo, pages) {
		_.each (pages, function (page) {
				pa.savePage (page, repo.tags);

				io.renameFile (cf.paths.inbox + page.origFilename, 
											 cf.paths.repository + page.origFilename);
			});
	}


	// Take [currently only] new posts, add them to the site's repository, process them,
	// fold them, spindle them, mutilate them...
	function processPosts (repo, posts) {
		var repoPostsPath, file, index, postCount, output, result;

		repoPostsPath = cf.paths.repository + 'posts/';

		_.each (posts, function (post) {
			repo.tags = _.reduce (post.tags, function (res, tag) {
				return res.concat (rp.addTagToRepository (repo.tags, tag, post));
			}, []);

			// Move posts to the repository.
			io.createPostDirectory (repoPostsPath + post.path);

			io.renameFile (cf.paths.inbox + post.origFilename, 
										 repoPostsPath + post.path + post.filename + '.md'); 

			// Saves the post to public.
			po.savePost (post, repo.tags);
		});

		repo.posts = _.reduce (posts, function (res, post) {
			return res.concat (rp.addPostToRepository (repo.posts, post));
		}, []);

		po.handlePostsWithSiblings (repo, posts);

		_.each (posts, function (post) {
			po.savePost (post, repo.tags);
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


	module.internals = {
		processInfo: processInfo,
		processPost: processPosts
	};

	module.exports.buildSite = buildSite;
	module.exports.rebuildSite = rebuildSite;
} ());
