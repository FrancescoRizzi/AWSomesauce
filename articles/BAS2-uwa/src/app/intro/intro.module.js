(function() {
	'use strict';

	angular.module('app.intro', [
		])
		.config(IntroConfig);

	// IntroConfig:
	// configuration block for intro
	//============================================================
	function IntroConfig($stateProvider, $urlRouterProvider) {
		console.log('IntroConfig');
		
		// NOTE: assumes a shell parent state

		// Add shell.intro state
		//=========================================================
		$stateProvider.state('shell.intro', {
			url: '/intro',
			templateUrl: 'app/intro/intro.html',
			controller: 'IntroController',
			controllerAs: 'vm',
			data: {
				pageTitle: 'Intro'
			}
		});
	}

})();
