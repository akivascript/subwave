// Repository is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config.js');
	var io = require ('./io');
	var ta = require ('./tags');

	var repoName = 'repository.json';


	function addPostToRepository (repo, post) {
		var rp, p;

		p = _.pick (post, 'author', 'date', 'filename', 'tags', 'title');

		rp = _.snapshot (repo);
		rp.posts = rp.posts.concat (p);

		return rp;
	}


	function addTagToRepository (tags, name, post) {
		var tg, tmp;

		tg = _.snapshot (tags);

		tmp = findTag (tg, name);

		if (_.isEmpty (tmp)) {
			tmp.tag = ta.createTag (name);
		} 

		tmp.tag = ta.addPostToTag (tmp.tag, post.filename);

		if (!tmp.index || tmp.index === -1) {
			tg = tg.concat (tmp.tag);
		} else {
			tg [tmp.index] = tmp.tag;
		}
			
		return tg;
	}


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

		repo.type = 'repository';

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
			repo = io.readFile (cf.paths.repository + repoName);
		} catch (e) {
			// Do nothing here, we want to return null if repository.json isn't present.
		}

		return repo;
	}


	// Commits the current blog state to disk.
	function saveRepository (repo) {
		var filename;

		repo = _.snapshot (repo);

		filename = cf.paths.repository + repoName;
		repo.lastUpdated = new Date ();
		delete repo.type;

		repo.posts = _.reduce (repo.posts, function (res, post) {
			return res.concat (_.pick (post, 'author', 'date', 'filename', 'tags', 'title'));
		}, []);

		io.writeFile (filename, JSON.stringify (repo, null, '  '));
	}


	function verifyRepository (repo) {
		var keys, result;

		keys = ['lastUpdated', 'posts', 'tags'];

		return _.reduce (keys, 
										 function (result, key) { return _.has (repo, key); },
										 true);
	}


	module.exports.addPostToRepository = addPostToRepository;
	module.exports.addTagToRepository = addTagToRepository;
	module.exports.getPostByIndex = getPostByIndex;
	module.exports.getRepository = getRepository;
	module.exports.findTag = findTag;
	module.exports.loadRepository = loadRepository;
	module.exports.saveRepository = saveRepository;
} ());
