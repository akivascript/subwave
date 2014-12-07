(function () {
	'use strict';

	var jade = require ('jade');
	var arch = require ('./archives');
	var io = require ('./io');
	var processor = require ('./processor');

	function commitCompile (archives, posts) {
		io.writeFile ('resources/data/archives.json', JSON.stringify (archives.posts));
		io.writeFile (archives.path + archives.filename, archives.output);

		posts.forEach (function (post) {
			io.createPostDirectory (io.postsPath + post.path);
			io.savePage (post);
		});
	}

	function compile () {
		var archives, entriesCompiler, posts, path;

		// TODO: Oof, this needs to be cleared up. From here...
		path = io.inboxPath;

		posts = processor.processDirectory (path);

		archives = arch.getArchives ();
		archives = processor.processArchives (posts, archives);
		archives = processor.processPage (JSON.stringify (archives));

		compileArchives (archives);

		posts.forEach (function (post) {
			compilePost (post);
		});
		// ...to here.

		commitCompile (archives, posts, path);
	}

	function compileArchives (archives) {
		var compiler;

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
