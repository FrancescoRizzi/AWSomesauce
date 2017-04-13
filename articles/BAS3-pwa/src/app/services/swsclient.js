(function() {
	'use strict';

	// app.services.swsclient:
	// angular service to act as client to the SWS Service
	// wraps around the AWS JS SDK for the service (apiGateway-js-sdk )
	// which is NOT an angular module/service

	angular.module('app.services.swsclient', [
		//Depends on apigClientFactory (non angular)
		'AdalAngular'
	]);

	angular
		.module('app.services.swsclient')
		.factory('SWSClient', SWSClient);

	/* @ngInject */
	function SWSClient($q, adalAuthenticationService) {
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
			var adalToken = GetADALToken();

			if (adalToken) {

				var apigClient = apigClientFactory.newClient();
				var params = {};
				params['Authorization'] = 'Bearer '+adalToken;
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
			} else {
				errmsg = "Could not find ADAL Token required for Web Service API request.";
				HandleError(errmsg, "GetDirectors");
				deferred.reject(errmsg);
			}
			return deferred.promise;
		}

		//=========================================================
		function GetAgents() {
			var deferred = $q.defer();
			var adalToken = GetADALToken();

			if (adalToken) {

				var apigClient = apigClientFactory.newClient();
				var params = {};
				params['Authorization'] = 'Bearer '+adalToken;
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
			} else {
				errmsg = "Could not find ADAL Token required for Web Service API request.";
				HandleError(errmsg, "GetDirectors");
				deferred.reject(errmsg);
			}
			return deferred.promise;
		}

		//=========================================================
		function GetADALToken() {
			var endpointURI = 'app/intro/intro.html';
			var adalToken = null;

			var adalResource = adalAuthenticationService.getResourceForEndpoint(endpointURI);
			console.log("ADAL Resource for endpoint URI '"+endpointURI+"': '"+adalResource+"'");
			if (adalResource) {
				adalToken = adalAuthenticationService.getCachedToken(adalResource);
				console.log("ADAL Token for endpoint URI '"+endpointURI+"': '"+adalToken+"'");
			}
			return adalToken;
		}

		//=========================================================
		function HandleError(err, context) {
			console.error("Error Caught by "+context+": ", err);
		}

	}
	// /SWSClient
	//============================================================

})();
	