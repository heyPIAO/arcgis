dojo.require("esri/symbols/SimpleMarkerSymbol");
dojo.require("esri/Color");
dojo.require("esri/symbols/SimpleLineSymbol");
dojo.require("esri/symbols/SimpleFillSymbol");

var map;
var id;
var visibility = false;

function init(idin){
	//map = new EsriMap(id,{basemap:"topo"});
	map = new EsriMap(idin);
	id = map.addLayer("ArcGISTiledMapServiceLayer","http://36.110.27.181:6080/arcgis/rest/services/ChinaMap/MapServer",{hasAttributionData:true});
	map.setLayerName(id,"datalayer");
}

function addLayer(){
	id = map.addLayer("ArcGISTiledMapServiceLayer","http://36.110.27.181:6080/arcgis/rest/services/ChinaMap/MapServer",{hasAttributionData:true});
	map.setLayerName(id,"datalayer");
}

function testSetScale(num){
	map.setScale(num);
}

function testGetScale(){
	alert(map.getScale());
}

function testSetCenter(lon,lat,spatialreference){
	map.setCenter(lon,lat,spatialreference);
}

function testGetCenter(){
	alert(map.getCenter());
}

function testGeocodeToScreen(lon,lat){
	alert(map.geocodeToScreen(lon,lat));
}

function testScreenToGeocode(x,y){
	alert(map.screenToGeocode(x,y));
}

function testSetCursor(cursor){
	map.setCursor(cursor);
}

function testGetLayersName(){
	//alert(map.getLayersName());
	console.log(map.getLayersName());
}

function testAddPoint(lon,lat,id,symbol,spatialreference) {
	map.drawPoint(lon,lat,id,symbol,spatialreference);
}

function testAddMultiPoint(){
	var json = "[{\"lat\": \"3378004.926107082\",\"lon\": \"590036.5823106212\",\"id\": \"testPoint\"},"
	 + "{\"lat\": \"3379232.055262021\",\"lon\": \"591010.1723839608\",\"id\": \"testPoint\"}]";
	console.log(json);
	map.drawMultiPoint(json);
}

function testStartAddPoint(id){
	map.startAddPoint(id);
}

function testStopAddPoint(){
	map.stopAddPoint();
}

function testSelectGraphic(){
	map.startSelectGraphic();
}

function testStopSelectGraphic(){
	map.stopSelectGraphic();
}

function testAddPolyline(id,coordinates,symbol,spatialreference){
	coordinates = new Array();
	coordinates.push([120.00,40.00]);
	coordinates.push([115.00,50.00]);
	map.addPolyline(id,coordinates,symbol,false,null,null,spatialreference);
}

function testAddPolylineWithArrow(id,coordinates,symbol,spatialreference){
	coordinates = new Array();
	coordinates.push([590036.5823106212,3378004.926107082]);
	coordinates.push([591010.1723839608,3379232.055262021]);
	map.addPolyline(id,coordinates,symbol,true,10,2,spatialreference);
}

function testStartDeleteGraphic(){
	map.startDeleteGraphic();
}

function testStopDeleteGraphic(){
	map.stopDeleteGraphic();
}

function testSelectedGraphicById(){
	//map.selectGraphicById("testPoint");
	map.selectGraphicById("testPolygon");
}

function testClearSelectedGraphic(){
	map.clearSelectedGraphic();
}

function deleteAllPoint(){
	map.clearGraphic("point");
}

function testDeleteGraphicById(){
	map.deleteGraphicById("testPoint");
	map.deleteGraphicById("test");
	map.deleteGraphicById("testPolygon");
}

function testChangePointSymbol(){
	map.changePointSymbol("testPoint",new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10,
    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
    new esri.Color([255,0,0]), 1),
    new esri.Color([0,255,0,0.25])));
}

function testChangePolylineSymbol(){
	map.changePolylineSymbol("test",new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color([255,0,0]),1),true,10,2);
}

function testBackSymbol(){
	map.backToFormerSymbol();
}

function testUpdatePoint(){
	map.updatePoint("testPoint",590438.9599952165,3377665.4707631157);
}

function testAddPolygon(){
	//id,coordinates,symbol,spatialReference
	coordinates = new Array();
	coordinates.push([100.00,40.00]);
	coordinates.push([115.00,50.00]);
	coordinates.push([120.00,60.00]);
	coordinates.push([100.00,40.00]);
	map.addPolygon("testPolygon",coordinates);
}

function testUpdatePolygon(){
	map.updatePolygon("testPolygon",new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
    new esri.Color([255,0,0]), 2),new esri.Color([255,255,0,0.25])
  ));
}

function testContainsPoint(){
	var result = map.containsPoint("testPolygon",115.00936037922241,53.308619370755835);
	console.log(result);
}

function startEditMove(){
	map.startEditMoveGraphic();
}

function stopEditMove(){
	map.stopEditMoveGraphic();
}

function testAddSection(){
	//id,lat,lon,startAngle,angle,radius,symbol
	map.addSection("testSection",115.00,50.00,30,60,20);
}
function testUpdateSection(){
	var result = map.updateSection("testSection",30,60,20,new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
    new esri.Color([255,0,0]), 2),new esri.Color([255,255,0,0.25])
  ));
	console.log(result);
}

function testGetPoint(){
	console.log(map.getGeometry("testPolygon"));
	console.log(map.getGeometry("testLine"));
	console.log(map.getGeometry("testPoint"));
}

function testDelLayer(){
	map.deleteLayer(id);
}

function testSetLayerVisibility(){
	map.setLayerVisibility(id,visibility);
	visibility = !visibility;
}

function testDrawPolygonByClick(){
	map.startDrawPolygonByClick("clickPolygon");
}

function testMeasureLength(){
	coordinates = new Array();
	coordinates.push([100.00,40.00]);
	coordinates.push([115.00,50.00]);
	// coordinates.push([120.00,60.00]);
	// coordinates.push([100.00,40.00]);
	console.log(map.measureLength(coordinates[0],coordinates[1]));
}

function testStartMeasureLengthClick(){
	map.startMeasureLengthClick();
}

function testStopMeasureLengthClick(){
	map.stopMeasureLengthClick();
}
