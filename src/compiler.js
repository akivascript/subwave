// This is the 'heart' of subwave. It processes all incoming posts and pages from 
// the inbox and generates necessary support pages such as archives.html.
(function () {
	'use strict';

	var ar = require ('./archives');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var st = require ('./state');
	var ta = require ('./tags');

	// Ceci n'est pas un commentaire.
	function compile () {
		var archives, homePage, newEntries, posts, state;

		state = st.getState ();
		posts = po.getNewPosts ();

		if (!posts) {
			return 'No new posts found.';
		}

		newEntries = ar.createNewEntries (posts);

		if (newEntries) {
			state.posts = state.posts.concat (newEntries);

			newEntries.forEach (function (entry) {
				st.addPostToTagGroups (state, entry);
			});
		}

		st.saveState (state);

		// We handle appending the archives first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (state, posts);

		archives = ar.createArchives (state.posts);
		archives = pa.createPage (JSON.stringify (archives));

		ar.saveArchives (archives);

		posts.forEach (function (post) {
			po.savePost (post);
		});

		ta.createTagPages (state);
		
		homePage = pa.createHomePage ([posts [posts.length - 1]]);
		homePage.tags = state.tags;

		pa.savePage (homePage);
	}

	module.exports.compile = compile;
} ());
