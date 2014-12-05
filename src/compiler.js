(function () {
	'use strict';

	var md = require ('markdown').markdown;
	var io = require ('./io');

	var parentDir = 'resources/public/';
	var postsPath = parentDir + 'posts/'
	
	function parsePage (filename) {
		var body, frontMatter, matches, outputName, outputPath, pattern, srcFile;
		
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

		outputName = io.createPostFilename (frontMatter.title, frontMatter.date);
		outputPath = io.createPostDirectoryPath (frontMatter.date, postsPath);

		io.savePage (outputPath, outputName, body);
	}
} ());
