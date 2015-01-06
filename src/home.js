(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var mi = require ('./miniposts');
	var pa = require ('./pages');

	
	function addPostNav (pages) {
		return _.map (pages, function (page, idx) {
			if (idx === 0 && pages.length > 1) {
				page.previous = 'index2';

				return page;
			}

			page.next = 'index';

			if (idx > 1) {
				page.next = page.next + idx;
			}

			if (idx < pages.length - 1) {
				page.previous = 'index' + (idx + 2);
			}

			return page;
		});
	}


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


	// If home page pagination is enabled, a number of 'home pages' are 
	// created split by the number of posts per page set in the config.
	function createPages (posts) {
		return (function loop (posts, pages, idx) {
			var page, i, post, skip, tail;

			i = 1;
			skip = 0;

			if (posts.length < 1) {
				// Add postnav for last page

				return pages;
			}

			page = _.compose (pa.createPage, createHome) ();

			if (cf.index.countPostsOnly) {
				while (skip < posts.length && i <= cf.index.postsPerPage) {
					post = posts [skip];

					page.posts.push (post);
					
					if (post.type === 'post') {
						i = i + 1;
					}

					skip = skip + 1;
				}
			} else {
				page.posts = _.head (posts, cf.index.postsPerPage);

				skip = cf.index.postsPerPage;
			}

			page.posts.reverse ();
			page.filename = 'index';

			if (idx > 1) {
				page.filename = page.filename + idx;
			}

			pages.push (page);

			// If we're not paginating, we're already done
			if (!cf.index.usePagination) {
				return pages;
			}

			return loop (_.tail (posts, skip), 
									 pages, 
									 idx + 1);
		}) (posts, [], 1);
	}


	function processPosts (posts) {
		var miniposts;

		if (cf.index.useExcerpts) {
			posts = _.map (posts,
										 function (post) {
											 if (post.type === 'post' && post.excerpt) {
												 post.excerpt = pa.prepareForDisplay (post.excerpt); 
											 }
											 
											 return post;
										 });
		}

		miniposts = mi.loadMiniposts ();

		if (miniposts.length > 0) {
			posts.push (_.map (miniposts, function (post) {
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.content = pa.convertToHtml (post.content);

				return post;
			}));
			
			posts = _.flatten (posts);
			posts = _.sortBy (posts, function (post) { return new Date (post.date); });
		}

		return posts.reverse ();
	}


	// The home page is generated here. A number of posts specified
	// in the site configuration file are displayed with or without
	// excerpts.
	function publishHome (repo) {
		var page, pages, posts;

		posts = processPosts (repo.posts);
		pages = createPages (posts);
		pages = addPostNav (pages);

		_.each (pages, function (page) {
			pa.savePage (page, repo.tags);
		});
	}


	module.exports.addPostToHome = addPostToHome;
	module.exports.publishHome = publishHome;
} ());
