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
	function getNewPosts () {
		return io.readFiles (io.inboxPath, pa.createPage);
	}

	// This function adds new posts to the archives object which is used to:
	// 		1. Update the archives.html page; and,
	// 		2. Track all of the posts that have been added to the site (archives.json).
	// archives.json is important when adding and updating posts as it is used to
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

	function linkSibling (source)
	{
		var target;

		target = {};
		target.title = source.title;
		target.date = source.date;
		target.path = source.path;
		target.filename = source.filename;
		
		return target;
	}

	function processSibling (sibling, direction) {
		var file, filename, path;

		path = sibling.path;
		filename = sibling.filename;

		file = io.readFile (io.archivePath + path + filename + '.md');

		sibling.type = 'post';
		sibling.content = pa.getFileContent (file);
		sibling.template = io.templatesPath + 'post.jade';

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

		post [direction] = linkSibling (sibling);
		sibling [oppDirection] = linkSibling (post);

		if (state.posts [index]) {
			nextSibling = state.posts [index];

			sibling [direction] = linkSibling (nextSibling);
		}

		sibling = processSibling (sibling, oppDirection);

		sibling.output = pa.compilePage (sibling);

		io.createPostDirectory (io.postsPath + sibling.path);

		io.saveHtmlPage (sibling);
	}

	function savePosts (posts) {
		posts.forEach (function (post) {
			post.output = pa.compilePage (post);

			io.createPostDirectory (io.postsPath + post.path);

			io.saveHtmlPage (post);
		});
	}

	module.exports.getNewPosts = getNewPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePosts = savePosts;
} ());
