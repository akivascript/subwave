// Collects all specific functions related to tagging.
(function () {
	'use strict';

	function addTags (tags, taglist) {
		tags.forEach (function (tag) {
			if (!taglist.some (function (t) {
				return t === tag;
			})) {
				taglist.push ({
					tag: tag,
					posts: []
				});
			}
		});
	}

	module.exports.addTags = addTags;
} ());
