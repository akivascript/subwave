// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pa = require ('./pages');

	// An indirector for clarity.
	function getPosts () {
		return io.readFiles (io.inboxPath, pa.createPage);
	}

	// This function adds new posts to the state object which is used to:
	// 		1. Update the archives.html page; and,
	// 		2. Track all of the posts that have been added to the site (state.json).
	// state.json is important when adding and updating posts as it is used to
	// load and modify adjacent posts so that their individual navigation links point
	// to their proper sibling posts. For example, when adding a new post, the previous
	// most recent post needs to be loaded and have a 'next' link added to point to
	// the new most recent post.
	function handlePostsWithSiblings (state, posts) {
		var idx;

		// TODO: What did you do, Ray.
		idx = state.posts.length - posts.length;

		posts.forEach (function (post) {
			var next, previous;
		
			next = state.posts [idx + 1];
			previous = state.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, state, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, state, idx, 'next');
			}

			idx = idx + 1;
		});
	}

	// Links navigation information between two posts
	function linkSibling (sibling, post, direction)
	{
		var date;

		date = new Date (sibling.date);

		post [direction] = {};

		post [direction].title = sibling.title;
		post [direction].date = sibling.date;
		post [direction].path = io.getPostDirectoryPathname (sibling.date);
		post [direction].filename = sibling.filename;
	}

	// Loads and processes an existing post from resources/archives/..
	function processSibling (post, direction) {
		var path, sibling;

		path = io.getPostDirectoryPathname (post [direction].date);
		sibling = io.readFile (io.archivePath + path + post [direction].filename + '.md');
		sibling = pa.createPage (sibling);

		return sibling;
	}

	// Connect a new post's navigation with its existing sibling posts, saving the 
	// existing sibling posts along the way. This allows us to add new posts and modify
	// existing ones without having to rebuild every post from scratch.
	function processSiblingPosts (post, sibling, state, index, direction) {
		var oppDirection, nextSibling;

		if (direction === 'previous') {
			oppDirection = 'next';
			index = index - 2;
		} else {
			oppDirection = 'previous';
			index = index + 2;
		}

		linkSibling (sibling, post, direction);
		linkSibling (post, sibling, oppDirection);

		sibling = processSibling (post, direction);

		// If a sibling has its own sibling, update the navigation of that post as well.
		// This allows us to handle the case when more than one new post is added simultaneously
		// and the previous most recent post is part of the sibling chain.
		if (state.posts [index]) {
			nextSibling = state.posts [index];

			linkSibling (nextSibling, sibling, direction);
		}

		sibling.output = pa.compilePage (sibling);

		io.createPostDirectory (io.postsPath + sibling.path);

		io.saveHtmlPage (sibling);
	}

	// Commit a post to disk.
	function savePost (post) {
		post.output = pa.compilePage (post);

		io.createPostDirectory (io.postsPath + post.path);

		io.saveHtmlPage (post);
	}

	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
