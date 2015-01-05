// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');
	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var rp = require ('./repository');


	// Allows sorting of posts by date.
	function comparePostsByDate (postA, postB) {
		return _.comparator (function () {
			return postA.date < postB.date;
		});
	}

	
	// Finds a post from the archive and copies it to the inbox for updating.
	function copyPostFromRepository (index) {
		var filename, date, post, path, repo;

		if (index) {
			repo = rp.getRepository ();
			post = rp.getPostByIndex (index, rp.posts);

			if (!post) {
				throw new Error ('Unable to find post with index ' + index + '.');
			}

			date = pa.formatDateForDisplay (post.date);
			path = io.getPostDirectoryPathname (post.date);

			if (cf.verbose) {
				console.log ('Copying from ' + cf.paths.repository + 'posts/' + path + post.filename + '.md' +
									 ' to ' +	cf.paths.inbox + post.filename + '.md');
			}
			
			io.copyFile (cf.paths.repository + 'posts/' + path + post.filename + '.md',
									 cf.paths.inbox + post.filename + '.md');

			console.log (post.title + ' from ' + date + ' ready for editing.');
		} else {
			throw new Error ('Please provide an index.');
		}
	}

	
	// Searches a site's posts' metadata for a match.
	function findPosts (criterion) {
		var compare, date, matches, post, repo;

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

		repo = rp.getRepository ();

		// Goes through each post in the site and looks through each attribute it has,
		// searching for matches.
		// TODO: Refactor this
		_.each (repo.posts, function (post) {
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


	function handlePostsWithSiblings (repo, posts) {
		var idx, next, previous;

		// TODO: What did you do, Ray.
		idx = repo.posts.length - posts.length;

		_.each (posts, function (post) {
			next = repo.posts [idx + 1];
			previous = repo.posts [idx - 1];

			if (previous) {
				processSiblingPosts (post, previous, repo, posts, idx, 'previous');
			}

			if (next) {
				processSiblingPosts (post, next, repo, posts, idx, 'next');
			}

			idx = idx + 1;
		});
	}


	// Links navigation information between two posts
	function linkSibling (source) {
		var target;

		target = pa.copyObject (source, ['date', 'filename', 'title']);

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
		file = io.readFile (cf.paths.repository + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.template = cf.paths.templates + 'post.jade';
		sibling.title = pa.convertToHtml (sibling.title);

		return sibling;
	}


	// Connect a new post's navigation with its existing sibling posts, saving the 
	// existing sibling posts along the way. This allows us to add new posts and modify
	// existing ones without having to rebuild every post from scratch.
	function processSiblingPosts (post, sibling, repo, posts, index, direction) {
		var oppDirection, nextSibling, tmpSibling;

		tmpSibling = pa.copyObject (sibling);

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
		if (repo.posts [index]) {
			nextSibling = pa.copyObject (repo.posts [index]);

			tmpSibling [direction] = linkSibling (nextSibling);
		}

		tmpSibling = processSibling (tmpSibling, oppDirection);
		tmpSibling.path = io.getPostDirectoryPathname (tmpSibling.date);

		savePost (tmpSibling, repo.tags);
	}

	
	// Take [currently only] new posts, add them to the site's repository, process them,
	// fold them, spindle them, mutilate them...
	function publishPosts (posts, repo) {
		var repoPostsPath, file, index, postCount, output, result;

		repoPostsPath = cf.paths.repository + 'posts/';

		_.each (posts, function (post) {
			repo.tags = _.reduce (post.tags, function (res, tag) {
				return res.concat (rp.addTagToRepository (repo.tags, tag, post));
			}, []);

			// Move posts to the repository.
			io.createPostDirectory (repoPostsPath + post.path);

			io.renameFile (cf.paths.inbox + post.origFilename, 
										 repoPostsPath + post.path + post.filename + '.md'); 

			// Saves the post to public.
			savePost (post, repo.tags);
		});

		repo.posts = _.reduce (posts, function (res, post) {
			return res.concat (rp.addPostToRepository (repo.posts, post));
		}, []);

		handlePostsWithSiblings (repo, posts);

		_.each (posts, function (post) {
			savePost (post, repo.tags);
		});
	}


	// Commit a post to disk.
	function savePost (post, tags) {
		post.output = pa.compilePage (post, tags);

		io.createPostDirectory (cf.paths.posts + post.path);

		io.saveHtmlPage (post);
	}


	module.exports.comparePostsByDate = comparePostsByDate;
	module.exports.copyPostFromRepository = copyPostFromRepository;
	module.exports.findPosts = findPosts;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.publishPosts = publishPosts;
	module.exports.savePost = savePost;
} ());
