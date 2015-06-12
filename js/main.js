$(document).ready(function() {

    initMap();









	var Day = Backbone.Model.extend({
		defaults: {
			"weatherForecast": "sunny"
		}

	});
	var TrainingPlan = Backbone.Collection.extend({
		model: Day
	});


	var trainingPlan = new TrainingPlan([
		new Day({
			title: "Day 1",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "4 km"
		}),
		new Day({
			title: "Day 3",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "7 km"
		}),
		new Day({
			title: "Day 7",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "8 km"
		})
	]);
});
/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccess(result) {
  addRoute(result);
  var maneuver = result.response.route[0].leg[0].maneuver[0];
  var pos = {lat: maneuver.position.latitude, lng: maneuver.position.longitude};
  addDraggableMarker(pos);
}

function onError(error) {
  alert('Ooops!');
}