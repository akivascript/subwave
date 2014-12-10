(function () {
	'use strict';

	var arch = require ('./archives');
	var comp = require ('./compiler');
	var io = require ('./io');
	var md = require ('markdown').markdown;

	var templatesPath = 'resources/templates/';

	function comparePosts (postA, postB) {
		if (!postA || !postB) {
			return false;
		}

		if (postA.title === postB.title &&
				postA.author === postB.author &&
				postA.date === postB.date) {
			return true;
		}

		return false;
	}

	function processArchives (posts, archives) {
		var idx;

		posts.forEach (arch.addPost);

		idx = archives.posts.length - posts.length;

		// TODO: Refactor all this
		posts.forEach (function (post) {
			var next, nextPost, previous, prevPost;
		
			next = archives.posts [idx + 1];
			previous = archives.posts [idx - 1];

			if (previous) {
				post.previous = {};

				post.previous.title	= previous.title;
				post.previous.date = previous.date;
				post.previous.filename = previous.filename;

				// Although this is the previous post relative to the current one,
				// the current one is next relative to the previous one.
				prevPost = processPostNav ("next", post, previous.filename);

				if (archives.posts [idx - 2]) {
					var prevPrevPost = archives.posts [idx - 2];

					prevPost.previous = {};

					prevPost.previous.title = prevPrevPost.title;
					prevPost.previous.date = prevPrevPost.date;
					prevPost.previous.filename	= prevPrevPost.filename;
				}

				comp.compilePost (prevPost);

				io.createPostDirectory (io.postsPath + prevPost.path);
				io.savePage (prevPost);
			}

			if (next) {
				post.next = {};

				post.next.title	= next.title;
				post.next.date = next.date;
				post.next.filename = next.filename;

				console.log (post);
				// See previous comment about the 'oppositeness'.
				nextPost = processPostNav ("previous", post, next.filename);

				if (archives.posts [idx - 2]) {
					var nextNextPost = archives.posts [idx - 2];

					nextPost.previous = {};

					nextPost.previous.title = nextNextPost.title;
					nextPost.previous.date = nextNextPost.date;
					nextPost.previous.filename	= nextNextPost.filename;
				}

				comp.compilePost (nextPost);

				io.createPostDirectory (io.postsPath + nextPost.path);
				io.savePage (nextPost);
			}

			idx = idx + 1;
		});

		return archives;
	}

	function processDirectory (path) {
		var filelist, file, pages = [];

		filelist = io.getFileList (path);

		filelist.forEach (function (entry) {
			file = io.readFile (path + entry);

			pages.push (processPage (file));
		});

		return pages;
	}

	function processPage (page) {
		var content, compiler, pagedata, matches,
			filename, output, path, pattern, srcfile, template;
		
		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
		matches = page.match (pattern);

		if (!matches || matches.length === 0) {
			throw {
				type: 'Error',
				message: 'The file isn\'t the correct format.'
			}
		}

		pagedata = JSON.parse (matches [1]);
		content = md.toHTML (matches [2]);
		page = {};

		for (var attr in pagedata) {
			page [attr] = pagedata [attr];
		}

		page.content = content;

		if (page.type === "post") {
			page.template = templatesPath + 'post.jade';

			page = processPost (page);
		} else if (page.type === "page") {
			page.template = templatesPath + 'page.jade';
		} else if (page.type === "archives") {
			page.template = templatesPath + 'archives.jade';
			page.filename = 'archives.html';
			page.path = io.publicPath;
		} else {
			throw {
				type: 'Error',
				message: 'Unable to determine template type from page.'
			}
		}

		return page;
	}

	function processPost (post) {
		post.filename	= io.createPostFilename (post.title, post.date);
		post.path = io.createPostDirectoryPathname (post.date);

		return post;
	}

	function processPostNav (type, currentPost, file) {
		var post;

		post = io.readFile (io.archivePath + file);
		post = processPage (post);

		post [type] = {};
		post [type].title = currentPost.title;
		post [type].date = currentPost.date;
		post [type].filename = currentPost.filename;

		return post;
	}

	module.exports.processArchives = processArchives;
	module.exports.processDirectory = processDirectory;
	module.exports.processPage = processPage;
} ());
