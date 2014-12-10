(function () {
	'use strict';

	var jade = require ('jade');
	var arch = require ('./archives');
	var io = require ('./io');
	var processor = require ('./processor');

	function compile () {
		var archives, entriesCompiler, posts;

		posts = processor.processDirectory (io.inboxPath);

		archives = arch.getArchives ();
		archives = processor.processArchives (posts, archives);
		archives = processor.processPage (JSON.stringify (archives));

		io.writeFile ('resources/data/archives.json', JSON.stringify (archives.posts));

		compileArchives (archives);

		io.writeFile (archives.path + archives.filename + '.md', archives.output);

		posts.forEach (function (post) {
			compilePost (post);

			io.createPostDirectory (io.postsPath + post.path);

			io.savePage (post);
		});
	}

	function compileFileWithJade (file, prettify) {
		compiler = jade.compileFile (file.template, { pretty: prettify });

		return compiler (file);
	}

	// Runs the archives.html page through Jade
	function compileArchives (archives) {
		archives.posts.reverse (); // Reverse ordering so newest is at the top

		archives.output = compileFileWithJade (archives, true);
	}

	// Runs a post through Jade
	function compilePost (post) {
		post.output = compileFileWithJade (post, true);
	}

	module.exports.compile = compile;
	module.exports.compilePost = compilePost;
} ());
