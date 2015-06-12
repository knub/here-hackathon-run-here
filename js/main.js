$(document).ready(function() {
	var from = {
        lat: '52.393888',
        lng: '13.133398'
    }

    var randomPathsFunction = function(map) {
      calculateTripFrom(map, from);
    }

    var mainMap = buildMap($("#map").get(0), from, randomPathsFunction);

	var Day = Backbone.Model.extend({
		defaults: {
			"weatherForecast": "sunny"
		}

	});
	var TrainingPlan = Backbone.Collection.extend({
		model: Day
	});

	var waypointRoutes = [
		["52.393888,13.133398", "52.405200,13.143494", "52.401777,13.123602",
		"52.408427,13.100900", "52.399590,13.115685", "52.393888,13.133398"],
		["52.393888,13.133398", "52.395688,13.131156", "52.404958,13.148214",
 	    "52.400873,13.153214", "52.396225,13.139889", "52.393888,13.133398"],
		["52.393888,13.133398", "52.406842,13.100948", "52.405611,13.085155",
	    "52.398673,13.092580", "52.394090,13.113565", "52.393888,13.133398"]];

	function shuffle(o){
	    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}
	waypointRoutes = shuffle(waypointRoutes);

	waypointRoutes[2] = randomTrip(from);

	var days = [
		new Day({
			id: "day-1",
			title: "Day 1",
			staticRouteUrl: "http://dummyimage.com/200x200/dddddd/000000.png",
			length: "",
            route: waypointRoutes[0],
			etaTime: "",
            weather: "img/sunny.png"
		}),
		new Day({
			id: "day-3",
			title: "Day 3",
			staticRouteUrl: "http://dummyimage.com/200x200/aaaaaa/000000.png",
			length: "",
			route:waypointRoutes[1],
			etaTime: "",
            weather: "img/cloudy.png"
		}),
		new Day({
			id: "day-7",
			title: "Day 7",
			staticRouteUrl: "http://dummyimage.com/200x200/ffffff/000000.png",
			length: "",
			route: waypointRoutes[2],
			etaTime: "",
            weather: "img/rainy.png"
		})
	]

	var trainingPlan = new TrainingPlan(days);

	var DayView = Backbone.View.extend({
		className: "day-block",
		events: {
			"click .container": "map"
		},
		template: _.template($("script.day-view").html()),
		map: function() {
            mainMap.getObjects().forEach(function(obj) { 
                mainMap.removeObject(mainMap.getObjects()[0]); 
            });
            showTrip(mainMap, getRouteParams(this.model.get("route") , 2.0));



            // Get context with jQuery - using jQuery's .get() method.
            $("#heightMap").remove();
            $(".map-view").append("<canvas id='heightMap' style='width: 90%; height: 400px'></canvas>");
            var ctx = $("#heightMap").get(0).getContext("2d");
            // This will get the first returned node in the jQuery collection.
            var heights = this.model.get("heights");
            var x = [];
            var newHeights = [];
            for (var i = 0; i < heights.length; i++) {
            	if (i % 4 == 0) {
	            	x.push(Math.round((i * 100) / heights.length));
	            	newHeights.push(heights[i]);
	            }
            }
            var data = {
                labels: x,
                datasets: [
                    {
                        label: "Height profil",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: heights
                    }
                ]
            };
         //    Chart.defaults.global = {
        	//     showTooltips: false
        	// };
            var chart = new Chart(ctx).Line(data, {
			    bezierCurve: false
			});
		},

		initialize: function() {
			this.model.on("change:length", this.updateLength, this);
			this.$el = $(this.el);
			// this.listenTo(this.model, "change", this.render);
			this.render();
		},
		updateLength: function() {
			this.$el.find("strong").html(this.model.get("length"));
            var length = this.model.get("length");
            var meterPerMinute = 180;
            var speed = parseInt(length) / meterPerMinute;
            this.$el.find("em").html(speed.toFixed(0).toString() + " min");
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


// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


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
  	length = length + getRandomInt(-200, 200);
  	day.set("length", length + " m");




  	var heights = [];
  	for (var i = 0; i < result.response.route[0].shape.length; i++) {
  		var line = result.response.route[0].shape[i];
  		heights.push(parseFloat(line.split(",")[2]));
  	}
  	day.set("heights", heights);

  	console.log(heights);
  }
  var maneuver = result.response.route[0].leg[0].maneuver[0];
  var pos = {lat: maneuver.position.latitude, lng: maneuver.position.longitude};
  //addDraggableMarker(pos);
}

function onMapError(error) {
  alert('Ooops!');
}