(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var io = require ('./io');
	var pa = require ('./pages');


	function addPostToMiniposts (posts, post) {
		return posts.concat (post);
	}


	function compileMiniposts (page, tags) {
		var compileFn;

		compileFn = function (page) {
			_.map (page.posts, function (post) {
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.content = pa.convertToHtml (post.content);
			});
		};

		return pa.compilePage (page, tags, compileFn);
	}


	function createMiniposts () {
		return {
			type: 'mini',
			posts: []
		};
	}


	function publishMiniposts (posts, repo) {
		var page;

		page = _.compose (pa.createPage, createMiniposts) ();

		page.posts = _.reduce (posts, function (res, post) {
			return res.concat (addPostToMiniposts (page.posts, post));
		}, []);

		saveMiniposts (page, repo.tags);
	}


	function saveMiniposts (posts, tags) {
		posts.output = compileMiniposts (posts, tags);
		
		posts.filename = 'page1';

		io.saveHtmlPage (posts);
	}

	
	module.exports.publishMiniposts = publishMiniposts;
} ());
