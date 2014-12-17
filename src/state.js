(function () {
	'use strict';

	var io = require ('./io');

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
				tags: []
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

	module.exports.getState = getState;
	module.exports.saveState = saveState;
} ());
