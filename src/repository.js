// Repository is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var ta = require ('./tags');

	var repoName = 'repository.json';


	// Returns a fresh and empty state map.
	function createRepository () {
		return {
			lastUpdated: '',
			posts: [],
			tags: []
		};
	}


	// Returns a post by its index. 
	function getPostByIndex (index, posts) {
		return _.find (posts, function (post) {
			return post.index == index;
		});
	}


	// Gets the index of the most recently added post in the repository.
	function getLastIndex (posts) {
		var lastPost;

		lastPost = posts [posts.length - 1];

		return lastPost.index;
	}


	// Returns a JSON object representing the current repository of the blog
	// or returns a fresh one if no repository currently exists (this should only
	// occur when a blog is new and has no posts yet or when the entire site
	// is being rebuilt from scratch).
	function getRepository (file) {
		var repo;

		try {
			repo = JSON.parse (file);
		} catch (e) {
			repo = createRepository ();
		}

		if (verifyRepository (repo) === false) {
			throw new Error (repoName + ' is not in the expected format.');
		}

		return repo;
	}


	// Searches the repository for a tag and returns an array of
	// that tag's index and the tag itself. If the tag is not
	// present, findTag returns undefined.
	function findTag (tags, name) {
		var result;

		result = {};
		result.tag = _.findWhere (tags, { name: name });

		if (result.tag) {
			result.index = _.indexOf (tags, result.tag);

			return result;
		}

		return {};
	}


	// Reads the repository.json file from disk.
	function loadRepository () {
		var repo;

		try {
			repo = io.readFile (config.paths.resources + repoName);
		} catch (e) {
			// Do nothing here, we want to return null if repository.json isn't present.
		}

		return repo;
	}


	// Commits the current blog state to disk.
	function saveRepository (repository) {
		var filename;

		filename = config.paths.resources + repoName;
		repository.lastUpdated = new Date ();

		io.writeFile (filename, JSON.stringify (repository, null, '  '));
	}


	function verifyRepository (repository) {
		var keys, result;

		keys = ['lastUpdated', 'posts', 'tags'];

		return _.reduce (keys, 
										 function (result, key) { return _.has (repository, key); },
										 true);
	}


	module.exports.getPostByIndex = getPostByIndex;
	module.exports.getLastIndex = getLastIndex;
	module.exports.getRepository = getRepository;
	module.exports.findTag = findTag;
	module.exports.loadRepository = loadRepository;
	module.exports.saveRepository = saveRepository;
} ());
