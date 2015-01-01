(function () {
	'use strict';

	var connect = require ('connect');
	var serve = require ('serve-static');

	connect ().use (serve (__dirname + '/public/')).listen (8000);
} ());
