// Collects all specific functions related to tagging.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var pa = require ('./pages');
	var io = require ('./io');
	

	// Adds a post to any tags the post is tagged with. Yes, that's somehow English.
	// This is used for generation the tag index pages.
	function addPostToTag (tag, filename) {
		tag.posts = _.uniq (tag.posts.concat (filename));
		
		return tag;
	}


	// Creates a new, empty tag
	function createTag (name) {
		return {
			name: name,
			posts: []
		};
	}


	function createTagPages (repo) {
		var page;

		_.each (repo.tags, function (tag) {
			page = createTagIndex (tag);

			_.each (tag.posts, function (postTag) {
				_.each (repo.posts, function (post) {
					if (post.filename === postTag) {
						page.posts.push ({
							title: post.title,
							displayTitle: pa.convertToHtml (post.title),
							filename: post.filename,
							path: io.getPostDirectoryPathname (post.date)
						});
					}
				});
				
			});

			page.posts = _.sortBy (page.posts, function (post) { return post.title; });

			pa.savePage (page, repo.tags);
		});
	}


	// Returns a fresh tag index object.
	function createTagIndex (tag) {
		return {
			type: 'tag',
			title: tag.name,
			filename: tag.name.toLowerCase (),
			posts: [],
			template: config.paths.templates + 'tag.jade'
		};
	}


	module.exports.addPostToTag = addPostToTag;
	module.exports.createTag = createTag;
	module.exports.createTagPages = createTagPages;
} ());
