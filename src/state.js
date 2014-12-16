(function () {
	'use strict';

	var io = require ('./io');

	function getState () {
		var state, file;

		file = 'resources/state.json';

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

		io.writeFile (filename, JSON.stringify (state));
	}

	module.exports.getState = getState;
	module.exports.saveState = saveState;
} ());
