(function () {
	'use strict';

	var expect = require ('chai').expect;
	var compiler = require ('../src/compiler.js');

	describe ('Compiler', function () {
		describe ('parseFrontMatter', function () {
			it ('should properly parse', function () {
				var frontMatterString = "{ \"title\": \"This is the title of the post\"," +
																"\"author\": \"John Doe\"," +
																"\"date\": \"2014-01-15 19:54\" }";

				var frontMatter = JSON.parse (frontMatterString);

				expect (frontMatter.title).to.equal ("This is the title of the post");
				expect (frontMatter.author).to.equal ("John Doe");
				expect (frontMatter.date).to.equal ("2014-01-15 19:54");
			});
		});
	});
} ());
