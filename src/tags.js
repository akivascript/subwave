// Collects all specific functions related to tagging.
(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var pa = require ('./pages');
	var io = require ('./io');
	

	// Adds a post to any tags the post is tagged with. Yes, that's somehow English.
	// This is used for generation the tag index pages.
	function addPostToTagGroup (tagGroup, filename) {
		var key, posts;

		key = _.compose (_.first, _.keys) (tagGroup);
		tagGroup [key].posts = _.uniq (tagGroup [key].posts.concat (filename));
		
		return tagGroup;
	}


	// Creates a new, empty tag group
	function createTagGroup (tagName) {
		var tagGroup;

		tagGroup = {};
		tagGroup [tagName] = {
			posts: []
		};

		return tagGroup;
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


	function createTagPage (tag) {
		var tagPage;
 
		tagPage = {
			type: 'tagpage',
			title: tag,
			filename: tag.toLowerCase (),
			posts: [],
			template: config.paths.templates + 'tag.jade'
		};

		return tagPage;
	}


	module.exports.addPostToTagGroup = addPostToTagGroup;
	module.exports.createTagGroup = createTagGroup;
	module.exports.createTagPages = createTagPages;
} ());
