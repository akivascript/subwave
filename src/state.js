(function () {
	'use strict';

	var io = require ('./io');
	var ta = require ('./tags');

	function addPostToTagGroups (state, post) {
		post.tags.forEach (function (tag) {
			if (!state.tags [tag]) {
				state.tags [tag] = {
					posts: []
				};
			}

			state.tags [tag].posts.push (post.filename);
		});
	}

	// Returns a JSON object representing the current state of the blog
	// or returns a fresh one if no state currently exists (this should only
	// occur when a blog is new and has no posts yet or when the entire site
	// is being rebuilt from scratch).
	function getState () {
		var state, file;

		file = io.resourcesPath + 'state.json';

		try {
			state = JSON.parse (io.readFile (file));
		} catch (e) {
			state = {
				lastUpdated: '',
				posts: [],
				tags: {}
			};
		}

		return state;
	}

	function saveState (state) {
		var filename;

		filename = io.resourcesPath + 'state.json';
		state.lastUpdated = new Date ();

		io.writeFile (filename, JSON.stringify (state, null, '\t'));
	}

	module.exports.addPostToTagGroups = addPostToTagGroups; 
	module.exports.getState = getState;
	module.exports.saveState = saveState;
} ());
