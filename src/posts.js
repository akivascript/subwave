// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');
	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var repo = require ('./repository');


	// Allows sorting of posts by date.
	function comparePostsByDate (postA, postB) {
		return _.comparator (function () {
			return postA.date < postB.date;
		});
	}

	
	// Finds a post from the archive and copies it to the inbox for updating.
	function copyPostFromRepository (index) {
		var filename, date, post, path, state;

		if (index) {
			state = repo.getRepository ();
			post = repo.getPostByIndex (index, state.posts);

			if (!post) {
				throw new Error ('Unable to find post with index ' + index + '.');
			}

			date = pa.formatDateForDisplay (post.date);
			path = io.getPostDirectoryPathname (post.date);

			if (config.verbose) {
				console.log ('Copying from ' + config.paths.repository + 'posts/' + path + post.filename + '.md' +
									 ' to ' +	config.paths.inbox + post.filename + '.md');
			}
			
			io.copyFile (config.paths.repository + 'posts/' + path + post.filename + '.md',
									 config.paths.inbox + post.filename + '.md');

			console.log (post.title + ' from ' + date + ' ready for editing.');
		} else {
			throw new Error ('Please provide an index.');
		}
	}

	
	// Searches a site's posts' metadata for a match.
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

		state = repo.getRepository ();

		// Goes through each post in the site and looks through each attribute it has,
		// searching for matches.
		// TODO: Refactor this
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
		return _.filter (files, function (file) {
			return file.type === 'post';
		});
	}


	function handlePostsWithSiblings (state, posts) {
		var idx, next, previous;

		// TODO: What did you do, Ray.
		idx = state.posts.length - posts.length;

		_.each (posts, function (post) {
			next = state.posts [idx + 1];
			previous = state.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, state, posts, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, state, posts, idx, 'next');
			}

			idx = idx + 1;
		});
	}


	// Links navigation information between two posts
	function linkSibling (source) {
		var target;

		target = pa.copyPageData (source, ['date', 'filename', 'title']);

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
		file = io.readFile (config.paths.repository + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.template = config.paths.templates + 'post.jade';
		sibling.title = pa.convertToHtml (sibling.title);

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

		io.createPostDirectory (config.paths.posts + post.path);

		io.saveHtmlPage (post);
	}


	module.exports.comparePostsByDate = comparePostsByDate;
	module.exports.copyPostFromRepository = copyPostFromRepository;
	module.exports.findPosts = findPosts;
	module.exports.getPosts = getPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.savePost = savePost;
} ());
