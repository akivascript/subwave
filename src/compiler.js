(function () {
	'use strict';

	var ar = require ('./archives');
	var io = require ('./io');
	var po = require ('./posts');
	var pr = require ('./processor');

	function compile () {
		var archives, newEntries, posts;

		archives = ar.getArchives ();
		posts = po.getPosts ();
		newEntries = ar.createNewEntries (posts);

		if (newEntries) {
			archives.posts = archives.posts.concat (newEntries);
		}

		po.handlePostsWithSiblings (archives, posts);

		archives = pr.createPage (JSON.stringify (archives));

		ar.saveArchives (archives);

		po.savePosts (posts);
	}

	module.exports.compile = compile;
} ());
