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

				actual = testTarget.createArchive (expected);

				expect (actual).to.eql (expected);
			});
		});
	});
} ());
