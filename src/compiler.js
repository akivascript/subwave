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
	function compile () {
		var archives, archivePath, homePage, entries, pages, posts, state;

		pages = pa.getNewPages ();

		if (pages.length === 0) {
			console.log ('No new pages found');

			return 1;
		}

		state = st.getState ();
		posts = po.getPosts (pages);
		entries = ar.createNewArchiveEntries (posts);

		if (posts.length !== 0) {
			state.posts = state.posts.concat (entries);

			posts.forEach (function (post) {
				st.addPostToTagGroups (state, post);

				archivePath = io.archivePath + 'posts/';

				io.createPostDirectory (archivePath + post.path);

				io.renameFile (io.inboxPath + post.origFilename, 
											 archivePath + post.path + post.filename + '.md');
			});
		
			// We handle appending the archives first (above) so we can more easily determine
			// if a post has siblings that need to be handled.
			po.handlePostsWithSiblings (state, posts);

			archives = ar.createArchives (state.posts);
			archives = pa.createPage (JSON.stringify (archives));

			ar.saveArchives (archives);

			posts.forEach (function (post) {
				po.savePost (post);
			});

			ta.createTagPages (state);

			updateRssFeed (state);

			st.saveState (state);
		}

		pages.forEach (function (page) {
			if (page.type !== 'post') {
				pa.savePage (page);

				io.renameFile (io.inboxPath + page.origFilename, 
											 io.archivePath + page.origFilename);
			}
		});
		
		homePage = pa.createHomePage ([posts [posts.length - 1]]);
		homePage.tags = state.tags;

		pa.savePage (homePage);

		io.copyFile (io.resourcesPath + 'css/screen.css', io.publicPath + 'css/screen.css');
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

		state.posts.reverse ();

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
} ());
