(function() {
	'use strict';

	angular.module('app', [
			'ui.router',

			'app.services.swsclient',

			'app.shell',
			'app.error',
			'app.intro',
			'app.directors',
			'app.agents'
			//'app.other'
		]);
		//NOTE: See app.config.js for module .config/.run
})();