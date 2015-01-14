(function () {
	'use strict';

	var _ = require ('underscore');

	var $config = require ('../config');
	var $io = require ('./io');
	var $pages = require ('./pages');


	// The various info pages, usually static pages such as an About page
	// are handled by this function.
	function publishInfo (pages, repo) {
		_.each (pages, function (page) {
			page = $pages.createPage (page);

			$pages.savePage (page, repo.tags);

			$io.renameFile ($config.paths.inbox + page.origFilename, 
										 $config.paths.repository + page.origFilename);
		});
	}

	module.exports.publishInfo = publishInfo;
} ());
