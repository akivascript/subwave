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
		var key, posts;

		key = _.compose (_.first, _.keys) (tag);
		tag [key].posts = _.uniq (tag [key].posts.concat (filename));
		
		return tag;
	}


	// Creates a new, empty tag
	function createTag (name) {
		var tag;

		tag = {};
		tag [name] = {
			posts: []
		};

		return tag;
	}


	function createTagPages (state) {
		for (var t in state.tags) {
			var page, spost, tag, tpost;

			tag = state.tags [t];
			page = createTagPage (tag);

			for (var tp in tag.posts) {
				tpost = tag.posts [tp];

				for (var sp in state.posts) {
					spost = state.posts [sp];

					if (spost.filename === tpost) {
						page.posts.push ({
							title: spost.title,
							displayTitle: pa.convertToHtml (spost.title),
							filename: spost.filename,
							path: io.getPostDirectoryPathname (spost.date)
						});
					}
				}
			}

			pa.savePage (page, state.tags);
		}
	}


	function createTagIndex (tag) {
		var tagIndex;
 
		tagIndex = {
			type: 'tagIndex',
			title: tag,
			filename: tag.toLowerCase (),
			posts: [],
			template: config.paths.templates + 'tagIndex.jade'
		};

		return tagIndex;
	}


	module.exports.addPostToTag = addPostToTag;
	module.exports.createTag = createTag;
	module.exports.createTagPages = createTagPages;
} ());
