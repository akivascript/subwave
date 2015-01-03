(function () {
	'use strict';

	var expect = require ('chai').expect;
	var _ = require ('underscore-contrib');

	var tags = require ('../src/tags.js');


	describe ('Tags', function () {
		describe ('addPostToTag', function () {
			it ('should add a single post to a new tag', function () {
				var actual, expected, filename, post, tag, tagname;

				tagname = 'Miscellany';
				filename = '2014-12-20-first-post';

				expected = createTag (tagname);
				expected [tagname].posts.push (filename);

				post = {};
				post.tags = [tagname];
				post.filename = filename;

				tag = createTag (tagname);
				
				actual = tags.addPostToTag (tag, post.filename);

				expect (actual).to.eql (expected);
			});

			it ('should add two posts to a new tag', function () {
				var actual, expected, filenames, post, tag, tagname;

				tagname = 'Miscellany';
				filenames = ['2014-12-20-first-post', '2014-12-21-second-post'];

				expected = createTag (tagname);
				expected [tagname].posts = expected [tagname].posts.concat (filenames);

				tag = createTag (tagname);
				
				actual = _.reduce (filenames, function (res, filename) {
					return tags.addPostToTag (res, filename);
				},
				tag);

				expect (actual).to.eql (expected);
			});
		});

		describe ('createTag', function () {
			it ('should return an empty tag object with the proper name', function () {
				var actual, expected;

				expected = {
					'Miscellany': {
						posts: []
					}
				};

				actual = tags.createTag ('Miscellany');

				expect (actual).to.eql (expected);
			});
		});
	});


	function createTag (tagname) {
		var tag;

		tag = {};
		tag [tagname] = {
			posts: []
		};

		return tag;
	}
} ());
