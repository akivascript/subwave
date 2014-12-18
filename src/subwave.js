// The gateway to the subwave garden of blogonomic delights. Sooner or later it'll
// contain some argument switches which will allow a user to do things like force
// a complete site rebuild. It will also eventually do some initialization work such
// as loading a configuration options.
(function () {
	'use strict';

	var comp = require ('./compiler');

	comp.compile ();
} ());
