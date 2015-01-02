(function () {
	'use strict';

	var expect = require ('chai').expect;

	var io = require ('../src/io.js');


	describe ('IO', function () {
		describe ('createPostFilename', function () {
			it ('should produce the right kind of filename', function () {
				var actual, expected, title, date;

				title = 'This Is the Title of a Post';
				date = new Date ('2014-08-20 19:54');

				expected = '2014-08-20-this-is-the-title-of-a-post';
				actual = io.getPostFilename (title, date);

				expect (actual).to.equal (expected);
			});
		});

		describe ('createPostDirectoryPath', function () {
			it ('should produce the correct directory path without parent path', function () {
				var actual, date, expected;

				date = new Date ('2014-08-20 19:54');

				expected = '2014/08/';
				actual = io.getPostDirectoryPathname (date);

				expect (actual).to.equal (expected);
			});
		});
	});
} ());
