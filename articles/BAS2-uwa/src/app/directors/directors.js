(function() {

	angular
		.module('app.intro')
		.controller('DirectorsController', DirectorsController);

	// DirectorsController:
	//============================================================
	function DirectorsController($scope, $state, SWSClient) {
		var vm = this;
		vm.directors = "";

		vm.GetDirectors = GetDirectors;

		Init();
		//=========================================================

		//=========================================================
		function Init($state) {
			console.log("DirectorsController::Init");
			return SWSClient.GetDirectors()
				.then(function(data) {
					vm.directors = data;
					return vm.directors;
				});
		}

		//=========================================================
		function GetDirectors() {
			console.log("DirectorsController::GetDirectors");
			return SWSClient.GetDirectors()
				.then(function(data) {
					vm.directors = data;
					return vm.directors;
				});
		}


	}
})();