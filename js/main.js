$(document).ready(function() {
	var from = {
        lat: '52.399057',
        lng: '13.108887'
    }

    var randomPathsFunction = function(map) {
      calculateTripFrom(map, from);
    }

    buildMap($("#map").get(0), from, randomPathsFunction);

	var Day = Backbone.Model.extend({
		defaults: {
			"weatherForecast": "sunny"
		}

	});
	var TrainingPlan = Backbone.Collection.extend({
		model: Day
	});

	var waypointRoutes = [
	["52.393888,13.133398",					"52.405200,13.143494", "52.401777,13.123602",
					"52.408427,13.100900",
					"52.399590,13.115685",
					"52.393888,13.133398"],
					["52.393888,13.133398",
				   "52.395688,13.131156",
				   "52.404958,13.148214",
				   "52.400873,13.153214",
				   "52.396225,13.139889",
				   "52.393888,13.133398"],
["52.393888,13.133398",
				    "52.406842,13.100948",
				    "52.405611,13.085155",
				    "52.398673,13.092580",
				    "52.394090,13.113565",
				    "52.393888,13.133398"]];

	function shuffle(o){
	    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}
	waypointRoutes = shuffle(waypointRoutes);


	var days = [
		new Day({
			id: "day-1",
			title: "Day 1",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "4 km",
            route: waypointRoutes[0],
			etaTime: "20:31 min"
		}),
		new Day({
			id: "day-3",
			title: "Day 3",
			staticRouteUrl: "http://dummyimage.com/200x200/aaaaaa/000000.png",
			length: "7 km",
			route:waypointRoutes[1],
			etaTime: "45:24 min"
		}),
		new Day({
			id: "day-7",
			title: "Day 7",
			staticRouteUrl: "http://dummyimage.com/200x200/ffffff/000000.png",
			length: "8 km",
			route: waypointRoutes[2],
			etaTime: "50:67 min"
		})
	]

	var trainingPlan = new TrainingPlan(days);

	var DayView = Backbone.View.extend({
		events: {
			"click .container": "map"
		},
		template: _.template($("script.day-view").html()),
		map: function() {
			alert("This is your map!");
		},

		initialize: function() {
			this.model.on("change:length", this.updateLength, this);
			this.$el = $(this.el);
			// this.listenTo(this.model, "change", this.render);
			this.render();
		},
		updateLength: function() {
			this.$el.find("strong").html(this.model.get("length"));
		},
		render: function() {
			console.log("RENDERING");
			this.$el.html(this.template(this.model.attributes));
			var mapEl = this.$el.find(".day-maps").get(0);
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

                var showTripFunction = function(map) {
                    showTrip(map, getRouteParams(day.get("route"), 2.0), day);
                }

				var map = buildMap(mapEl, from, showTripFunction);
				day.set("map", map);
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
function onMapSuccess(map, result, day) {
  addRoute(map, result);
  if (day) {
  	console.log(day.get("id"));
  	var legs = result.response.route[0].leg;
  	var length = 0;
  	for (var i = 0; i < legs.length; i++) {
  		var legLength = legs[i].length;
  		length = length + legLength;
  	}
  	day.set("length", length + " m");
  }
  var maneuver = result.response.route[0].leg[0].maneuver[0];
  var pos = {lat: maneuver.position.latitude, lng: maneuver.position.longitude};
  //addDraggableMarker(pos);
}

function onMapError(error) {
  alert('Ooops!');
}