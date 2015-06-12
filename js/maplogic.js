var mapContainer;
var dayViewContainer;
var platform;
var defaultLayers;
var map;
var behavior;

function initMap() {
  /**
   * Boilerplate map initialization code starts below:
   */

  // set up containers for the map  + panel
  mapContainer = document.getElementById('map');
  dayViewContainer = document.getElementById('day-view');

  //Step 1: initialize communication with the platform
  platform = new H.service.Platform({
    app_id: 'DemoAppId01082013GAL',
    app_code: 'AJKnXv84fjrb0KIHawS0Tg',
    useCIT: true,
    useHTTPS: true
  });
  defaultLayers = platform.createDefaultLayers();

  //Step 2: initialize a map - this map is centered over Berlin
  map = new H.Map(mapContainer,
    defaultLayers.normal.map,{
    center: {lat:52.399057, lng:13.108887},
    zoom: 13
  });

  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  // Now use the map as required...
  calculateRouteFromAtoB (platform);
}


/**
 * Calculates and displays a walking route from the St Paul's Cathedral in London
 * to the Tate Modern on the south bank of the River Thames
 *
 * A full list of available request parameters can be found in the Routing API documentation.
 * see:  http://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function calculateRouteFromAtoB (platform) {
  var speed = 2.0;


  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'shortest;pedestrian;park:1',                          // shotest/fastes , walking 
      representation: 'display',                            //
      waypoint0: '52.399057,13.108887',                     // first waypoint
      waypoint1: '52.408813,13.088856',
      routeattributes: 'waypoints,summary,shape,legs',      // information of response route
      maneuverattributes: 'direction,action',               // information of response maneavere
      alternatives: 3,                                      // number of alternatives
      legAttributes: "length",                              // legend information
      returnelevation: true,                                // return elevation in shape
      walkSpeed: speed,                                     // walking speed
    };

  router.calculateRoute(
    routeRequestParams,
    onSuccess,
    onError
  );
}


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
      strokeColor: 'rgba(0, 128, 255, 0.7)'
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
  var route = result.response.route[0];
 /*
  * The styling of the route response on the map is entirely under the developer's control.
  * A representitive styling can be found the full JS + HTML code of this example
  * in the functions below:
  */
  addRouteShapeToMap(route);
  addManueversToMap(route);
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