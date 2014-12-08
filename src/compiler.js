(function () {
	'use strict';

	var jade = require ('jade');
	var arch = require ('./archives');
	var io = require ('./io');
	var processor = require ('./processor');

	function compile () {
		var archives, entriesCompiler, posts, path;

		path = io.inboxPath;

		posts = processor.processDirectory (path);

		archives = arch.getArchives ();
		archives = processor.processArchives (posts, archives);
		archives = processor.processPage (JSON.stringify (archives));

		io.writeFile ('resources/data/archives.json', JSON.stringify (archives.posts));

		compileArchives (archives);

		io.writeFile (archives.path + archives.filename, archives.output);

		posts.forEach (function (post) {
			compilePost (post);

			io.createPostDirectory (io.postsPath + post.path);

			io.savePage (post);
		});
	}

	function compileArchives (archives) {
		var compiler;

		archives.posts.reverse (); // Reverse ordering so newest is at the top

		compiler = jade.compileFile (archives.template, { pretty: true });
		archives.output	= compiler (archives);
	}

	function compilePost (post) {
		var compiler;

		compiler = jade.compileFile (post.template, { pretty: true });
		post.output = compiler (post);
	}

	module.exports.compile = compile;
	module.exports.compilePost = compilePost;
} ());
