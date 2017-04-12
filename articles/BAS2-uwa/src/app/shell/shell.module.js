(function() {
	'use strict';

	angular.module('app.shell', [
		])
		.config(ShellConfig);

	// ShellConfig:
	// Configuration block for shell
	//============================================================
	function ShellConfig($stateProvider, $urlRouterProvider) {
		console.log('ShellConfig');
		
		// NOTE: shell is configured as an abstract state,
		// with a blank url, so that it can act as parent for all other
		// states that would be displayed within the shell.

		//******************** IMPORTANT ********************
		// Make sure you configure somewhere the urlRouterProvider to
		// use one of the concrete children states of shell. eg:
		// $urlRouterProvider.otherwise("/default-concrete-state");
		//***************************************************
		$stateProvider.state('shell', {
			//blank url as the shell is an abstract parent to every other state
			url: '',
			templateUrl: 'app/shell/shell.html',
			controller: 'ShellController',
			controllerAs: 'vm',
			abstract: true,
			data: {
				pageTitle: 'Shell'
			}
		});

	}
})();