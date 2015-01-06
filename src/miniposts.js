(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');


	function addPostToMiniposts (posts, post) {
		return posts.concat (post);
	}


	function compileMiniposts (page, tags) {
		var compileFn;

		compileFn = function (page) {
			page.title = cf.miniposts.title;

			return _.map (page.posts, function (post) {
				post.displayDate = pa.formatDateForDisplay (post.date);
				post.content = pa.convertToHtml (post.content);

				return post;
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


	function loadMiniposts (path) {
		return pa.getPages (cf.paths.repository + cf.miniposts.title.toLowerCase () + '/');
	}


	function publishMiniposts (posts, repo) {
		var date, filename, oldPosts, page, repoPostsPath;

		page = _.compose (pa.createPage, createMiniposts) ();

		// To be refactored later...
		page.posts = _.reduce (posts, function (res, post) {
			return res.concat (addPostToMiniposts (page.posts, post));
		}, []);

		oldPosts = loadMiniposts ();

		if (oldPosts.length > 0) {
			page.posts.push (oldPosts);
			
			page.posts = _.flatten (_.sortBy (page.posts, function (post) { return post.date; }));
		}

		page.posts.reverse ();

		repoPostsPath = cf.paths.repository + cf.miniposts.title.toLowerCase () + '/';

		io.createDirectory (repoPostsPath);

		// Move miniposts to the repository
		_.each (page.posts, function (post) {
			date = convertStringToDate (post.date);
			filename = io.getPostFilename (post.title, post.date);

			io.renameFile (cf.paths.inbox + post.origFilename, 
										 repoPostsPath + filename + '.md'); 
		});

		saveMiniposts (page, repo.tags);
	}


	function saveMiniposts (posts, tags) {
		posts.output = compileMiniposts (posts, tags);
		
		posts.filename = '1'; // Temporary until pagination

		io.saveHtmlPage (posts);
	}


	// Takes a string in the format of 'YYYY-MM-DD HH:MM' and returns a
	// Date object.
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}

	
	module.exports.loadMiniposts = loadMiniposts;
	module.exports.publishMiniposts = publishMiniposts;
} ());
