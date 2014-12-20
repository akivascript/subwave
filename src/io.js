// The gateway between subwave and the disk. All functions related to io are
// gathered here to solemnly lay down tracts of 1s and 0s for great bloggery.
(function () {
	'use strict';

	var fs = require ('fs');
	var md = require ('mkdirp');
	var moment = require ('moment');
	var ncp = require ('ncp');
	var rm = require ('rimraf');

	var resourcesPath = 'resources/';
	var inboxPath	= resourcesPath + 'inbox/';
	var archivePath = resourcesPath + 'archive/';
	var publicPath = 'public/';
	var postsPath = publicPath + 'posts/';
	var tagsPath = publicPath + 'tags/';
	var templatesPath = resourcesPath + 'templates/';

	// Resets the /resources/archive to its default state... empty.
	function cleanArchive (verbose) {
		var deletes, prunes;

		deletes = [];
		prunes = [];

		deletes.push (archivePath);
		prunes.push (archivePath + 'posts/');

		clean (deletes, prunes, verbose);
	}

	// Deletes and prunes files and directories.
	function clean (deletes, prunes, verbose) {
		if (deletes.length > 0) {
			deletes.forEach (function (path) {
				processFiles (path, function (target, stats) {
					if (stats.isFile ()) {
						removeFile (target, verbose);
					}
				});
			});
		}

		if (prunes.length > 0) {
			prunes.forEach (function (path) {
				processFiles (path, function (target, stats) {
					if (stats.isDirectory ()) {
						removeDirectories (target, verbose);
					}
				});
			});
		}
	}

	// Resets the /public directory to its default state... empty.
	function cleanPublic (verbose) {
		var deletes, prunes;

		deletes = [];
		prunes = [];

		deletes.push (publicPath);
		deletes.push (publicPath + 'css/');
		deletes.push (publicPath + 'img/');
		deletes.push (publicPath + 'js/');
		deletes.push (tagsPath);
		prunes.push (postsPath);

		clean (deletes, prunes, verbose);

		removeFile (resourcesPath + 'state.json', verbose);
	}

	// Copies a file.
	function copyFile (oldPath, newPath) {
		fs.createReadStream (oldPath).pipe (fs.createWriteStream (newPath));
	}

	// Copies a directory structure recursively
	function copyFilesRecursively (srcPath, destPath) {
		ncp.limit = 16;

		ncp (srcPath, destPath, function (err) {
			if (err) {
				return console.log (err);
			}
		});
	}

	function createNewFile (metadata) {
		var filename, content;
		
		if (!metadata.title) {
			if (metadata.type === 'post') {
				metadata.title = 'New Post';
			} else {
				metadata.title = 'New Page';
			}
		}

		if (!metadata.author) {
			metadata.author = 'John Doe';
		}

		metadata.date = formatDateForMetadata (new Date ());
		content = JSON.stringify (metadata, null, '\t') + '\n\nWhat\'s up?';

		if (metadata.type === 'post') {
			filename = getPostFilename (metadata.title, new Date (metadata.date)) + '.md';
		} else {
			filename = getPostFilename (metadata.title) + '.md';
		}

		writeFile (inboxPath + filename, content);

		console.log ('Successfully created new ' + metadata.type + ' in inbox: ' + filename);
	}

	// In subwave, posts are grouped by year and then by month; this function
	// creates this year/month path based on the filename of the post itself.
	function createPostDirectory (path) {
		// mkdirp allows us to create directory structures in one go.
		// e.g. '2014/12/'
		md.mkdirp.sync (path);
	}

	// Converts a Date object into the string expected in a new post file.
	function formatDateForMetadata (date) {
		return moment (date).format ('YYYY-MM-DD HH:mm');
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

		titleArray = title.replace(/[\.,-\/#!\?$%\^&\*\';:{}=\-_`~()]/g, '').split (' ');
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
	function readFiles (path, fn) {
		var file, filelist, files;

		files = [];
		filelist = getFileList (path);

		filelist.forEach (function (filename) {
			file = readFile (path + filename);

			if (fn) {
				file = fn (file);
				
				file.origFilename = filename;
			}

			files.push (file);
		});

		return files;
	}

	// Deletes a directory recursively from disk.
	function removeDirectories (path, verbose) {
		rm (path, function (error) {
			if (error) {
				throw error;
			}

			if (verbose) {
				console.log ('Deleted ' + path + '...');
			}
		});
	}
			
	// Deletes a file from disk.
	function removeFile (file, verbose) {
		fs.unlink (file, function (error) {
			if (error) {
				console.log ('Could not find ' + file + '...');

				return; 
			}

			if (verbose) {
				console.log ('Deleted ' + file + '...');
			}
		});
	}

	// Renames and/or moves a file.
	function renameFile (oldPath, newPath) {
		fs.renameSync (oldPath, newPath);
	}

	// Commits a page, expected to have HTML content, to disk. Otherwise, you just end up
	// with a file written with an '.html' extension. Maybe you're into that.
	function saveHtmlPage (page) {
		var path;

		if (page.type === 'post') {
			path = postsPath;
		} else if (page.type === 'tagpage') {
			path = tagsPath;
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

	// Split a Date object into an array.
	function splitDate (date) {
		var day, month, year;
 
		year = date.getFullYear ();
		month = ('0' + (date.getMonth () + 1)).slice (-2);
		day = ('0' + date.getDate ()).slice (-2);

		return [year, month, day];
	}

	// Commits the contents of a file to disk.
	function writeFile (filename, content) {
		fs.writeFileSync (filename, content);
	}
	
	module.exports.cleanArchive = cleanArchive; 
	module.exports.cleanPublic = cleanPublic; 
	module.exports.copyFile = copyFile;
	module.exports.copyFilesRecursively = copyFilesRecursively;
	module.exports.createNewFile = createNewFile;
	module.exports.createPostDirectory = createPostDirectory;
	module.exports.getPostDirectoryPathname = getPostDirectoryPathname;
	module.exports.getPostFilename = getPostFilename;
	module.exports.readFile = readFile;
	module.exports.readFiles = readFiles;
	module.exports.renameFile = renameFile;
	module.exports.writeFile = writeFile;
	module.exports.saveHtmlPage = saveHtmlPage;

	module.exports.inboxPath = inboxPath;
	module.exports.archivePath = archivePath;
	module.exports.postsPath = postsPath;
	module.exports.publicPath = publicPath;
	module.exports.resourcesPath = resourcesPath;
	module.exports.tagsPath = tagsPath;
	module.exports.templatesPath = templatesPath;
} ());
