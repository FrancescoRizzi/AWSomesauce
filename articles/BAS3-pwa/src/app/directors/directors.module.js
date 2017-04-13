(function() {
	'use strict';

	angular.module('app.directors', [
			'app.services.swsclient'
		])
		.config(DirectorsConfig);

	// DirectorsConfig:
	// configuration block for directors
	//============================================================
	function DirectorsConfig($stateProvider, $urlRouterProvider) {
		console.log('DirectorsConfig');
		
		// NOTE: assumes a shell parent state

		// Add shell.directors state
		//=========================================================
		$stateProvider.state('shell.directors', {
			url: '/directors',
			templateUrl: 'app/directors/directors.html',
			controller: 'DirectorsController',
			controllerAs: 'vm',
			data: {
				pageTitle: 'Directors'
			},
			requireADLogin: true
		});
	}

})();