(function () {
	'use strict';

	var expect = require ('chai').expect;
	var fs = require ('fs-extra');
	var _ = require ('underscore-contrib');

	var testTarget = require ('../src/archive.js');


	describe ('Archive', function () {
		describe ('createArchive', function () {
			it ('should return an empty archive', function () {
				var actual, expected;

				expected = {
					type: "archive",
					title: "Archive",
					posts: []
				};

				actual = testTarget.createArchive ();

				expect (actual).to.eql (expected);
			});

			it ('should return an empty archive with two posts', function () {
				var actual, expected, posts;

				posts = [
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
					}
				];

				expected = {
					type: "archive",
					title: "Archive",
					posts: posts
				};

				actual = testTarget.createArchive (posts);

				expect (actual).to.eql (expected);
			});
		});
	});
} ());
