(function () {
	'use strict';

	var expect = require ('chai').expect;
	var _ = require ('underscore-contrib');

	var state = require ('../src/state.js');

	var stateMap = {
		"lastUpdated": "2015-01-02T03:57:40.754Z",
		"posts": [
			{
				"author": "Bob Sacamano",
				"date": "2014-12-20T10:32:00.000Z",
				"filename": "2014-12-20-first-post",
				"index": 1,
				"tags": ["Miscellany"],
				"title": "First Post"
			},
			{
				"author": "Bob Sacamano",
				"date": "2014-12-21T10:47:00.000Z",
				"filename": "2014-12-21-second-post",
				"index": 2,
				"tags": ["Guch"],
				"title": "Second Post"
			}],
		"tags": {
			"Miscellany": {
				"posts": [
					"2014-12-20-first-post"
				]
			},
			"Guch": {
				"posts": [
					"2014-12-21-second-post"
				]
			}
		}
	};

	var stateMapEmpty = { 
		lastUpdated: '', 
		posts: [], 
		tags: {} 
	};


	describe ('State', function () {
		describe ('getLastIndex', function () {
			it ('returns the map index of the most recently added post in state', function () {
				var actual, expected;

				expected = 2;

				actual = state.getLastIndex (stateMap.posts);

				expect (actual).to.equal (expected);
			});
		});

		describe ('getPostByIndex', function () {
			it ('returns from state a post matching the passed index number', function () {
				var actual, expected;

				expected = {
					"author": "Bob Sacamano",
					"date": "2014-12-21T10:47:00.000Z",
					"filename": "2014-12-21-second-post",
					"index": 2,
					"tags": ["Guch"],
					"title": "Second Post"
				};

				actual = state.getPostByIndex (2, stateMap.posts);

				expect (actual).to.eql (expected);
			});
		});

		describe ('getState', function () {
			it ('returns a properly formatted empty state map when input is empty', function () {
				var actual, expected;

				expected = stateMapEmpty;
				actual = state.getState ('');

				expect (actual).to.eql (expected);
			});

			it ('returns a properly formatted populated state map when input is correct', function () {
				var actual, expected;

				expected = stateMap;
				actual = state.getState (JSON.stringify (stateMap));

				expect (actual).to.eql (expected);
			});

			it ('throws an error when input is incorrectly formatted', function () {
				var fn, badStateMap;

				badStateMap = {
					unknownKey: '',
					posts: []
				};

				fn = function () { state.getState (JSON.stringify (badStateMap)); };

				expect (fn).to.throw (Error);
			});
		});
	});
} ());
