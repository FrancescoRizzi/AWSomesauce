(function() {

	angular
		.module('app.error')
		.controller('ErrorController', ErrorController);

	// ErrorController:
	//============================================================
	function ErrorController(errorInfo) {
		var vm = this;

		vm.errorInfo = errorInfo;

		vm.ReadableErrorReason = ReadableErrorReason;
		vm.ReadableErrorInfo = ReadableErrorInfo;

		Init();
		//=========================================================

		function Init() {
			console.log("ErrorController::Init");
			console.log("Error Info:\n"+vm.errorInfo);
		}

		function ReadableErrorInfo() {
			return JSON.stringify(vm.errorInfo);
		}
		
		function ReadableErrorReason() {
			if (vm.errorInfo && vm.errorInfo.reason) {
				return vm.errorInfo.reason;
			}
			return "Unspecified.";
		}

	};

})();
