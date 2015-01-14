// Collects all specific functions related to tagging.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $pages = require ('./pages');
	var $io = require ('./io');
	

	// Adds a post to any tags the post is tagged with. Yes, that's somehow English.
	// This is used for generation the tag index pages.
	function addPostToTag (tag, filename) {
		tag.posts = _.uniq (tag.posts.concat (filename));
		
		return tag;
	}


	// Creates a tag object
	function createTag (name) {
		return {
			name: name,
			posts: []
		};
	}


	// Creates tag list object which lists all of the extant tags
	function createTagListPage () {
		return {
			type: 'taglist',
			name: 'Tags',
			tags: []
		};
	}


	// Creates a tag page object for an individual tag
	function createTagPage (tag) {
		return {
			type: 'tag',
			name: tag.name,
			posts: []
		};
	}


	function publishTags (repo) {
		var taglist, tagpage; 

		taglist = _.compose ($pages.createPage, createTagListPage) ();
			
		_.each (repo.tags, function (tag) {
			tagpage = _.compose ($pages.createPage, createTagPage) (tag);
			taglist.tags = taglist.tags.concat (tag);

			// Add all necessary post information from posts whic
			// have been tagged with this tag
			_.each (tag.posts, function (postTag) {
				_.each (repo.posts, function (post) {
					if (post.filename === postTag) {
						tagpage.posts.push ({
							title: post.title,
							displayTitle: $pages.convertToHtml (post.title),
							filename: post.filename,
							path: $io.getPostDirectoryPathname (post.date)
						});
					}
				});
			});

			tagpage.posts = _.sortBy (tagpage.posts, function (post) { return post.title; });

			// Save individual tag index pages
			$pages.savePage (tagpage, repo.tags);
		});

		taglist.tags = _.sortBy (taglist.tags, function (tag) { return tag.name; });

		// Saves a central tag index page
		$pages.savePage (taglist, repo.tags);
	}


	module.exports.addPostToTag = addPostToTag;
	module.exports.createTag = createTag;
	module.exports.publishTags = publishTags;
} ());
