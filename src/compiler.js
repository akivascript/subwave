(function () {
	'use strict';

	var ar = require ('./archives');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var st = require ('./state');

	function compile () {
		var archives, homePage, newEntries, posts, state;

		state = st.getState ();
		posts = po.getPosts ();
		newEntries = ar.createNewEntries (posts);
		homePage = pa.createHomePage ([posts [posts.length - 1]]);

		if (newEntries) {
			state.posts = state.posts.concat (newEntries);
		}

		// We handle appending the archives first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (state, posts);

		archives = ar.createArchives (state.posts);
		archives = pa.createPage (JSON.stringify (archives));

		ar.saveArchives (archives);

		po.savePosts (posts);

		pa.savePage (homePage);

		st.saveState (state);
	}

	module.exports.compile = compile;
} ());
