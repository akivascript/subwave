(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var pa = require ('./pages.js');

	
	function addPostToHome (home, post) {
		var posts;

		posts = _.snapshot (home.posts);
		post = _.pick (post, 'displayDate', 'displayTitle', 'tags', 
									 'excerpt', 'content', 'path', 'filename');
		post.content = pa.prepareForDisplay (post.content);

		return posts.concat (post);
	}
	

	function createHome () {
		return {
			type: 'home',
			posts: []
		};
	}


	module.exports.addPostToHome = addPostToHome;
	module.exports.createHome = createHome;
} ());
