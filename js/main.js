$(document).ready(function() {
	alert("I am ready");

    initMap();
});

/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccess(result) {
  addRoute(result);
}

function onError(error) {
  alert('Ooops!');
}