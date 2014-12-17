(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pa = require ('./pages');

	function comparePosts (postA, postB) {
		if (!postA || !postB) {
			return false;
		}

		if (postA.title === postB.title &&
				postA.author === postB.author &&
				postA.date === postB.date) {
			return true;
		}

		return false;
	}

	// An indirector for clarity.
	function getPosts () {
		return io.readFiles (io.inboxPath, pa.createPage);
	}

	// This function adds new posts to the state object which is used to:
	// 		1. Update the archives.html page; and,
	// 		2. Track all of the posts that have been added to the site (state.json).
	// state.json is important when adding and updating posts as it is used to
	// load and modify adjacent posts so that their individual navigation links point
	// to the proper sibling post. For example, when adding a new post, the previous
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

	function processSibling (post, direction) {
		var path, sibling;

		path = io.getPostDirectoryPathname (post [direction].date);
		sibling = io.readFile (io.archivePath + path + post [direction].filename + '.md');
		sibling = pa.createPage (sibling);

		return sibling;
	}

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

		if (state.posts [index]) {
			nextSibling = state.posts [index];

			linkSibling (nextSibling, sibling, direction);
		}

		sibling.output = pa.compilePage (sibling);

		io.createPostDirectory (io.postsPath + sibling.path);

		io.saveHtmlPage (sibling);
	}

	function savePost (post) {
		post.output = pa.compilePage (post);

		io.createPostDirectory (io.postsPath + post.path);

		io.saveHtmlPage (post);
	}

	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
