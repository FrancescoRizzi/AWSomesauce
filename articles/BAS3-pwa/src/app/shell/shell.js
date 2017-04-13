(function() {

	angular
		.module('app.shell')
		.controller('ShellController', ShellController);

	// ShellController:
	//============================================================
	function ShellController($scope, $state, adalAuthenticationService) {
		var vm = this;

		vm.Login=Login;
		vm.Logout=Logout;

		Init($state);

		//=========================================================
		function Init($state) {
			console.log("ShellController::Init");
		}

		//=========================================================
		function Logout() {
			console.log("ShellController::Logout");
			adalAuthenticationService.logOut();
		}

		//=========================================================
		function Login() {
			console.log("ShellController::Login");
			adalAuthenticationService.login();
		}

	}

})();
