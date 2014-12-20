// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pa = require ('./pages');

	function getExcerpt (content) {
		var count, excerpt, graf, i, paragraphs, total;

		count = 0;
		total = 0;
		excerpt = [];
		paragraphs = content.split (/\n/);

		for (i = 0; i < paragraphs.length; i++) {
			graf = paragraphs [i];

			count = graf.split (' ').length;

			if (total + count < 141) {
				excerpt.push (graf);

				total = total + count;
			} else {
				break;
			}
		}

		return excerpt.join ('\n');
	}

	function getPosts (files) {
		return files.filter (function (file) {
			if (file.type === 'post') {
				return true;
			}

			return false;
		});
	}

	// This function adds new posts to the archives object which is used to:
	// 		1. Update the archives.html page; and,
	// 		2. Track all of the posts that have been added to the site (archives.json).
	// archives.json is important when adding and updating posts as it is used to
	// load and modify adjacent posts so that their individual navigation links point
	// to their proper sibling posts. For example, when adding a new post, the previous
	// most recent post needs to be loaded and have a 'next' link added to point to
	// the new most recent post.
	function handlePostsWithSiblings (state, posts) {
		var i, idx, next, post, previous;

		// TODO: What did you do, Ray.
		idx = state.posts.length - posts.length;

		state.posts.reverse ();
		posts.reverse ();

		for (i = 0; i < posts.length; i++) {
			post = posts [i];
			next = state.posts [idx + 1];
			previous = state.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, state, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, state, idx, 'next');
			}

			idx = idx + 1;
		}
	}

	// Links navigation information between two posts
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

	// Loads and processes an existing post from resources/archives/..
	function processSibling (sibling, direction) {
		var file, filename, path;

		path = sibling.path;
		filename = sibling.filename;
		file = io.readFile (io.archivePath + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.content = pa.getFileContent (file);
		sibling.template = io.templatesPath + 'post.jade';

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

		post [direction] = linkSibling (sibling);
		sibling [oppDirection] = linkSibling (post);

		// If a sibling has its own sibling, update the navigation of that post as well.
		// This allows us to handle the case when more than one new post is added simultaneously
		// and the previous most recent post is part of the sibling chain.
		if (state.posts [index]) {
			nextSibling = state.posts [index];

			sibling [direction] = linkSibling (nextSibling);
		}

		sibling = processSibling (sibling, oppDirection);

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

	module.exports.getExcerpt = getExcerpt;
	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
