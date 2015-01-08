// The gateway between subwave and the disk. All functions related to io are
// gathered here to solemnly lay down tracts of 1s and 0s for great bloggery.
(function () {
	'use strict';

	var fs = require ('fs-extra');
	var moment = require ('moment');
	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var pa = require ('./pages');


	// Copies a file.
	function copyFile (oldPath, newPath) {
		fs.copySync (oldPath, newPath);
	}


	function createNewFile (type) {
		var content, filename, metadata;
		
		if (type === 'post') {
			metadata = {
				type: type,
				id: $pages.generateId (),
				title: 'Untitled',
				author: 'John Doe',
				date: formatDateForMetadata (Date.now ()),
				tags: []
			};
		} else {
			metadata = {
				type: type,
				title: 'Untitled',
				author: 'John Doe'
			};
		}
			
		content = JSON.stringify (metadata, null, '\t') + '\n\nWhat\'s up?';

		if (type === 'post') {
			filename = getPostFilename ('untitled', Date.now ()) + '.md';
		} else {
			filename = 'untitled.md';
		}

		writeFile ($config.paths.inbox + filename, content);

		console.log ('Successfully created new ' + metadata.type + ' in inbox: ' + filename);
	}


	function createDirectory (path) {
		fs.ensureDirSync (path);
	}


	// Converts a Date object into the string expected in a new post file.
	function formatDateForMetadata (date) {
		return moment (date).format ('YYYY-MM-DD HH:mm');
	}


	// Returns an array of the contents of a recursed path.
	function getFiles (path, filelist) {
		var i, node, nodes, stats;

		if (!filelist) {
			filelist = {};
		}

		nodes = fs.readdirSync (path);

		for (i = 0; i < nodes.length; i++) {
			node = nodes [i];

			stats = fs.statSync (path + node);

			if (stats.isDirectory ()) {
				getFiles (path + node + '/', filelist);
			} else if (stats.isFile ()) {
				filelist [node] = path;
			} 
		}

		return filelist;
	}


	// Examines the date (expected to be from a post) to generate the year/month
	// path used as described in createPostDirectory above.
	function getPostDirectoryPathname (date) {
		var newPath, dateArray;

		dateArray = splitDate (date);
		newPath = dateArray [0] + '/' + dateArray [1] + '/';

		return newPath;
	}


	// Generates the filename of a post based on the the title and date of the post.
	// For example, a post named 'I Like Broccoli Until...' dated '2015/01/15' becomes
	// '2015-01-15-i-like-broccoli-until'.
	function getPostFilename (title, date) {
		var dateArray, day, filename, month, newTitle, titleArray, year;

		if (!title) {
			title = 'untitled';
		}

		titleArray = title.replace (/[\.,-\/#!\?$%\^&\*\';:{}=\-_`~()]/g, '').split (' ');
		newTitle = titleArray.join ('-');

		if (date) {
			dateArray = splitDate (date);
			filename = (dateArray.join ('-') + '-' + newTitle).toLowerCase ();
		} else {
			filename = newTitle.toLowerCase();
		}

		return filename;
	}


	// Return a list of all the markdown files from a given directory.
	function getFilelist (path) {
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


	function moveFile (src, dest, callback) {
		fs.move (src, dest, function (err) {
			if (err) {
				console.log (err);
			}

			console.log ('success!');
		});
	}


	function processFiles (path, callback) {
		fs.readdir (path, function (err, files) {
			if (err) {
				throw err;
			}

			files.forEach (function (file) {
				fs.stat (path + file, function (error, stats) {
					if (error) {
						throw error;
					}

					callback (path + file, stats);
				});
			});
		});
	}

	
	// Reads the contents of a file.
	function readFile (filename) {
		return fs.readFileSync (filename, 'utf8');
	}


	// Reads the contents of a list of files and add them to an array. If a function
	// is provided, process the file contents first.
	function readFiles (path) {
		var file;

		return _.map (getFilelist (path), function (filename) {
			file = {};
			file.content = readFile (path + filename);
			file.origFilename = filename;

			return file;
		});
	}


	// Deletes a file or directory (recursively) from disk.
	function remove (target) {
		fs.removeSync (target);
	}


	// Deletes a directory recursively from disk.
	function removeDirectory (path) {
		remove (path);
	}

			
	// Deletes a file from disk.
	function removeFile (file) {
		remove (file);
	}


	// Renames and/or moves a file.
	function renameFile (oldPath, newPath) {
		if ($config.verbose) {
			console.log ('Renaming/moving files...');
		}

		fs.rename (oldPath, newPath, function (err) {
			if (err) console.log (err);

			if ($config.verbose) {
				console.log (oldPath + ' => ' + newPath);
			}
		});
	}
	

	// Commits a page, expected to have HTML content, to disk. Otherwise, you just end up
	// with a file written with an '.html' extension. Maybe you're into that.
	function saveHtmlPage (page) {
		writeFile (page.outputPath + (page.path || '') + page.filename + '.html', page.output);
	}
	

	// Split a Date object into an array.
	function splitDate (date) {
		var day, month, year;
 
		date = new Date (date);
		year = date.getFullYear ();
		month = ('0' + (date.getMonth () + 1)).slice (-2);
		day = ('0' + date.getDate ()).slice (-2);

		return [year, month, day];
	}


	// Commits the contents of a file to disk.
	function writeFile (filename, content) {
		fs.outputFileSync (filename, content);
	}

	
	module.exports.copyFile = copyFile;
	module.exports.createDirectory = createDirectory;
	module.exports.createNewFile = createNewFile;
	module.exports.formatDateForMetadata = formatDateForMetadata;
	module.exports.getFiles = getFiles;
	module.exports.getPostDirectoryPathname = getPostDirectoryPathname;
	module.exports.getPostFilename = getPostFilename;
	module.exports.readFile = readFile;
	module.exports.readFiles = readFiles;
	module.exports.removeDirectory = removeDirectory;
	module.exports.removeFile = removeFile;
	module.exports.renameFile = renameFile;
	module.exports.writeFile = writeFile;
	module.exports.saveHtmlPage = saveHtmlPage;
} ());
