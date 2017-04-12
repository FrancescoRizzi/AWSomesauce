(function() {

	angular
		.module('app.intro')
		.controller('IntroController', IntroController);

	// IntroController:
	//============================================================
	function IntroController($scope, $state) {
		var vm = this;

		Init();
		//=========================================================

		function Init($state) {
			console.log("IntroController::Init");
		}

	}

})();
