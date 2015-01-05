(function () {
	'use strict';

	var _ = require ('underscore');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');


	// The various info pages, usually static pages such as an About page
	// are handled by this function.
	function publishInfo (pages, repo) {
		_.each (pages, function (page) {
				pa.savePage (page, repo.tags);

				io.renameFile (cf.paths.inbox + page.origFilename, 
											 cf.paths.repository + page.origFilename);
			});
	}

	module.exports.publishInfo = publishInfo;
} ());
