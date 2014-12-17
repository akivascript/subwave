(function () {
	'use strict';

	function addTags (tags, taglist) {
		tags.forEach (function (tag) {
			if (!taglist.some (function (t) {
				return t === tag;
			})) {
				taglist.push (tag);
			}
		});
	}

	module.exports.addTags = addTags;
} ());
