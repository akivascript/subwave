// This is the 'heart' of subwave. It processes all incoming posts and pages from 
// the inbox and generates necessary support pages such as archives.html.
(function () {
	'use strict';

	var rss = require ('rss');

	var ar = require ('./archives');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var st = require ('./state');
	var ta = require ('./tags');

	var siteUrl = 'http://www.example.com/';

	// Ceci n'est pas un commentaire.
	function compile () {
		var archives, archivePath, homePage, newEntries, posts, state;

		state = st.getState ();
		posts = po.getNewPosts ();

		if (!posts || posts.length === 0) {
			console.log ('No new posts found');

			return 1;
		}

		newEntries = ar.createNewEntries (posts);

		if (newEntries) {
			state.posts = state.posts.concat (newEntries);

			newEntries.forEach (function (entry) {
				st.addPostToTagGroups (state, entry);
			});
		}

		st.saveState (state);

		posts.forEach (function (post) {
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
		
		homePage = pa.createHomePage ([posts [posts.length - 1]]);
		homePage.tags = state.tags;

		pa.savePage (homePage);

		updateRssFeed (state);
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

		feed = new rss (feedOptions);

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
