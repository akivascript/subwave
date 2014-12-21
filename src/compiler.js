// This is the 'heart' of subwave. It processes all incoming posts and pages from 
// the inbox and generates necessary support pages such as archives.html.
(function () {
	'use strict';

	var Rss = require ('rss');

	var ar = require ('./archives');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var st = require ('./state');
	var ta = require ('./tags');

	var siteUrl = 'http://www.example.com/';

	// Ceci n'est pas un commentaire.
	function compile (verbose) {
		var homePage, i, entries, files, page, pages, path, posts, resources, state;

		if (verbose) {
			console.log ('Compiling the site...');
		}

		pages = pa.getNewPages ();

		if (pages.length === 0) {
			console.log ('No new pages found');

			return 1;
		}

		state = st.getState ();
		posts = po.getPosts (pages);
		entries = ar.createNewArchiveEntries (posts);

		if (posts.length !== 0) {
			handlePosts (state, posts, entries);
		}


		// Processes and saves any page files in inbox.
		for (i = 0; i < pages.length; i++) {
			page = pages [i];

			if (page.type !== 'post') {
				pa.savePage (page);

				io.renameFile (io.inboxPath + page.origFilename, 
											 io.archivePath + page.origFilename);
			}
		}

		// Creates the index.html page.
		console.log (posts);
		homePage = pa.createHomePage (posts.slice (-3));
		homePage.tags = state.tags;

		pa.savePage (homePage);

		// Copies any custom resources to public.
		resources = ['css/', 'js/', 'img/'];

		resources.forEach (function (resource) {
			files = io.getFiles (io.resourcesPath + resource);

			for (var file in files) {
				path = files [file];

				io.copyFile (path + file, io.publicPath + resource + file);
			}
		});
	}

	function handleArchives (posts) {
		var archives;

		archives = ar.createArchives (posts);
		archives = pa.createPage (JSON.stringify (archives));

		ar.saveArchives (archives);
	}

	function handlePosts (state, posts, entries, archives) {
		var archivePath, i, post;

		state.posts = state.posts.concat (entries);

		state.posts.sort (po.comparePosts);

		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			post.excerpt = po.getExcerpt (post.content);

			st.addPostToTagGroups (state, post);

			archivePath = io.archivePath + 'posts/';

			io.createPostDirectory (archivePath + post.path);

			io.renameFile (io.inboxPath + post.origFilename, 
										 archivePath + post.path + post.filename + '.md');
		}
	
		// We handle appending the archives first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (state, posts);

		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			po.savePost (post);
		}

		// Create archives.html.
		handleArchives (state.posts);

		// Create tag index files in tags directory.
		ta.createTagPages (state);

		updateRssFeed (state);

		st.saveState (state);
	}

	// Clears out the public directory, copies everything from resource/archives
	// then builds the site again. Useful for when changing templates that affect the
	// entire site.
	function rebuild (verbose) {
		var files, path;

		files = [];

		if (verbose) {
			console.log ('Rebuilding the site...');
		}

		io.cleanPublic (false);

		files = io.getFiles (io.archivePath);

		for (var file in files) {
			path = files [file];

			io.copyFile (path + file, io.inboxPath + file);
		}

		compile ();
	}

	function updateRssFeed (state) {
		var feed, feedOptions, itemOptions;

		feedOptions = {
			title: 'Blog Title',
			description: 'Blog description',
			feed_url: 'http://example.com/rss.xml',
			site_url: 'http://example.com',
			copyright: '2014 Bob Sacamano',
			langauge: 'en',
			pubDate: new Date ()
		};

		feed = new Rss (feedOptions);

		state.posts.forEach (function (post) {
			itemOptions = {
				title: post.title,
				url: siteUrl + io.postsPath + post.path + post.filename + '.html',
				date: post.date,
				categories: post.tags,
				author: post.author
			};

			feed.item (itemOptions);
		});

		io.writeFile (io.publicPath + 'rss.xml', feed.xml ());
	}

	module.exports.compile = compile;
	module.exports.rebuild = rebuild;
} ());
