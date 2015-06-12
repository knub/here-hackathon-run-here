$(document).ready(function() {
    var theMap = buildMap($("#map").get(0));

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
			staticRouteUrl: "http://dummyimage.com/200x200/aaaaaa/000000.png",
			length: "7 km"
		}),
		new Day({
			title: "Day 7",
			staticRouteUrl: "http://dummyimage.com/200x200/ffffff/000000.png",
			length: "8 km"
		})
	]);

	var DayView = Backbone.View.extend({
		tagName: "div",
		className: "day-block",

		events: {
			"click *": "map",
		},
		template: _.template($("script.day-view").html()),
		map: function() {
			alert("This is your map!");
		},

		initialize: function() {
			this.$el = $(this.el);
			// this.listenTo(this.model, "change", this.render);
			this.render();
		},

		render: function() {
			this.$el.html(this.template(this.model.attributes));
			var mapEl = this.$el.find(".day-maps").get(0);
			// buildMap(mapEl);
		}
	});

	var TrainingPlanView = Backbone.View.extend({
		initialize: function() {
			this.render();
		},
		render: function() {
			this.$el.html("<h2>Day view</h2>");
			var planThis = this;
			this.model.forEach(function(day) {
				var dayView = new DayView({ model: day })
				planThis.$el.append(dayView.$el);
				// alert(day.get("title"));
			});
		}
	});

	var trainingPlanView = new TrainingPlanView({
		model: trainingPlan,
		el: $(".day-view")
	});

  	calculateTripFrom ({
        lat: '52.399057',
        lng: '13.108887'
    });
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