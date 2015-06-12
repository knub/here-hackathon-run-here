var behavior;
var platform;

function buildMap(mapContainer, from) {
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
    center: { lat:52.399057, lng: 13.108887 },
    zoom: 13
  });

  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  calculateTripFrom(map, from);
}

function calculateTripFrom(map, from) {
  var waypoints = [pointToString(mutatePoint(from)), pointToString(mutatePoint(from)), pointToString(mutatePoint(from))];
  var permutations = permute(waypoints);
  var speed = 2.0;

  for (var permutation of permutations) {
    var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'shortest;pedestrian',                          // shotest/fastes , walking 
      representation: 'display',
      waypoint0: pointToString(from),                       // first waypoint
      waypoint1: permutation[0],
      waypoint2: permutation[1],
      waypoint3: permutation[2],
      waypoint4: pointToString(from),
      routeattributes: 'waypoints,summary,shape,legs',      // information of response route
      maneuverattributes: 'direction,action',               // information of response maneavere
      alternatives: 3,                                      // number of alternatives
      legAttributes: "length",                              // legend information
      returnelevation: true,                                // return elevation in shape
      walkSpeed: speed                                      // walking speed
  };

  var success = function(result) {
    onMapSuccess(map)
  }

    router.calculateRoute(
      routeRequestParams,
      onMapSuccess,
      onMapError
    );
  }
}

function mutatePoint(point) {
  var newlng = parseFloat(point.lng);
  var newlat = parseFloat(point.lat);

  var maxDist = 0.005;
  newlng += (Math.random() * 2.0 - 1.0) * maxDist; // mappting to [-maxDist;maxDist]
  newlat += (Math.random() * 2.0 - 1.0) * maxDist;

  return {lat: newlat, lng: newlng};
}

function pointToString(point) {
  return point.lat.toString() + ',' + point.lng.toString();
}

function permute(input) {
  var permArr = [], usedChars = [];
  var i, ch;
  for (i = 0; i < input.length; i++) {
    ch = input.splice(i, 1)[0];
    usedChars.push(ch);
    if (input.length == 0) {
      permArr.push(usedChars.slice());
    }
    permute(input);
    input.splice(i, 0, ch);
    usedChars.pop();
  }
  return permArr
};

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route){
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
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route){
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
      'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
    group = new  H.map.Group(),
    i,
    j;

  // Add a marker for each maneuver
  for (i = 0;  i < route.leg.length; i += 1) {
    
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[0];
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      group.addObject(marker);

      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[route.leg[i].maneuver.length-1];
      // Add a marker to the maneuvers group
      var marker =  new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude} ,
        {icon: dotIcon});
      marker.instruction = maneuver.instruction;
      group.addObject(marker);
  }

  // Add the maneuvers group to the map
  map.addObject(group);
}

function addRoute(result) {
  var routes = result.response.route;

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];

    addRouteShapeToMap(route);
    addManueversToMap(route);
  }
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