// State is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var ta = require ('./tags');


	// Adds a post to any tags the post is tagged with. Yes, that's somehow English.
	// This is used for generation the tag index pages.
	function addPostToTagGroups (state, post) {
		var i, tag;

		for (i = 0; i < post.tags.length; i++) {
			tag = post.tags [i];

			if (!state.tags [tag]) {
				state.tags [tag] = {
					posts: []
				};
			}

			state.tags [tag].posts.push (post.filename);
		}
	}


	// Returns a post by its index. 
	function getPostByIndex (index, posts) {
		var post;
		for (var i = 0; i < posts.length; i++) {
			post = posts [i];

			if (post.index == index) {
				return post;
			}
		}
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
	function getState () {
		var file, state;

		file = config.paths.resources + 'state.json';

		try {
			state = JSON.parse (io.readFile (file));

			for (var post in state.posts) {
				post.date = post.date;
			}
		} catch (e) {
			state = {
				lastUpdated: '',
				posts: [],
				tags: {}
			};
		}

		return state;
	}


	// Commits the current blog state to disk.
	function saveState (state) {
		var filename;

		filename = config.paths.resources + 'state.json';
		state.lastUpdated = new Date ();

		io.writeFile (filename, JSON.stringify (state, null, '\t'));
	}


	module.exports.addPostToTagGroups = addPostToTagGroups; 
	module.exports.getPostByIndex = getPostByIndex;
	module.exports.getLastIndex = getLastIndex;
	module.exports.getState = getState;
	module.exports.saveState = saveState;
} ());
