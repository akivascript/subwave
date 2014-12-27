// This collects all functions related to individual posts.
(function () {
	'use strict';

	var _ = require ('underscore');
	var jade = require ('jade');
	var marked = require ('marked');

	var config = require ('./config');
	var io = require ('./io');
	var pa = require ('./pages');
	var st = require ('./state');

	marked.setOptions ({
		smartypants: true
	});


	// Allows sorting of posts by date.
	function comparePostsByDate (postA, postB) {
		if (postA.date < postB.date) {
			return -1;
		}

		if (postB.date < postA.date) {
			return 1;
		}

		return 0;
	}

	
	// Finds a post from the archive and copies it to the inbox for updating.
	function copyPostFromArchive (index, verbose) {
		var filename, date, post, path, state;

		if (index) {
			state = st.getState ();
			post = st.getPostByIndex (index, state.posts);

			if (!post) {
				throw new Error ('Unable to find post with index ' + index + '.');
			}

			date = pa.formatDateForDisplay (post.date);
			path = io.getPostDirectoryPathname (post.date);

			if (verbose) {
				console.log ('Copying from ' + config.path.archive + 'posts/' + path + post.filename + '.md' +
									 ' to ' +	config.path.inbox + post.filename + '.md');
			}
			
			io.copyFile (config.path.archive + 'posts/' + path + post.filename + '.md',
									 config.path.inbox + post.filename + '.md');

			console.log (post.title + ' from ' + date + ' ready for editing.');
		} else {
			throw new Error ('Please provide an index.');
		}
	}

	
	function findPosts (criterion) {
		var compare, date, matches, post, state;

		matches = [];

		compare = function (valueA, valueB) {
			var result;

			valueA = valueA.toLowerCase ();
			valueB = valueB.toLowerCase ();
			result = valueA.search (valueB);

			if (result === -1) {
				return false;
			}

			return true;
		};

		state = st.getState ();

		// Goes through each post in the site and looks through each attribute it has,
		// searching for matches.
		_.each (state.posts, function (post) {
			_.each (post, function (value, key) {
				if (typeof value === 'string') {
					if (key === 'date') {
						value = pa.formatDateForDisplay (value);
					}

					if (compare (value, criterion)) {
						matches.push (post);
					}
				} else if (typeof value === 'object') {
					_.each (value, function (val) {
						if (compare (val, criterion)) {
							matches.push (post);
						}
					});
			 	}
			});
		});

		return _.uniq (matches);
	}


	// Filters out any pages that aren't posts.
	function getPosts (files) {
		return files.filter (function (file) {
			if (file.type === 'post') {
				return true;
			}

			return false;
		});
	}


	function handlePostsWithSiblings (state, posts) {
		var i, idx, next, post, previous;

		// TODO: What did you do, Ray.
		idx = state.posts.length - posts.length;

		for (i = 0; i < posts.length; i++) {
			post = posts [i];
			next = state.posts [idx + 1];
			previous = state.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, state, posts, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, state, posts, idx, 'next');
			}

			idx = idx + 1;
		}
	}


	// Links navigation information between two posts
	function linkSibling (source) {
		var target;

		target = {};
		target.title = source.title;
		target.date = source.date;
		target.filename = source.filename;

		if (!source.path) {
			target.path = io.getPostDirectoryPathname (source.date);
		} else {
			target.path = source.path;
		}	
		
		return target;
	}


	// Loads and processes an existing post from resources/archives/..
	function processSibling (sibling, direction) {
		var file, filename, path;

		path = io.getPostDirectoryPathname (sibling.date);
		filename = sibling.filename;
		file = io.readFile (config.path.archive + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.template = config.path.templates + 'post.jade';
		sibling.title = marked (sibling.title);

		return sibling;
	}


	// Connect a new post's navigation with its existing sibling posts, saving the 
	// existing sibling posts along the way. This allows us to add new posts and modify
	// existing ones without having to rebuild every post from scratch.
	function processSiblingPosts (post, sibling, state, posts, index, direction) {
		var oppDirection, nextSibling, tmpSibling;

		tmpSibling = pa.copyAttributes (sibling);

		if (direction === 'previous') {
			oppDirection = 'next';
			index = index - 2;
		} else {
			oppDirection = 'previous';
			index = index + 2;
		}

		post [direction] = linkSibling (tmpSibling);
		tmpSibling [oppDirection] = linkSibling (post);

		// If a sibling has its own sibling, update the navigation of that post as well.
		// This allows us to handle the case when more than one new post is added simultaneously
		// and the previous most recent post is part of the sibling chain.
		if (state.posts [index]) {
			nextSibling = pa.copyAttributes (state.posts [index]);

			tmpSibling [direction] = linkSibling (nextSibling);
		}

		tmpSibling = processSibling (tmpSibling, oppDirection);
		tmpSibling.path = io.getPostDirectoryPathname (tmpSibling.date);

		savePost (tmpSibling, state.tags);
	}
	

	// Commit a post to disk.
	function savePost (post, tags) {
		post.output = pa.compilePage (post, tags);

		io.createPostDirectory (config.path.posts + post.path);

		io.saveHtmlPage (post);
	}


	module.exports.comparePostsByDate = comparePostsByDate;
	module.exports.copyPostFromArchive = copyPostFromArchive ;
	module.exports.findPosts = findPosts;
	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
