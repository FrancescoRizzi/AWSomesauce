(function() {
	'use strict';

	angular.module('app.error', [
		])
		.config(ErrorConfig);

	// ErrorConfig:
	// configuration block for error
	//============================================================
	function ErrorConfig($stateProvider, $urlRouterProvider) {
		console.log('ErrorConfig');

		// NOTE: assumes a shell parent state

		// Add shell.error state
		//=========================================================
		$stateProvider.state('shell.error', {
			url: '/error',
			templateUrl: 'app/error/error.html',
			controller: 'ErrorController',
			controllerAs: 'vm',
			resolve: {
				errorInfo: ErrorInfo
			},
			data: {
				pageTitle: 'Error'
			}
		});
	}

	function ErrorInfo() {
		return this.self.error;
	}

})();
