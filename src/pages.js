(function () {
	'use strict';

	var jade = require ('jade');

	var io = require ('./io');
	var pr = require ('./processor');

	function compile (page) {
		var compiler;

		compiler = jade.compileFile (page.template, { pretty: true });

		page.displayDate = pr.formatDateForDisplay (page.date);

		return compiler (page);
	}
	
	function createHomePage (posts) {
		var homePage;

		homePage = {
			type: 'index',
			title: 'Backed Up Somewhere',
			filename: 'index',
			posts: posts,
			template: io.templatesPath + 'index.jade'
		};

		return homePage;
	}

	function savePage (page) {
		page.output = compile (page);

		io.savePage (page);
	}

	module.exports.createHomePage = createHomePage;
	module.exports.savePage = savePage;
} ());
