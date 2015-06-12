var behavior;
var platform;

function buildMap(mapContainer, from, callback) {
  platform = new H.service.Platform({
    app_id: 'DemoAppId01082013GAL',
    app_code: 'AJKnXv84fjrb0KIHawS0Tg',
    useCIT: true,
    useHTTPS: true
  });
  var defaultLayers = platform.createDefaultLayers();

  // Step 2
  var map = new H.Map(mapContainer,
    defaultLayers.normal.map,{
    center: { lat:52.399057, lng: 13.108887 }
    // zoom: 13
  });

  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  callback(map);
  return map;
}

function getRouteParams(waypoints, speed) {
    routeRequestParams = {
          mode: 'shortest;pedestrian',                          // shotest/fastes , walking 
          representation: 'display',
          waypoint0: waypoints[0],                       // first waypoint
          waypoint1: waypoints[1],
          waypoint2: waypoints[2],
          waypoint3: waypoints[3],
          waypoint4: waypoints[4],
          waypoint5: waypoints[5],
          waypoint6: waypoints[0],
          routeattributes: 'waypoints,summary,shape,legs',      // information of response route
          maneuverattributes: 'direction,action',               // information of response maneavere
          legAttributes: "length",                              // legend information
          returnelevation: true,                                // return elevation in shape
          walkSpeed: speed                                      // walking speed
    };
    return routeRequestParams;
}

function showTrip(map, routeRequestParams, day) {
  var router = platform.getRoutingService();

  var successFunction = function(result) {
    onMapSuccess(map, result, day);
  }

  router.calculateRoute(
    routeRequestParams,
    successFunction,
    onMapError
  );
}

function randomTrip(from) {
  var waypoints = circleWaypoints(from);
  return [pointToString(from),
         pointToString(waypoints[0]),
         pointToString(waypoints[1]),
         pointToString(waypoints[2]),
         pointToString(waypoints[3]),
         pointToString(from)]
}

function calculateTripFrom(map, from) {
  var speed = 2.0;

  for (var i = 0; i < 3; ++i)
  {
    var waypoints = circleWaypoints(from);
    var router = platform.getRoutingService(),
    routeRequestParams = {
        mode: 'shortest;pedestrian',                          // shotest/fastes , walking 
        representation: 'display',
        waypoint0: pointToString(from),                       // first waypoint
        waypoint1: 'passThrough!' + pointToString(waypoints[0]),
        waypoint2: 'passThrough!' + pointToString(waypoints[1]),
        waypoint3: 'passThrough!' + pointToString(waypoints[2]),
        waypoint4: 'passThrough!' + pointToString(waypoints[3]),
        waypoint5: pointToString(from),
        routeattributes: 'waypoints,summary,shape,legs',      // information of response route
        maneuverattributes: 'direction,action',               // information of response maneavere
        legAttributes: "length",                              // legend information
        returnelevation: true,                                // return elevation in shape
        walkSpeed: speed                                      // walking speed
      };

      var successFunction = function(result) {
          onMapSuccess(map, result);
      }

      router.calculateRoute(
          routeRequestParams,
          successFunction,
          onMapError
     );
  }
}

function circleWaypoints(point) {
  var lng = parseFloat(point.lng);
  var lat = parseFloat(point.lat);
  var theta = Math.random() * 2 * Math.PI;

  var maxDist = 0.015;
  var p1 = {lat: lat - maxDist, lng: lng};
  var p2 = {lat: lat, lng: lng + maxDist};
  var p3 = {lat: lat, lng: lng + maxDist};
  var p4 = {lat: lat + maxDist, lng: lng};

  return [rotatePoint(point, p1, theta), rotatePoint(point, p2, theta), rotatePoint(point, p3, theta), rotatePoint(point, p4, theta)];
}

function rotatePoint(orig, point, theta) {
  var ox = parseFloat(orig.lng); // x
  var oy = parseFloat(orig.lat); // y

  var x = parseFloat(point.lng);
  var y = parseFloat(point.lat);

  var nx = Math.cos(theta) * (x-ox) - Math.sin(theta) * (y-oy) + ox;
  var ny = Math.sin(theta) * (x-ox) + Math.cos(theta) * (y-oy) + oy;

  return {lng: nx, lat: ny};
}

function pointToString(point) {
  return point.lat.toString() + ',' + point.lng.toString();
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(map, route){
  var strip = new H.geo.Strip(),
    routeShape = route.shape,
    polyline;

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: getRandomColor()
    }
  });
  // Add the polyline to the map
  map.addObject(polyline);
  return polyline;
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(map, route){
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}});

  // Add a marker for each maneuver
  for (var i = 0;  i < route.leg.length; i += 1) {
    
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[0];
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      map.addObject(marker);

      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[route.leg[i].maneuver.length-1];
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      map.addObject(marker);
  }
}

function addRoute(map, result) {
  var routes = result.response.route;
  var polyline;

  for (var i = 0; i < 1; i++) {
    var route = routes[i];

    polyline = addRouteShapeToMap(map, route);
    addManueversToMap(map, route);
  }
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), false);
}
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Adds a  draggable marker to the map..
 *
 * @param {H.mapevents.Behavior} behavior  Behavior implements
 *                                         default interactions for pan/zoom
 */
function addDraggableMarker(position) {
  var marker = new H.map.Marker(position);
  // Ensure that the marker can receive drag events
  marker.draggable = true;
  map.addObject(marker);

  // disable the default draggability of the underlying map
  // when starting to drag a marker object:
  map.addEventListener('dragstart', function(ev) {
    var target = ev.target;
    if (target instanceof H.map.Marker) {
      behavior.disable();
    }
  }, false);

  // re-enable the default draggability of the underlying map
  // when dragging has completed
  map.addEventListener('dragend', function(ev) {
    var target = ev.target;
    if (target instanceof mapsjs.map.Marker) {
      behavior.enable();
    }
  }, false);

  // Listen to the drag event and move the position of the marker
  // as necessary
   map.addEventListener('drag', function(ev) {
    var target = ev.target,
        pointer = ev.currentPointer;
    if (target instanceof mapsjs.map.Marker) {
      target.setPosition(map.screenToGeo(pointer.viewportX, pointer.viewportY));
    }
  }, false);
}

Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}