(function () {
	'use strict';

	var arch	= require ('./archives');
	var comp	= require ('./compiler');
	var io		= require ('./io');
	var md 		= require ('markdown').markdown;

	var templatesPath = 'resources/templates/';

	function comparePosts (postA, postB) {
		if (postA.title === postB.title &&
				postA.author === postB.author &&
				postA.date === postB.date) {
			return true;
		}

		return false;
	}

	function processArchives (posts, archives) {
		var idx;

		if (!posts) {
			throw new Error ('process needs posts.');
		}

		posts.forEach (arch.addPost);

		idx = archives.posts.length - posts.length;

		// TODO: Refactor all this
		posts.forEach (function (post) {
			var next, nextPost, previous, prevPost;
		
			next 			= archives.posts [idx + 1];
			previous 	= archives.posts [idx - 1];

			if (previous) {
				post.previous = {};

				post.previous.title	= previous.title;
				post.previous.date 	= previous.date;
				post.previous.uri 	= previous.uri;

				// Although this is the previous post relative to the current one,
				// the current one is next relative to the previous one.
				prevPost = processPostNav ("next", post, previous.location);

				if (archives.posts [idx - 2]) {
					var prevPrevPost = archives.posts [idx - 2];

					prevPost.previous = {};

					prevPost.previous.title = prevPrevPost.title;
					prevPost.previous.date 	= prevPrevPost.date;
					prevPost.previous.uri		= prevPrevPost.uri;
				}

				comp.compilePost (prevPost);

				io.createPostDirectory (io.postsPath + prevPost.path);
				io.savePage (prevPost);
			}

			if (next) {
				post.next = {};

				post.next.title			= next.title;
				post.next.date 			= next.date;
				post.next.uri 			= next.uri;

				// See previous comment about the 'oppositeness'.
				nextPost = processPostNav ("previous", post, next.location);

				if (archives.posts [idx - 2]) {
					var nextNextPost = archives.posts [idx - 2];

					nextPost.previous = {};

					nextPost.previous.title = nextNextPost.title;
					nextPost.previous.date 	= nextNextPost.date;
					nextPost.previous.uri		= nextNextPost.uri;
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

		if (!path) {
			throw new Error ('processDirectory requires a path.');
		}

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
		
		if (!page) {
			throw new Error ("processPage requires a page.");
		}

		pattern = /(\{(?:.|\n)+\})(?:\n)*((.|\n)*)/;
		matches = page.match (pattern);

		if (!matches || matches.length === 0) {
			throw new Error ("The file isn't the correct format.");
		}

		pagedata 	= JSON.parse (matches [1]);
		content 	= md.toHTML (matches [2]);
		page 			= {};

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
			throw new Error ('Unable to determine template type from page.');
		}

		return page;
	}

	function processPost (post) {
		var archivePath;
		
		post.filename	= io.createPostFilename (post.title, post.date);
		post.path 		= io.createPostDirectoryPathname (post.date, io.postsPath);
		archivePath 	= io.createPostDirectoryPathname (post.date, io.archivePath + io.postsPath);
		post.location = archivePath + '/' + post.filename + '.md';

		return post;
	}

	function processPostNav (type, currentPost, file) {
		var post;

		post = io.readFile (io.archivePath + file);
		post = processPage (post);

		post [type] = {};
		post [type].title = currentPost.title;
		post [type].date = currentPost.date;
		post [type].uri = currentPost.path + '/' + currentPost.filename + '.html';

		return post;
	}

	module.exports.processArchives = processArchives;
	module.exports.processDirectory = processDirectory;
	module.exports.processPage = processPage;
} ());
