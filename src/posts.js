// This collects all functions related to individual posts.
(function () {
	'use strict';

	var jade = require ('jade');
	var moment = require ('moment');
	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $io = require ('./io');
	var $pages = require ('./pages');
	var $repository = require ('./repository');


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
			repo = $repository.getRepository ();
			post = $repository.getPostByIndex (index, $repository.posts);

			if (!post) {
				throw new Error ('Unable to find post with index ' + index + '.');
			}

			date = $pages.formatDateForDisplay (post.date);
			path = $io.getPostDirectoryPathname (post.date);

			if ($config.verbose) {
				console.log ('Copying from ' + $config.paths.repository + 'posts/' + path + post.filename + '.md' +
									 ' to ' +	$config.paths.inbox + post.filename + '.md');
			}
			
			$io.copyFile ($config.paths.repository + 'posts/' + path + post.filename + '.md',
									 $config.paths.inbox + post.filename + '.md');

			console.log (post.title + ' from ' + date + ' ready for editing.');
		} else {
			throw new Error ('Please provide an index.');
		}
	}


	function createPost (post) {
		post.date = new Date (post.date);

		if (!post.id) {
			post.id = generateId ();
		}

		if ($config.index.useExcerpts) {
			post.excerpt = $pages.getExcerpt (post.content);
		}

		return post;
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

		target = $pages.copyObject (source, ['date', 'filename', 'title']);

		if (!source.path) {
			target.path = $io.getPostDirectoryPathname (source.date);
		} else {
			target.path = source.path;
		}	
		
		return target;
	}


	function loadPost (post) {
		var file, path;

		path = $config.paths.repository + 'posts/' + 
			$io.getPostDirectoryPathname (post.date) + post.filename + '.md';

		return $io.readFile (path);
	}


	function loadPosts (path) {
		var files, posts;

		path = path || $config.paths.repository + 'posts/';

		files = $io.getFiles (path);

		for (var file in files) {
			path = files [file];

			if (file !== 'repository.json') {
				$io.copyFile (path + file, $config.paths.inbox + file);
			}
		}
	}

	// Loads and processes an existing post from resources/archives/..
	function processSibling (sibling, direction) {
		var file, filename, path;

		path = $io.getPostDirectoryPathname (sibling.date);
		filename = sibling.filename;
		file = $io.readFile ($config.paths.repository + 'posts/' + path + filename + '.md');

		sibling.type = 'post';
		sibling.template = $config.paths.templates + 'post.jade';
		sibling.title = $pages.convertToHtml (sibling.title);

		return sibling;
	}


	// Connect a new post's navigation with its existing sibling posts, saving the 
	// existing sibling posts along the way. This allows us to add new posts and modify
	// existing ones without having to rebuild every post from scratch.
	function processSiblingPosts (post, sibling, repo, posts, index, direction) {
		var oppDirection, nextSibling, tmpSibling;

		tmpSibling = $pages.copyObject (sibling);

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
			nextSibling = $pages.copyObject (repo.posts [index]);

			tmpSibling [direction] = linkSibling (nextSibling);
		}

		tmpSibling = processSibling (tmpSibling, oppDirection);
		tmpSibling.path = $io.getPostDirectoryPathname (tmpSibling.date);

		savePost (tmpSibling, repo.tags);
	}

	
	// Take new posts, add them to the site's repository, process them,
	// fold them, spindle them, mutilate them...
	function publishPosts (posts, repo) {
		var repoPostsPath, output;

		repoPostsPath = $config.paths.repository + 'posts/';

		posts = _.map (posts, function (post) {
			return _.compose ($pages.createPage, createPost) (post);
		});
		
		_.each (posts, function (p) {
			var post = p;

			repo.tags = _.reduce (post.tags, function (res, tag) {
				return $repository.addTagToRepository (repo.tags, tag, post);
			}, repo.tags);

			post.date = $pages.formatDate (post.date, 'YYYY-MM-DD HH:mm');

			output = JSON.stringify (_.pick (post, 'type', 'id', 'title', 'author', 'date', 'tags'),
															null, '  ');
			output = output + '\n\n' + post.content;

			$io.writeFile (repoPostsPath + post.path + post.filename + '.md', output);

			$io.removeFile ($config.paths.inbox + post.origFilename);

			post.date = new Date (post.date);
		});

		repo.posts = _.reduce (posts, function (res, post) {
			return $repository.addPostToRepository (repo.posts, post);
		}, repo.posts);

		repo.posts = _.sortBy (repo.posts, function (post) { return post.date; });

		handlePostsWithSiblings (repo, posts);

		_.each (posts, function (post) {
			savePost (post, repo.tags);
		});
	}


	// Commit a post to disk.
	function savePost (post, tags) {
		post.output = $pages.compilePage (post, tags);

		$io.saveHtmlPage (post);
	}


	module.exports.comparePostsByDate = comparePostsByDate;
	module.exports.copyPostFromRepository = copyPostFromRepository;
	module.exports.createPost = createPost;
	module.exports.handlePostsWithSiblings = handlePostsWithSiblings;
	module.exports.loadPost = loadPost;
	module.exports.publishPosts = publishPosts;
	module.exports.savePost = savePost;
} ());
