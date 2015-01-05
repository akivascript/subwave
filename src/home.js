(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var pa = require ('./pages');

	
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


	// The home page is generated here. A number of posts specified
	// in the site configuration file are displayed with or without
	// excerpts.
	function publishHome (repo) {
		var miniposts, page;

		page = _.compose (pa.createPage, createHome) ();

		page.posts = _.map (repo.posts.slice (-cf.index.postCount),
												function (post) {
													post.excerpt = pa.prepareForDisplay (post.excerpt);

													return post;
												});

		miniposts = pa.getPages (cf.paths.repository + cf.miniposts.title.toLowerCase () + '/');

		if (miniposts.length > 0) {
			page.posts.push (_.map (miniposts, function (post) {
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.content = pa.convertToHtml (post.content);

				return post;
			}));
			
			page.posts = _.flatten (page.posts);
			page.posts = _.sortBy (page.posts, function (post) { return new Date (post.date); });
		}

		pa.savePage (page, repo.tags);
	}


	module.exports.addPostToHome = addPostToHome;
	module.exports.publishHome = publishHome;
} ());
