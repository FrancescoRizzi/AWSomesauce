(function() {

	angular
		.module('app.agents')
		.controller('AgentsController', AgentsController);

	// AgentsController:
	//============================================================
	function AgentsController($scope, $state, SWSClient) {
		var vm = this;
		vm.agents = "";

		vm.GetAgents = GetAgents;

		Init();
		//=========================================================

		//=========================================================
		function Init($state) {
			console.log("AgentsController::Init");
			return SWSClient.GetAgents()
				.then(function(data) {
					vm.agents = data;
					return vm.agents;
				});
		}

		//=========================================================
		function GetAgents() {
			console.log("AgentsController::GetAgents");
			return SWSClient.GetAgents()
				.then(function(data) {
					vm.agents = data;
					return vm.agents;
				});
		}

	}