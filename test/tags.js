(function () {
	'use strict';

	var expect = require ('chai').expect;
	var _ = require ('underscore-contrib');

	var tags = require ('../src/tags.js');


	describe ('Tags', function () {
		describe ('addPostToTagGroup', function () {
			it ('should add a single post to a new tag', function () {
				var actual, expected, filename, post, tagGroup, tagname;

				tagname = 'Miscellany';
				filename = '2014-12-20-first-post';

				expected = createTagGroup (tagname);
				expected [tagname].posts.push (filename);

				post = {};
				post.tags = [tagname];
				post.filename = filename;

				tagGroup = createTagGroup (tagname);
				
				actual = tags.addPostToTagGroup (tagGroup, post.filename);

				expect (actual).to.eql (expected);
			});

			it ('should add two posts to a new tag', function () {
				var actual, expected, filenames, post, tagGroup, tagname;

				tagname = 'Miscellany';
				filenames = ['2014-12-20-first-post', '2014-12-21-second-post'];

				expected = createTagGroup (tagname);
				expected [tagname].posts = expected [tagname].posts.concat (filenames);

				tagGroup = createTagGroup (tagname);
				
				actual = _.reduce (filenames, function (res, filename) {
					return tags.addPostToTagGroup (res, filename);
				},
				tagGroup);

				expect (actual).to.eql (expected);
			});
		});

		describe ('createTagGroup', function () {
			it ('should return an empty group with the proper name', function () {
				var actual, expected;

				expected = {
					'Miscellany': {
						posts: []
					}
				};

				actual = tags.createTagGroup ('Miscellany');

				expect (actual).to.eql (expected);
			});
		});
	});


	function createTagGroup (tagname) {
		var tagGroup;

		tagGroup = {};
		tagGroup [tagname] = {
			posts: []
		};

		return tagGroup;
	}
} ());
