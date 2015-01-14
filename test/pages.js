(function () {
	'use strict';

	var expect = require ('chai').expect;
	var fs = require ('fs-extra');
	var _ = require ('underscore-contrib');

	var pages = require ('../src/pages.js');

	var testFiles = './test/files/';


	describe ('Pages', function () {
		describe ('copyObject', function () {
			it ('should clone an object when no attributes are supplied', function () {
				var actual, expected;

				expected = {
					attrA: 'this',
					attrB: 'that',
					attrC: {
						subAttr1: 'and',
						subAttr2: 'the other'
					}
				};
				
				actual = pages.copyObject (expected);

				expect (actual).to.eql (expected);
			});

			it ('should copy an object populated only with the specified attributes', function () {
				var actual, expected, object, tags;

				object = {
					attrA: 'this',
					attrB: 'that',
					attrC: {
						subAttr1: 'and',
						subAttr2: 'the other'
					}
				};

				expected = {
					attrA: 'this',
					attrB: 'that'
				};

				tags = ['attrA', 'attrB'];

				actual = pages.copyObject (object, tags);

				expect (actual).to.eql (expected);
			});
		});

		describe ('getExcerpt', function () {
			it ('should return only the excerpt of a larger text', function () {
				var actual, excerpt, expected, text;

				excerpt = 'This is the excerpt.';
				text = '<excerpt>' + excerpt + '</excerpt> This is the rest of the text.';
				expected = excerpt;

				actual = pages.getExcerpt (text);

				expect (actual).to.equal (expected);
			});

			it ('should return the entire text if no excerpt specified', function () {
				var actual, expected;

				expected = 'There should be no excerpt. This is the rest of the text.';

				actual = pages.getExcerpt (expected);

				expect (actual).to.equal (expected);
			});

			it ('should return an empty string if an empty string is the input', function () {
				var actual, expected;

				expected = '';

				actual = pages.getExcerpt (expected);

				expect (actual).to.equal (expected);
			});
		});

		describe ('getContent', function () {
			it ('should return only the body portion of a post file', function () {
				var actual;

				fs.readFile (testFiles + 'post.md', { encoding: 'utf8' }, function (err, input) {
					if (err) {
						throw err;
					}

					fs.readFile (testFiles + 'post-body.md', { encoding: 'utf8' }, function (err, expected) {
						if (err) {
							throw err;
						}

						actual = pages.getContent (input);

						expect (actual).to.equal (expected);
					});
				});
			});

			it ('should throw an error if the input is empty', function () {
				var fn;

				fn = function () { pages.getContent (); };

				expect (fn).to.throw (Error);
			});
		});

		describe ('getMetadata', function () {
			it ('should return only the body portion of a post file', function () {
				var actual;

				fs.readFile (testFiles + 'post.md', { encoding: 'utf8' }, function (err, input) {
					if (err) {
						throw err;
					}

					fs.readFile (testFiles + 'post-metadata.md', { encoding: 'utf8' }, function (err, expected) {
						if (err) {
							throw err;
						}

						expected = JSON.parse (expected); 

						actual = pages.getMetadata (input);

						expect (actual).to.eql (expected);
					});
				});
			});

			it ('should throw an error if the input is empty', function () {
				var fn;

				fn = function () { pages.getMetadata (); };

				expect (fn).to.throw (Error);
			});
		});

		describe ('smartenText', function () {
			it ('should return text with \'smart\' typography in place', function () {
				var actual, expected, text;

				text = 'This\'ll be the example text--it does the thing.';
				expected = 'This’ll be the example text—it does the thing.';

				actual = pages.smartenText (text);

				expect (actual).to.equal (expected);
			});

			it ('should return an empty string when an empty string is passed', function () {
				var actual, expected, text;

				text = '';
				expected = '';

				actual = pages.smartenText (text);

				expect (actual).to.equal (expected);
			});

			it ('should return an unaltered string when the string doesn\'t need altering', function () {
				var actual, expected, text;

				text = 'This text does not require changing.';
				expected = 'This text does not require changing.';

				actual = pages.smartenText (text);

				expect (actual).to.equal (expected);
			});
		});
	});
} ());
