(function () {
	'use strict';

	var _ = require ('underscore-contrib');

	var $pages = require ('./pages');
	var $config = require ('../config');
	var $io = require ('./io');


	function addItem (coll, item) {
		var _item;

		_item = $pages.findById (coll, item.id);
			
		if (_.isEmpty (_item)) {
			coll.push (item);
		} else {
			coll [_item.index] = item;
		}
		
		return coll;
	}

	
	function addPostNav (pages) {
		return _.map (pages, function (page, idx) {
			if (idx === 0 && pages.length > 1) {
				page.previous = 'index2';

				return page;
			}

			page.next = 'index';

			if (idx > 1) {
				page.next = page.next + idx;
			}

			if (idx < pages.length - 1) {
				page.previous = 'index' + (idx + 2);
			}

			return page;
		});
	}


	function compileItems (page, tags) {
		var compileFn;

		compileFn = function (page) {
			page.title = $config [page.type + 's'].title;

			return _.map (page.items, function (item) {
				return processItem (item);
			});
		};

		return $pages.compilePage (page, tags, compileFn);
	}


	// Takes a string in the format of 'YYYY-MM-DD HH:MM' and returns a
	// Date object.
	function convertStringToDate (date) {
		var pattern;

		pattern = /(\d{4}-\d{2}-\d{2})\s(\d+:\d+)/;

		return new Date (date.replace (pattern, '$1T$2:00'));
	}


	function createPage (type) {
		return {
			type: type,
			links: []
		};
	}


	// If pagination is enabled, a number of 'home pages' are created split by 
	// the number of items per page set in the config.
	function createPages (items, type, fn) {
		return (function loop (items, pages, idx) {
			var page, i, post, skip, tail;

			i = 1;
			skip = 0;

			if (items.length < 1) {
				// Add postnav for last page

				return pages;
			}

			page = _.compose ($pages.createPage, createPage) (type);

			if (fn) {
				fn ();
			} else {
				page.items = _.head (items, $config [type + 's'].itemsPerPage);

				skip = $config [type + 's'].itemsPerPage;
			}

			page.items.reverse ();
			page.filename = 'index';

			if (idx > 1) {
				page.filename = page.filename + idx;
			}

			pages.push (page);

			// If we're not paginating, we're already done
			if (!$config.index.usePagination) {
				return pages;
			}

			return loop (_.tail (items, skip), 
									 pages, 
									 idx + 1);
		}) (items, [], 1);
	}


	function loadItems (type, path) {
		return $pages.getPages ($config.paths.repository + 
														$config [type].title.toLowerCase () + '/');
	}


	function processItem (item) {
		if (item.title) {
			item.displayTitle = $pages.smartenText (item.title);
		}

		item.displayUrlTitle = $pages.smartenText (item.urlTitle);
		item.displayDate = $pages.formatDateForDisplay (item.date);
		item.content = $pages.convertToHtml (item.content);

		return item;
	}

	
	function publishLinks (items, repo) {
		var pages, type;

		type = 'link';

		pages = _.compose (addPostNav, createPages) (items, type);

		_.each (pages, function (page) {
			savePage (page, repo.tags);
		});
	}


	function savePage (page, tags) {
		var date, filename, output, repoItemsPath;

		repoItemsPath = $config.paths.repository + 
			$config [page.type + 's'].title.toLowerCase () + '/';
		
		// Move new miniposts to the repository
		_.each (page.items, function (item) {
			date = convertStringToDate (item.date);
			
			if (item.title) {
				filename = $io.getPostFilename (item.title, item.date);
			} else {
				filename = $io.getPostFilename (item.urlTitle, item.date);
			}

			output = JSON.stringify (_.pick (item, 'type', 'id', 'title', 'author', 'date', 'url', 'urlTitle'),
															null, '  ');
			output = output + '\n\n' + item.content;

			$io.writeFile (repoItemsPath + filename + '.md', output);

			$io.removeFile ($config.paths.inbox + item.origFilename);
		});

		page.output = compileItems (page, tags);
		
		page.filename = '1'; // Temporary until pagination

		$io.saveHtmlPage (page);
	}


	module.exports.loadItems = loadItems;
	module.exports.processItem = processItem;
	module.exports.publishLinks = publishLinks;
} ());
