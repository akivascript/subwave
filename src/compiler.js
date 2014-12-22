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

		if (posts.length !== 0) {
			entries = ar.createNewArchiveEntries (posts);

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
		homePage = pa.createHomePage (state.posts.slice (-3), posts);
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

	// Take [currently only] new posts, add them to the site's state, process them,
	// fold them, spindle them, mutilate them...
	function handlePosts (state, posts, entries, archives) {
		var archivePostsPath, entry, file, i, index, postCount, output, post;

		// Each post gets a unique index number which is later used 
		// for 
		if (state.posts && state.posts.length > 0) {
			postCount = st.getLastIndex (state.posts);

			index = postCount + 1;
		} else {
			index = 1;
		}

		for (i = 0; i < entries.length; i++) {
			entry = entries [i];
			
			if (!entry.index) {
				entry.index = index;

				posts [i].index = index;
			}

			if (entry.index < postCount) {
				state.posts [entry.index - 1] = entry;
			} else {
				state.posts.push (entry);
			}
				
			index = index + 1;
		}
		
		// Some last prepatory work on new posts including moving the now loaded
		// files into the archive.
		for (i = 0; i < posts.length; i++) {
			post = posts [i];

			post.excerpt = pa.getExcerpt (post.content);

			st.addPostToTagGroups (state, post);

			archivePostsPath = io.archivePath + 'posts/';

			io.createPostDirectory (archivePostsPath + post.path);

			output = JSON.stringify ({
				type: 'post',
				index: post.index,
				title: post.title,
				author: post.author,
				date: post.date,
				tags: post.tags}, null, '  ');


			file = io.readFile (io.inboxPath + post.origFilename);
			output = output + '\n\n' + pa.getContent (file, false);

			io.writeFile (archivePostsPath + post.path + post.filename + '.md', output);
			
			io.removeFile (io.inboxPath + post.origFilename);
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

		compile (verbose);
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
