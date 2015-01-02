// State is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var ta = require ('./tags');


	// Returns a fresh and empty state map.
	function createState () {
		return {
			lastUpdated: '',
			posts: [],
			tags: {}
		};
	}


	// Returns a post by its index. 
	function getPostByIndex (index, posts) {
		return _.find (posts, function (post) {
			return post.index == index;
		});
	}


	// Gets the index of the most recently added post in state.
	function getLastIndex (posts) {
		var lastPost;

		lastPost = posts [posts.length - 1];

		return lastPost.index;
	}


	// Returns a JSON object representing the current state of the blog
	// or returns a fresh one if no state currently exists (this should only
	// occur when a blog is new and has no posts yet or when the entire site
	// is being rebuilt from scratch).
	function getState (file) {
		var state;

		try {
			state = JSON.parse (file);
		} catch (e) {
			state = createState ();
		}

		if (verifyState (state) === false) {
			throw new Error ('state.json is not in the expected format.');
		}

		return state;
	}


	// Reads the state.json file from disk.
	function loadStateFromDisk () {
		var file;

		try {
			file = io.readFile (config.paths.resources + 'state.json');
		} catch (e) {
			// Do nothing here, we want to return null if state.json isn't present.
		}

		return file;
	}


	// Commits the current blog state to disk.
	function saveState (state) {
		var filename;

		filename = config.paths.resources + 'state.json';
		state.lastUpdated = new Date ();

		io.writeFile (filename, JSON.stringify (state, null, '  '));
	}


	function verifyState (state) {
		var keys, result;

		keys = ['lastUpdated', 'posts', 'tags'];

		return _.reduce (keys, 
										 function (result, key) { return _.has (state, key); },
										 true);
	}


	module.exports.getPostByIndex = getPostByIndex;
	module.exports.getLastIndex = getLastIndex;
	module.exports.getState = getState;
	module.exports.loadStateFromDisk = loadStateFromDisk;
	module.exports.saveState = saveState;
} ());
