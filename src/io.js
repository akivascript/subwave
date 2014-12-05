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
		if (!page) {
			throw Error ('savePage requires a page.');
		}

		createPostDirectory (page.path);

		writeFile (page.path + '/' + page.filename + '.html', page.output);
	}

	module.exports.createPostDirectoryPath 	= createPostDirectoryPath;
	module.exports.createPostFilename			 	= createPostFilename;
	module.exports.getFileList							= getFileList;
	module.exports.readFile									= readFile;
	module.exports.writeFile								= writeFile;
	module.exports.savePage									= savePage;
} ());
