(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $io = require ('./io');
	var $pages = require ('./pages');


	function addPostToMiniposts (posts, post) {
		var _post;

		_post = $pages.findById (posts, post.id);
			
		if (_.isEmpty (_post)) {
			posts.push (post);
		} else {
			posts [_post.index] = post;
		}
		
		return posts;
	}


	function compileMiniposts (page, tags) {
		var compileFn;

		compileFn = function (page) {
			page.title = $config.miniposts.title;

			return _.map (page.posts, function (post) {
				post.displayDate = $pages.formatDateForDisplay (post.date);
				post.content = $pages.convertToHtml (post.content);

				return post;
			});
		};

		return $pages.compilePage (page, tags, compileFn);
	}


	function createMiniposts () {
		return {
			type: 'mini',
			posts: []
		};
	}


	function findPost (posts, id) {
		var result;

		result = {};
		result.post = _.findWhere (posts, { id: id });

		if (result.post) {
			result.index = _.indexOf (posts, result.post);

			return result;
		}

		return {};
	}


	function loadMiniposts (path) {
		return $pages.getPages ($config.paths.repository + $config.miniposts.title.toLowerCase () + '/');
	}


	function processMinipost (item) {
		item.date = new Date (item.date);
		item.displayDate = $pages.formatDateForDisplay (item.date);
		item.content = $pages.convertToHtml (item.content);

		return item;
	}


	function publishMiniposts (posts, repo) {
		var page;

		posts = posts.concat (loadMiniposts ());

		page = _.compose ($pages.createPage, createMiniposts) ();

		page.posts = _.reduce (posts, function (res, post) {
			return addPostToMiniposts (page.posts, post);
		}, page.posts);

		page.posts = _.flatten (_.sortBy (page.posts, function (post) { 
			return -(new Date (post.date)); }));

		saveMiniposts (page, repo.tags);
	}


	function saveMiniposts (page, tags) {
		var date, filename, output, repoPostsPath;

		repoPostsPath = $config.paths.repository + $config.miniposts.title.toLowerCase () + '/';
		
		// Move new miniposts to the repository
		_.each (page.posts, function (post) {
			date = new Date (post.date);
			filename = $io.getPostFilename (post.title, post.date);

			output = JSON.stringify (_.pick (post, 'type', 'id', 'title', 'author', 'date'),
															null, '  ');
			output = output + '\n\n' + post.content;

			$io.writeFile (repoPostsPath + 
										($io.getPostFilename (post.title, post.date)) + 
										'.md', output);

			$io.removeFile ($config.paths.inbox + post.origFilename);
		});

		page.output = compileMiniposts (page, tags);
		
		page.filename = '1'; // Temporary until pagination

		$io.saveHtmlPage (page);
	}

	
	module.exports.loadMiniposts = loadMiniposts;
	module.exports.processMinipost = processMinipost;
	module.exports.publishMiniposts = publishMiniposts;
} ());
