(function () {

	var fs = require ('fs');
	var md = require ('mkdirp');

	function createPostDirectoryPath (date, path) {
		var newPath, dateArray;

		if (!date) {
			throw Error ('createPostDirectoryPath requires a date.');
		}

		dateArray = date.split (' ');
		newPath = dateArray [0].replace (/(\d{4})-(\d{2})-\d{2}/, '$1/$2');

		if (path) {
			return path + newPath;
		}

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

		return (dateArray [0] + '-' + newTitle + '.md').toLowerCase ();
	}

	function getFileList (path) {
		var fileList;

		if (!path) {
			throw Error ('getFileList requires a path.');
		}

		fileList = fs.readdirSync (path);

		return fileList.filter (function (file) {
			return file.search (/^(\w|\d|-)+(.md)$/);
		});
	}

	function createPostDirectory (path) {
		if (!path) {
			throw Error ('createPostDirectory requires both a path');
		}

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

	function savePage (path, title, content) {
		if (!path || !title || !content) {
			throw Error ('processPage requires a path, title, and content.');
		}

		createPostDirectory (path);

		writeFile (path + '/' + title, content);
	}

	module.exports.createPostDirectoryPath 	= createPostDirectoryPath;
	module.exports.createPostFilename			 	= createPostFilename;
	module.exports.savePage									= savePage;
	module.exports.readFile									= readFile;
} ());
