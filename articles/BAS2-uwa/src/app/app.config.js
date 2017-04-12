(function() {
	'use strict';

	var _app_config_ = {
		appId: 'ShieldWebApp',
		appVersion: '0.0.1'
	};

	angular.module('app')
		.value('config', _app_config_)	//NOTE: (1)
		.config(AppConfig)
		.run(AppRun);

	// NOTE (1): We use .value (over .constant) so that AppConfig could intercept
	// the value via $provide if necessary.

	// AppConfig:
	//	configuration method for the app module
	//============================================================
	function AppConfig($locationProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
		console.log('AppConfig');

		// Configure the urlRouteProvider to redirect to /intro by default
		$urlRouterProvider.otherwise("/intro");
	}

	// AppRun:
	// run block for the app module
	//============================================================
	function AppRun($rootScope, $log, $state) {
		console.log('AppRun');

		// intercept '$stateChangeError':
		//	if there's an error, with error.reason == 'PROTECTED_STATE'
		//		redirect to intro state
		// else
		//		redirect to error state
		//=========================================================
		$rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, error) {

			console.error("State Change Error.");
			if (error) {
				if (error.reason) {
					console.error("Error Reason: "+error.reason);
				} else {
					console.error("Error Details: "+error);
				}
			} else {
				console.error("No error details available.");
			}

			if (error && error.reason) {
				if ("PROTECTED_STATE" == error.reason) {
					console.log("Redirecting to shell.intro state.");

					evt.preventDefault();
					$state.go('shell.intro');
				}
				else {
					console.log("Redirecting to shell.error state.");

					evt.preventDefault();
					$state.get('shell.error').error = error;
					$state.go('shell.error');
				}
			}
		});

		// intercept '$stateChangeSuccess': modify Page Title
		//=========================================================
		//TODO: Would be lovely to refer to a separate, named method for this handler.
		//However, we'll need to figure out how to make that handler access $rootScope
		$rootScope.$on("$stateChangeSuccess", function(evt, toState, toParams, fromState, fromParams) {
			console.log('State Change Success.');

			console.log("From State : "+fromState.toString());
			console.log("From Params: "+fromParams.toString());
			console.log("To State   : "+toState.toString());
			console.log("To Params  : "+toParams.toString());

			var pt = _app_config_.appId + ': ';
			if (toState && toState.data && toState.data.pageTitle) {
				pt += toState.data.pageTitle;
			}
			console.log("Setting Page Title to: "+pt);
			$rootScope.pageTitle = pt;
		});

		console.log('AppRun: list of configured states:');
		console.log($state.get());
	}

})();

