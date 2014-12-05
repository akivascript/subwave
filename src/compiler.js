(function () {
	'use strict';

	var jade = require ('jade');
	var io = require ('./io');
	var md = require ('markdown').markdown;

	var parentDir = 'resources/public/';
	var postsPath = parentDir + 'posts/';
	
	function parsePage (filename) {
		var body, compiler, content, frontMatter, matches, outfile, output, path, pattern, srcFile;
		
		if (!filename) {
			throw Error ("parsePage requires a filename.");
		}

		pattern = /(\{(?:.|\n)+\})(?:\n)+((.|\n)+)/;
		srcFile = io.readFile (filename);
		matches = srcFile.match (pattern);

		if (matches.length === 0) {
			throw Error ("The file isn't the correct format.");
		}

		frontMatter = JSON.parse (matches [1]);
		body = md.toHTML (matches [2]);

		content = {};

		for (var attr in frontMatter) {
			content [attr] = frontMatter [attr];
		}

		content.body = body;

		outfile = io.createPostFilename (frontMatter.title, frontMatter.date);
		path = io.createPostDirectoryPath (frontMatter.date, postsPath);
		compiler = jade.compileFile ('resources/templates/post.jade', { pretty: true });

		output = compiler (content);
		
		io.savePage (path, outfile, output);
	}

	//parsePage ('resources/inbox/new_post.md');
} ());
