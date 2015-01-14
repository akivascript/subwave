(function () {
	'use strict';

	var jade = require ('jade');
	var marked = require ('marked');
	var moment = require ('moment');
	var Retext = require ('retext');
	var smartypants = require ('retext-smartypants');
	var _ = require ('underscore-contrib');

	var $config = require ('../config');
	var $io = require ('./io');
	var $factory = require ('./factory.js');

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

			if (page.title) {
				page.headTitle = page.title;
				page.displayTitle = convertToHtml (page.title);
			}
		
			if (page.content) {
				page.content = prepareForDisplay (page.content);
			}

			if (page.excerpt) {
				page.excerpt = prepareForDisplay (page.excerpt);
			}
		}

		// Use a locals object so multiple objects can be passed to Jade.
		locals = {
			page: page,
			tags: tags,
			config: $config
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
		return $factory.createPage (page);
	}


	// Filters a collection for pages of a given type.
	function filterPages (coll, type) {
		return _.filter (coll, function (item) {
			return item.type === type;
		});
	}


	function findById (posts, id) {
		var result;

		result = {};
		result.post = _.findWhere (posts, { id: id });

		if (result.post) {
			result.index = _.indexOf (posts, result.post);

			return result;
		}

		return {};
	}

	
	// This will eventually be refactored out; it's a holdover. And I'm too lazy
	// to do it right now.
	function formatDateForDisplay (date) {
		return formatDate (date, $config.blog.dateFormat);
	}


	// Takes a date object and converts it to the specified date format 
	function formatDate (date, format) {
		var output;

		format = format || $config.blog.dateFormat;
		output = moment (date);

		return output.format (format);
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
			return _.compose (createPage, processFile) (file);
		});
	}


	// An indirector for clarity.
	function loadPages (path) {
		try {
			return $io.readFiles (path);
		} catch (e) {
			return null;
		}
	}


	// Takes the contents of a file as a string and separates the metadata from the
	// content of the page. 
	function parsePage (file) {
		var matches, pattern;

		// Matches '{key: value, key: value, ...} content ...'
		pattern = /({[\s\w@/"'\?!,: \-\[\]\{\}\.\n]*})?\n*((.|[\n\r])*)/;

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


	function processFile (file) {
		var page, tmp;

		tmp = parsePage (file.content || file);

		page = tmp.metadata;
		page.content = tmp.content;
		page.origFilename = file.origFilename;

		return page;
	}


	// Removes any custom mark-up elements from a page's body.
	function scrubPage (pageBody) {
		var output, regexp;

		_.each ($config.htmlElements.scrub, function (element) {
			regexp = new RegExp ('(<' + element + '>)|(<\/' + element + '>)', 'gi');

			output = pageBody.replace (regexp, '');
		});

		return output || pageBody;
	}


	// Compile and commit HTML file to disk.
	function savePage (page, tags) {
		page.output = compilePage (page, tags);

		$io.saveHtmlPage (page);
	}


	// Converts text to 'smart' typography.
	function smartenText (text) {
		var output, retext;

		retext = new Retext ().use (smartypants);
		retext.parse (text, function (error, tree) {
			if (error) {
				throw error;
			}

			text = tree.toString ();
		});

		return text;
	}


	module.exports.compilePage = compilePage;
	module.exports.convertToHtml = convertToHtml;
	module.exports.copyObject = copyObject;
	module.exports.createPage = createPage;
	module.exports.findById = findById;
	module.exports.filterPages = filterPages;
	module.exports.formatDate = formatDate;
	module.exports.formatDateForDisplay = formatDateForDisplay;
	module.exports.generateId = $factory.generateId;
	module.exports.getExcerpt = $factory.getExcerpt;
	module.exports.getContent = getContent;
	module.exports.getMetadata = getMetadata;
	module.exports.getPages = getPages;
	module.exports.prepareForDisplay = prepareForDisplay;
	module.exports.processFile = processFile;
	module.exports.savePage = savePage;
	module.exports.smartenText = smartenText;
} ());
