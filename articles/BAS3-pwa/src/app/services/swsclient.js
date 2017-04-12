(function() {
	'use strict';

	// app.services.swsclient:
	// angular service to act as client to the SWS Service
	// wraps around the AWS JS SDK for the service (apiGateway-js-sdk )
	// which is NOT an angular module/service

	angular.module('app.services.swsclient', [
		//Depends on apigClientFactory (non angular)
	]);

	angular
		.module('app.services.swsclient')
		.factory('SWSClient', SWSClient);

	/* @ngInject */
	function SWSClient($q) {
	//============================================================
		var service = {
			GetDirectors: GetDirectors,
			GetAgents: GetAgents
		};
		return service;
		//=========================================================

		//=========================================================
		function GetDirectors() {
			var deferred = $q.defer();

			var apigClient = apigClientFactory.newClient();
			var params = {};
			var body = "{}";
			var additionalParams = {};

			apigClient.directorsGet(params, body, additionalParams)
				.then(function(response) {
					console.log("SWSClient::GetDirectors: received response.");
					var data = response.data.directors;
					var serialized_data = JSON.stringify(data);
					deferred.resolve(serialized_data);
				})
				.catch(function(err) {
					HandleError(err, "GetDirectors");
					deferred.reject(err);
				});
			return deferred.promise;
		}

		//=========================================================
		function GetAgents() {
			var deferred = $q.defer();

			var apigClient = apigClientFactory.newClient();
			var params = {};
			var body = "{}";
			var additionalParams = {};

			apigClient.agentsGet(params, body, additionalParams)
				.then(function(response) {
					console.log("SWSClient::GetAgents: received response.");
					var data = response.data.agents;
					var serialized_data = JSON.stringify(data);
					deferred.resolve(serialized_data);
				})
				.catch(function(err) {
					HandleError(err, "GetAgents");
					deferred.reject(err);
				});
			return deferred.promise;
		}

		//=========================================================
		function HandleError(err, context) {
			console.error("Error Caught by "+context+": ", err);
		}

	}
	// /SWSClient
	//============================================================

})();
	