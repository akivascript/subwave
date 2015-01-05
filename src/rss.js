(function () {
	'use strict';

	var Rss = require ('rss');
	var _ = require ('underscore-contrib');

	var cf = require ('../resources/config');
	var io = require ('./io');
	var pa = require ('./pages');


	function updateRssFeed (repo) {
		var content, date, description, feed, feedOptions, file, i, itemOptions, post, posts, total;

		i = 0;
		total = 0;
		posts = _.snapshot (repo.posts).reverse ();


		feedOptions = {
			title: cf.blog.title,
			description: cf.blog.description,
			feed_url: cf.blog.url + '/' + cf.rss.filename,
			site_url: cf.blog.url,
			copyright: cf.blog.copyright,
			langauge: 'en',
			pubDate: new Date ()
		};

		feed = new Rss (feedOptions);

		while (total < cf.rss.postCount &&
					i < posts.length) {
			post = posts [i];
			date = io.getPostDirectoryPathname (post.date);
			file = io.readFile (cf.paths.repository + 'posts/' + date + post.filename + '.md');
			content = pa.getContent (file);

			if (cf.rss.useExcerpts) {
				description = _.compose (pa.prepareForDisplay, pa.getExcerpt) (content);
			} else {
				description = pa.prepareForDisplay (content);
			}

			itemOptions = {
				title: post.title,
				url: cf.blog.url + '/' + cf.paths.posts + date + post.filename + '.html',
				date: post.date,
				description: description,
				categories: post.tags,
				author: post.author
			};

			feed.item (itemOptions);

			i = i + 1;
			total = total + 1;
		}

		repo.posts.reverse ();

		io.writeFile (cf.paths.output + cf.rss.filename, feed.xml ());
	}


	module.exports.updateRssFeed = updateRssFeed;
} ());
