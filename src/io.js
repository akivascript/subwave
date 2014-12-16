(function () {
	'use strict';

	var fs = require ('fs');
	var md = require ('mkdirp');

	var resourcesPath = 'resources/';
	var inboxPath	= resourcesPath + 'inbox/';
	var archivePath = resourcesPath + 'archive/';
	var publicPath = 'public/';
	var postsPath = publicPath + 'posts/';
	var templatesPath = resourcesPath + 'templates/';

	function createPostDirectory (path) {
		// mkdirp allows us to create directory structures in one go.
		// e.g. '2014/12/'
		md.mkdirp.sync (path);
	}

	function getPostDirectoryPathname (date) {
		var newPath, dateArray;

		dateArray = parseDate (date);
		newPath = dateArray [0] + '/' + dateArray [1] + '/';

		return newPath;
	}

	function getPostFilename (title, date) {
		var dateArray, day, month, newTitle, titleArray, year;

		titleArray = title.split (' ');
		newTitle = titleArray.join ('-');
		dateArray = parseDate (date);

		return (dateArray.join ('-') + '-' + newTitle).toLowerCase ();
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

	function parseDate (date) {
		var day, month, year;
 
		year = date.getFullYear ();
		month = ('0' + (date.getMonth () + 1)).slice (-2);
		day = ('0' + date.getDate ()).slice (-2);

		return [year, month, day];
	}

	function readFile (filename) {
		return fs.readFileSync (filename, 'utf8');
	}

	function readFiles (path, fn) {
		var filelist, files;

		files = [];
		filelist = getFileList (path);

		filelist.forEach (function (file) {
			file = readFile (path + file);

			files.push (fn (file));
		});

		return files;
	}

	function savePage (page) {
		var path;

		if (page.type === 'post') {
			path = postsPath;
		} else if (page.type === 'page' || 
							 page.type === 'archives' ||
							 page.type === 'index') {
			path = publicPath;
		} else {
			throw {
				name: 'Error',
				message: 'Unable to determine page type.'
			};
		}

		if (page.path) {
			path = path + page.path;
		}

		writeFile (path + '/' + page.filename + '.html', page.output);
	}

	function writeFile (filename, content) {
		fs.writeFileSync (filename, content);
	}
	
	module.exports.createPostDirectory = createPostDirectory;
	module.exports.getPostDirectoryPathname = getPostDirectoryPathname;
	module.exports.getPostFilename = getPostFilename;
	module.exports.readFile = readFile;
	module.exports.readFiles = readFiles;
	module.exports.writeFile = writeFile;
	module.exports.savePage = savePage;

	module.exports.inboxPath = inboxPath;
	module.exports.archivePath = archivePath;
	module.exports.postsPath = postsPath;
	module.exports.resourcesPath = resourcesPath;
	module.exports.templatesPath = templatesPath;
} ());
