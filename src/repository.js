// Repository is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config.js');
	var io = require ('./io');
	var ta = require ('./tags');

	var repoName = 'repository.json';


	function addPostToRepository (posts, post) {
		var _post;

		if (!post.id) {
			post.id = _.compose (generatePostId, createRepositoryPost) (post);
		}

		_post = findPost (posts, post.id);
			
		if (_.isEmpty (_post)) {
			posts.push (post);
		} else {
			posts [_post.index] = post;
		}
		
		return posts;
	}


	function addTagToRepository (tags, name, post) {
		var _tag, output;

		_tag = findTag (tags, name);

		if (_.isEmpty (_tag)) {
			_tag.tag = ta.createTag (name);
			_tag.index = -1;
		} 

		_tag.tag = ta.addPostToTag (_tag.tag, post.filename);
		
		if (_tag.index === -1) {
			tags.push (_tag.tag);
		} else {
			tags [_tag.index] = _tag.tag;
		}
			
		return tags;
	}


	// Returns a fresh and empty state map.
	function createRepository () {
		return {
			lastUpdated: '',
			posts: [],
			tags: []
		};
	}


	function createRepositoryPost (post) {
		return _.pick (post, 'type', 'author', 'date', 'filename', 'tags', 'title');
	}


	function generatePostId (post) {
		var chr, id, i, len, _post;

		_post = post;
		
		if (!_.isString (_post)) {
			_post = JSON.stringify (_post);
		}

		if (_post.length === 0) return id;

		for (i = 0, len = _post.length; i < len; i++) {
			chr = _post.charCodeAt (i);
			id = ((id << 5) - id) + chr;
			id |= 0;
		}

		return id;
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


	function findPost (posts, id) {
		var result;

		result = {};
		result.post = _.findWhere (posts, { id: id });

		if (result.post) {
			result.index = _.indexOf (posts, result.post);

			return result;
		}

		return {};
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
		var filename, posts;
		
		filename = cf.paths.repository + repoName;
		repo.lastUpdated = new Date ();
		delete repo.type;

		repo.posts = _.reduce (repo.posts, function (res, post) {
			post = createRepositoryPost (post);

			if (!post.id) {
				post.id = generatePostId (post);
			}

			return addPostToRepository (repo.posts, post);
		}, repo.posts);

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
	module.exports.createRepositoryPost = createRepositoryPost;
	module.exports.generatePostId = generatePostId;
	module.exports.getPostByIndex = getPostByIndex;
	module.exports.getRepository = getRepository;
	module.exports.findTag = findTag;
	module.exports.loadRepository = loadRepository;
	module.exports.saveRepository = saveRepository;
} ());
