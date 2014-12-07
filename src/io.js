(function () {
	'use strict';

	var fs = require ('fs');
	var md = require ('mkdirp');

	var	resourcesPath =	'resources/';
	var	inboxPath =			resourcesPath + 'inbox/';
	var	archivePath = 	resourcesPath + 'archive/';
	var	publicPath = 		'public/';
	var	postsPath = 		publicPath + 'posts/';
	
	function createPostDirectoryPath (date, path) {
		var newPath, dateArray;

		if (!date) {
			throw Error ('createPostDirectoryPath requires a date.');
		}

		dateArray = date.split (' ');
		newPath = dateArray [0].replace (/(\d{4})-(\d{2})-\d{2}/, '$1/$2');

		return newPath;
	}

	function createPostFilename (title, date) {
		var newTitle, dateArray, titleArray;

		if (!title || !date) {
			throw Error ('createPostFileName requires both title and date.');
		}

		titleArray = title.split (' ');
		newTitle = titleArray.join ('-');

		dateArray = date.split (' ');

		return (dateArray [0] + '-' + newTitle).toLowerCase ();
	}

	function getFileList (path) {
		var fileList;

		if (!path) {
			throw Error ('getFileList requires a path.');
		}

		fileList = fs.readdirSync (path);

		return fileList.filter (function (file) {
			var result = file.search (/((\w|\d|-)+\.md)/);

			if (result === -1) {
				return false;
			}

			return true;
		});
	}

	function createPostDirectory (path) {
		if (!path) {
			throw Error ('createPostDirectory requires both a path');
		}

		// mkdirp allows us to create directory structures in one go.
		// e.g. '2014/12/'
		md.mkdirp.sync (path);
	}

	function readFile (filename) {
		if (!filename) {
			throw Error ('readFile requires a filename.');
		}

		return fs.readFileSync (filename, 'utf8');
	}

	function writeFile (filename, content) {
		if (!filename) {
			throw Error ('writeFile requires a filename.');
		}

		fs.writeFileSync (filename, content);
	}

	function savePage (page) {
		var path;

		if (!page) {
			throw Error ('savePage requires a page.');
		}

		if (page.type === "post") {
			path = postsPath;
		} else if (page.type === "page" || page.type === "archives") {
			path = publicPath;
		} else {
			throw new Error ('Unable to determine page type.');
		}

		path = path + page.path;

		writeFile (path + '/' + page.filename + '.html', page.output);
	}

	module.exports.createPostDirectoryPath 	= createPostDirectoryPath;
	module.exports.createPostFilename			 	= createPostFilename;
	module.exports.getFileList							= getFileList;
	module.exports.readFile									= readFile;
	module.exports.writeFile								= writeFile;
	module.exports.savePage									= savePage;

	module.exports.inboxPath								= inboxPath;
	module.exports.archivePath							= archivePath;
	module.exports.publicPath								= publicPath;
	module.exports.postsPath								= postsPath;
} ());
