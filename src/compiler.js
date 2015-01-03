// This is the 'heart' of subwave. It processes all incoming posts and pages from 
// the inbox and generates necessary support pages such as archive.html.
(function () {
	'use strict';

	var Rss = require ('rss');
	var _ = require ('underscore-contrib');

	var ar = require ('./archive');
	var config = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');
	var po = require ('./posts');
	var repo = require ('./repository');
	var ta = require ('./tags');


	// Ceci n'est pas un commentaire.
	function buildSite () {
		var homePage, entries, files, pages, path, posts, repository, resources;

		if (config.verbose) {
			console.log ('Compiling the site...');
		}

		pages = pa.getNewPages ();

		if (pages.length === 0) {
			console.log ('No new pages found');

			return 1;
		}

		repository = _.compose (repo.getRepository, repo.loadRepository) ();
		posts = po.getPosts (pages);

		if (posts.length !== 0) {
			entries = _.map (posts, function (post) {
				return ar.createArchiveEntry (post);
			});

			handlePosts (repository, posts, entries);
		}

		// Processes and saves any page files in inbox.
		_.each (pages, function (page) {
			if (page.type !== 'post') {
				pa.savePage (page, repository.tags);

				io.renameFile (config.paths.inbox + page.origFilename, 
											 config.paths.repository + page.origFilename);
			}
		});

		// Creates the index.html page.
		homePage = pa.createHomePage (repository.posts.slice (-config.index.postCount), posts);

		pa.savePage (homePage, repository.tags);

		_.each (config.resources, function (resource) {
			files = io.getFiles (config.paths.resources + resource);

			// Okay, what is this and why
			for (var file in files) {
				path = files [file];

				io.copyFile (path + file, config.paths.output + resource + file);
			}
		});
	}


	function handleArchive (posts, tags) {
		var archive;

		archive = _.compose (pa.createPage, JSON.stringify, ar.createArchive) (posts);

		ar.saveArchive (archive, tags);
	}


	// Take [currently only] new posts, add them to the site's repository, process them,
	// fold them, spindle them, mutilate them...
	function handlePosts (repository, posts, entries, archive) {
		var repoPostsPath, file, index, postCount, output, result;

		// Each post gets a unique index number which is later used 
		// for updates.
		if (repository.posts && repository.posts.length > 0) {
			postCount = repo.getLastIndex (repository.posts);

			index = postCount + 1;
		} else {
			index = 1;
		}

		_.each (entries, function (entry, i) {
			if (!entry.index) {
				entry.index = index;

				posts [i].index = index;
			}

			if (entry.index < postCount) {
				repository.posts [entry.index - 1] = entry;
			} else {
				repository.posts.push (entry);
			}
				
			index = index + 1;
		});
		
		// Some last prepatory work on new posts including moving the now loaded
		// files into the repository.
		_.each (posts, function (post) {
			if (config.index.useExcerpts) {
				post.excerpt = pa.getExcerpt (post.content);
			}

			_.each (post.tags, function (name) {
				result = repo.findTag (repository.tags, name);

				if (_.isEmpty (result)) {
					result.tag = ta.createTag (name);
				} 

				result.tag = ta.addPostToTag (result.tag, post.filename);

				if (result.index || result.index !== -1) {
					repository.tags = repository.tags.concat (result.tag);
				} else {
					repository.tags [result.index] = result.tag;
				}
			});

			repoPostsPath = config.paths.repository + 'posts/';

			io.createPostDirectory (repoPostsPath + post.path);

			output = JSON.stringify ({
				type: 'post',
				index: post.index,
				title: post.title,
				author: post.author,
				date: post.date,
				tags: post.tags}, null, '  ');

			file = io.readFile (config.paths.inbox + post.origFilename);
			output = output + '\n\n' + pa.getContent (file);

			io.writeFile (repoPostsPath + post.path + post.filename + '.md', output);
			
			io.removeFile (config.paths.inbox + post.origFilename);
		});
	
		// We handle appending the archive first (above) so we can more easily determine
		// if a post has siblings that need to be handled.
		po.handlePostsWithSiblings (repository, posts);

		_.each (posts, function (post) {
			po.savePost (post, repository.tags);
		});

		// Create archive.html.
		handleArchive (repository.posts, repository.tags);

		// Create tag index files in tags directory.
		ta.createTagPages (repository);

		updateRssFeed (repository);

		repo.saveRepository (repository);
	}


	// Clears out the public directory, copies everything from resource/archive
	// then builds the site again. Useful for when changing templates that affect the
	// entire site.
	function rebuildSite () {
		var files, path;

		files = [];

		if (config.verbose) {
			console.log ('Rebuilding the site...');
		}

		io.cleanPublic (false);

		files = io.getFiles (config.paths.repository);

		for (var file in files) {
			path = files [file];

			io.copyFile (path + file, config.paths.inbox + file);
		}

		buildSite ();
	}


	function updateRssFeed (repository) {
		var content, date, description, feed, feedName, feedOptions, file, i, itemOptions, post, total;

		i = 0;
		total = 0;
		feedName = 'rss.xml';

		feedOptions = {
			title: config.blog.title,
			description: config.blog.description,
			feed_url: config.blog.url + '/' + feedName,
			site_url: config.blog.url,
			copyright: config.blog.copyright,
			langauge: 'en',
			pubDate: new Date ()
		};

		feed = new Rss (feedOptions);

		repository.posts.reverse ();

		while (total < config.rss.postCount &&
					i < repository.posts.length) {
			post = repository.posts [i];
			date = io.getPostDirectoryPathname (post.date);
			file = io.readFile (config.paths.repository + 'posts/' + date + post.filename + '.md');
			content = pa.getContent (file);

			if (config.rss.useExcerpts) {
				description = _.compose (pa.prepareForDisplay, pa.getExcerpt) (content);
			} else {
				description = pa.prepareForDisplay (content);
			}

			itemOptions = {
				title: post.title,
				url: config.blog.url + '/' + config.paths.posts + date + post.filename + '.html',
				date: post.date,
				description: description,
				categories: post.tags,
				author: post.author
			};

			feed.item (itemOptions);

			i = i + 1;
			total = total + 1;
		}

		repository.posts.reverse ();

		io.writeFile (config.paths.output + feedName, feed.xml ());
	}


	module.exports.buildSite = buildSite;
	module.exports.rebuildSite = rebuildSite;
} ());
