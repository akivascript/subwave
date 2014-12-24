// Collects all specific functions related to tagging.
(function () {
	'use strict';

	var marked = require ('marked');

	var pa = require ('./pages');
	var io = require ('./io');

	marked.setOptions ({
		smartypants: true
	});


	function addTags (tags, taglist) {
		tags.forEach (function (tag) {
			if (!taglist.some (function (t) {
				return t === tag;
			})) {
				taglist.push ({
					tag: tag,
					posts: []
				});
			}
		});
	}


	function createTagPages (state) {
		for (var t in state.tags) {
			var page, spost, tag, tpost;

			tag = state.tags [t];
			page = createTagPage (t, tag);

			for (var tp in tag.posts) {
				tpost = tag.posts [tp];

				for (var sp in state.posts) {
					spost = state.posts [sp];

					if (spost.filename === tpost) {
						page.posts.push ({
							title: spost.title,
							displayTitle: marked (spost.title),
							filename: spost.filename,
							path: io.getPostDirectoryPathname (spost.date)
						});
					}
				}
			}

			pa.savePage (page, state.tags);
		}
	}

	function createTagPage (t, tag) {
		var name, tagPage;
 
		name = t;
		
		tagPage = {
			type: 'tagpage',
			title: name,
			filename: name.toLowerCase (),
			posts: [],
			template: io.templatesPath + 'tag.jade'
		};

		return tagPage;
	}

	module.exports.createTagPages = createTagPages;
} ());
