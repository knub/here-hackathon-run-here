$(document).ready(function() {
	var from = {
        lat: '52.399057',
        lng: '13.108887'
    }

    buildMap($("#map").get(0), from);

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
			id: "day-1",
			title: "Day 1",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "4 km",
			etaTime: "20:31 min"
		}),
		new Day({
			id: "day-3",
			title: "Day 3",
			staticRouteUrl: "http://dummyimage.com/200x200/aaaaaa/000000.png",
			length: "7 km",
			etaTime: "45:24 min"
		}),
		new Day({
			id: "day-7",
			title: "Day 7",
			staticRouteUrl: "http://dummyimage.com/200x200/ffffff/000000.png",
			length: "8 km",
			etaTime: "50:67 min"
		})
	]);

	var DayView = Backbone.View.extend({
		events: {
			"click .container": "map",
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
		    // buildMap($("#map").get(0), from);
		    // buildMap($("#map").get(0), from);
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
				var el = $("#" + day.get("id"))[0]
				var dayView = new DayView({
					model: day,
					el: el
				})
				planThis.$el.append(dayView.$el);
				var mapEl = $(".day-maps").last()[0];
				buildMap(mapEl, from);
			});
		}
	});

	var trainingPlanView = new TrainingPlanView({
		model: trainingPlan,
		el: $(".day-view")
	});

});




/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onMapSuccess(map, result) {
  addRoute(map, result);
  var maneuver = result.response.route[0].leg[0].maneuver[0];
  var pos = {lat: maneuver.position.latitude, lng: maneuver.position.longitude};
  //addDraggableMarker(pos);
}

function onMapError(error) {
  alert('Ooops!');
}