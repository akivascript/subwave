(function () {
	'use strict';

	var fs = require ('fs');
	var md = require ('mkdirp');

	var resourcesPath	= 'resources/';
	var inboxPath	= resourcesPath + 'inbox/';
	var archivePath = resourcesPath + 'archive/';
	var publicPath = 'public/';
	var postsPath = publicPath + 'posts/';

	function createPostDirectoryPathname (date) {
		var newPath, dateArray;

		dateArray = date.split (' ');
		newPath = dateArray [0].replace (/(\d{4})-(\d{2})-\d{2}/, '$1/$2');

		return newPath;
	}

	function createPostFilename (title, date) {
		var newTitle, dateArray, titleArray;

		titleArray = title.split (' ');
		newTitle = titleArray.join ('-');

		dateArray = date.split (' ');

		return (dateArray [0] + '-' + newTitle).toLowerCase ();
	}

	function getFileList (path) {
		var fileList;

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
		// mkdirp allows us to create directory structures in one go.
		// e.g. '2014/12/'
		md.mkdirp.sync (path);
	}

	function readFile (filename) {
		return fs.readFileSync (filename, 'utf8');
	}

	function writeFile (filename, content) {
		fs.writeFileSync (filename, content);
	}

	function savePage (page) {
		var path;

		if (page.type === "post") {
			path = postsPath;
		} else if (page.type === "page" || page.type === "archives") {
			path = publicPath;
		} else {
			throw {
				type: 'Error',
				message: 'Unable to determine page type.'
			}
		}

		path = path + page.path;

		writeFile (path + '/' + page.filename + '.html', page.output);
	}
	
	module.exports.createPostDirectoryPathname = createPostDirectoryPathname;
	module.exports.createPostDirectory = createPostDirectory;
	module.exports.createPostFilename = createPostFilename;
	module.exports.getFileList = getFileList;
	module.exports.readFile = readFile;
	module.exports.writeFile = writeFile;
	module.exports.savePage = savePage;

	module.exports.inboxPath = inboxPath;
	module.exports.archivePath = archivePath;
	module.exports.publicPath = publicPath;
	module.exports.postsPath = postsPath;
} ());
