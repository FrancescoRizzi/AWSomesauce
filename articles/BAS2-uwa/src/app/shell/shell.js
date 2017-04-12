(function() {

	angular
		.module('app.shell')
		.controller('ShellController', ShellController);

	// ShellController:
	//============================================================
	function ShellController($scope, $state) {
		var vm = this;

		Init($state);
		//=========================================================

		function Init($state) {
			console.log("ShellController::Init");
		}

	}

})();
