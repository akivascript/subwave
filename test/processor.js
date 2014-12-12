(function () {
	'use strict';

	var expect = require ('chai').expect;
	var proc = require ('../src/processor.js');
	var sinon = require ('sinon');
	var actual, expected;

	var postA = {
		title: 'Post Title',
		author: 'Audrey Doe',
		date: new Date ('2009/01/15'),
		filename: '2009-01-15-post-title'
	};

	var postB = {
		title: 'Post Title',
		author: 'Toby Doe',
		date: new Date ('2010/08/20'),
		filename: '2010-08-20-post-title'
	};

	function callBidirect (objA, objB, fn) {
		var resultA, resultB;

		resultA = fn (objA, objB);
		resultB = fn (objB, objA);

		return resultA && resultB;
	}

	describe ('Processor', function () {
		describe ('comparePosts', function () {
			it ('should return true when two posts are identical', function () {
				var sameAsPostA;

				sameAsPostA = {
					title: 'Post Title',
					author: 'Audrey Doe',
					date: new Date ('2009/01/15'),
					filename: '2009-01-15-post-title'
				};

				expected = true;
				actual = callBidirect (postA, sameAsPostA, proc.comparePosts);

				expect (actual).to.equal (expected);
			});

			it ('should return false when two posts are different', function () {
				expected = false;
				actual = callBidirect (postA, postB, proc.comparePosts);

				expect (actual).to.equal (expected);
			});

			it ('should return false when one post is undefined', function () {
				var undefinedPost;

				expected = false;
				actual = callBidirect (postA, undefinedPost, proc.comparePosts);
				
				expect (actual).to.equal (expected);
			});
		});
	});
} ());
