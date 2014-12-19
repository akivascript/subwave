// The gateway between subwave and the disk. All functions related to io are
// gathered here to solemnly lay down tracts of 1s and 0s for great bloggery.
(function () {
	'use strict';

	var fs = require ('fs');
	var md = require ('mkdirp');

	var resourcesPath = 'resources/';
	var inboxPath	= resourcesPath + 'inbox/';
	var archivePath = resourcesPath + 'archive/';
	var publicPath = 'public/';
	var postsPath = publicPath + 'posts/';
	var tagsPath = publicPath + 'tags/';
	var templatesPath = resourcesPath + 'templates/';

	function copyFile (oldPath, newPath) {
		fs.createReadStream (oldPath).pipe (fs.createWriteStream (newPath));
	}

	// In subwave, posts are grouped by year and then by month; this function
	// creates this year/month path based on the filename of the post itself.
	function createPostDirectory (path) {
		// mkdirp allows us to create directory structures in one go.
		// e.g. '2014/12/'
		md.mkdirp.sync (path);
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
		var dateArray, day, month, newTitle, titleArray, year;

		titleArray = title.split (' ');
		newTitle = titleArray.join ('-');
		dateArray = splitDate (date);

		return (dateArray.join ('-') + '-' + newTitle).toLowerCase ();
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
	
	module.exports.copyFile = copyFile;
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
