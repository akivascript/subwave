(function () {
	'use strict';

	var ar = require ('./archives');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var pr = require ('./processor');

	function compile () {
		var archives, homePage, newEntries, posts;

		archives = ar.getArchives ();
		posts = po.getPosts ();
		newEntries = ar.createNewEntries (posts);
		homePage = pa.createHomePage ([posts [posts.length - 1]]);

		if (newEntries) {
			archives.posts = archives.posts.concat (newEntries);
		}

		// We handle appending the archives first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (archives, posts);

		archives = pr.createPage (JSON.stringify (archives));

		ar.saveArchives (archives);

		po.savePosts (posts);

		pa.savePage (homePage);
	}

	module.exports.compile = compile;
} ());
