// State is used to track the state of the blog. It currently keeps a list of all
// posts (with minimal metadata) along with tags and the posts associated with each.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var ta = require ('./tags');


	// Adds a post to any tags the post is tagged with. Yes, that's somehow English.
	// This is used for generation the tag index pages.
	function addPostToTagGroups (state, post) {
		_.each (post.tags, function (tag) {
			if (!state.tags [tag]) {
				state.tags [tag] = {
					posts: []
				};
			}

			state.tags [tag].posts.push (post.filename);
		});
	}


	// Returns a post by its index. 
	function getPostByIndex (index, posts) {
		_.find (posts, function (post) {
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
	function getState () {
		var file, state;

		file = config.paths.resources + 'state.json';

		try {
			state = JSON.parse (io.readFile (file));

			for (var post in state.posts) {
				// ... What?
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
