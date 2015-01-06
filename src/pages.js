(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');
	var moment = require ('moment');
	var _ = require ('underscore-contrib');

	var config = require ('../resources/config');
	var io = require ('./io');
	var pf = require ('./pagefactory.js');

	marked.setOptions ({
		smartypants: true
	});


	// Runs a page through Jade so that it is formatted for display.
	function compilePage (page, tags, callback) {
		var compiler, locals;

		compiler = jade.compileFile (page.template, { pretty: true });

		if (callback) {
			callback (page);
		} else {
			page.displayDate = formatDateForDisplay (page.date);
			page.headTitle = page.title;
			page.displayTitle = convertToHtml (page.title);
		
			if (page.content) {
				page.content = prepareForDisplay (page.content);
			}
		}

		// Use a locals object so multiple objects can be passed to Jade.
		locals = {
			page: page,
			tags: tags,
			config: config
		};

		return compiler (locals);
	}


	// Takes a string and processes it through marked to prepare it
	// for display.
	function convertToHtml (input) {
		return marked (input);
	}

	
	// Copies an object. If attributes are specified, only
	// those attributes are copied. Otherwise, the source object
	// is simply cloned (shallow).
	function copyObject (source, attributes) {
		var target;

		if (attributes && attributes.length > 0) {
			target = _.pick (source, attributes);
		} else {
			target = _.clone (source);
		}

		return target;
	}


	// Returns a page configuration object from the pagefactory.
	function createPage (page) {
		return pf.createPage (page);
	}


	// Filters a collection for pages of a given type.
	function filterPages (coll, type) {
		return _.filter (coll, function (item) {
			return item.type === type;
		});
	}

	
	// Takes a date object and converts it to the specified date format for display
	// on both the index and individual post pages.
	function formatDateForDisplay (date) {
		var postDate;

		postDate = moment (date);

		return postDate.format (config.blog.dateFormat);
	}


	// Parses a file and returns only its content (e.g., the body of a post).
	function getContent (file) {
		return parsePage (file).content;
	}


	// Parses a file and returns only its metadata.
	function getMetadata (file) {
		return parsePage (file).metadata;
	}


	function getPages (path) {
		var page, tmp;

		return _.map (loadPages (path), function (file) {
			tmp = parsePage (file.content);

			page = tmp.metadata;
			page.content = tmp.content;
			page.origFilename = file.origFilename;

			return createPage (page);
		});
	}


	// An indirector for clarity.
	function loadPages (path) {
		try {
			return io.readFiles (path);
		} catch (e) {
			return null;
		}
	}


	// Takes the contents of a file as a string and separates the metadata from the
	// content of the page. 
	function parsePage (file) {
		var matches, pattern;

		// Matches '{key: value, key: value, ...} content ...'
		pattern = /({[\s\w"'\?!,: \-\[\]\{\}\.\n]*})?\n*((.|[\n\r])*)/;

		matches = file.match (pattern);

		if (!matches || matches.length === 0) {
			throw new Error ('The file isn\'t the correct format: ' + file);
		}

		return {
			metadata: JSON.parse (matches [1]),
			content: matches [2] || ''
		};
	}
	

	// Prepares the content for display in a browser.
	function prepareForDisplay (pageBody) {
		return _.compose (convertToHtml, scrubPage) (pageBody);
	}


	// Removes any custom mark-up elements from a page's body.
	function scrubPage (pageBody) {
		var output, regexp;

		_.each (config.htmlElements.scrub, function (element) {
			regexp = new RegExp ('(<' + element + '>)|(<\/' + element + '>)', 'gi');

			output = pageBody.replace (regexp, '');
		});

		return output || pageBody;
	}


	// Compile and commit HTML file to disk.
	function savePage (page, tags) {
		page.output = compilePage (page, tags);

		io.saveHtmlPage (page);
	}


	module.exports.compilePage = compilePage;
	module.exports.convertToHtml = convertToHtml;
	module.exports.copyObject = copyObject;
	module.exports.createPage = createPage;
	module.exports.filterPages = filterPages;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.generateId = pf.generateId;
	module.exports.getExcerpt = pf.getExcerpt;
	module.exports.getContent = getContent;
	module.exports.getMetadata = getMetadata;
	module.exports.getPages = getPages;
	module.exports.prepareForDisplay = prepareForDisplay;
	module.exports.savePage = savePage;
} ());
