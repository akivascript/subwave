(function () {
	'use strict';

	var expect = require ('chai').expect;
	var _ = require ('underscore-contrib');

	var repository = require ('../src/repository.js');

	var repo = {
		"type": "repository",
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
		"tags": [
			{ 
				"name": "Miscellany",
				"posts": [
					"2014-12-20-first-post"
				]
			},
			{
				"name": "Guch",
				"posts": [
					"2014-12-21-second-post"
				]
			}
		]
	};

	var emptyRepo = { 
		lastUpdated: '',
		posts: [],
		tags: [],
		type: 'repository'
	};


	describe ('Repository', function () {
		describe ('getPostByIndex', function () {
			it ('returns from repository a post matching the passed index number', function () {
				var actual, expected;

				expected = {
					"author": "Bob Sacamano",
					"date": "2014-12-21T10:47:00.000Z",
					"filename": "2014-12-21-second-post",
					"index": 2,
					"tags": ["Guch"],
					"title": "Second Post"
				};

				actual = repository.getPostByIndex (2, repo.posts);

				expect (actual).to.eql (expected);
			});
		});

		describe ('getRepository', function () {
			it ('returns a properly formatted empty repository map when input is empty', function () {
				var actual, expected;

				expected = emptyRepo;
				actual = repository.getRepository ('');

				expect (actual).to.eql (expected);
			});

			it ('returns a properly formatted populated repository map when input is correct', function () {
				var actual, expected;

				expected = repo;
				actual = repository.getRepository (JSON.stringify (repo));

				expect (actual).to.eql (expected);
			});

			it ('throws an error when input is incorrectly formatted', function () {
				var fn, badRepo;

				badRepo = {
					unknownKey: '',
					posts: []
				};

				fn = function () { repository.getRepository (JSON.stringify (badRepo)); };

				expect (fn).to.throw (Error);
			});
		});
	});
} ());
