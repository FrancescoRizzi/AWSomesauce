(function() {
	'use strict';

	angular.module('app.agents', [
			'app.services.swsclient'
		])
		.config(AgentsConfig);

	// AgentsConfig:
	//============================================================
	function AgentsConfig($stateProvider, $urlRouterProvider) {
		console.log('AgentsConfig');
		
		// NOTE: assumes a shell parent state

		// Add shell.agents state
		//=========================================================
		$stateProvider.state('shell.agents', {
			url: '/agents',
			templateUrl: 'app/agents/agents.html',
			controller: 'AgentsController',
			controllerAs: 'vm',
			data: {
				pageTitle: 'Agents'
			}
		});
	}

})();
