dojo.require("esri/symbols/SimpleMarkerSymbol");
dojo.require("esri/Color");
dojo.require("esri/symbols/SimpleLineSymbol");
var map;

function init(id){
	//map = new EsriMap(id,{basemap:"topo"});
	map = new EsriMap(id);
	var id = map.addLayer("ArcGISDynamicMapServiceLayer","http://122.224.135.67:6080/arcgis/rest/services/HY_BCW_UNITE/MapServer",{hasAttributionData:true});
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
	coordinates.push([590036.5823106212,3378004.926107082]);
	coordinates.push([591010.1723839608,3379232.055262021]);
	map.addPolyline(id,coordinates,symbol,false,null,null,spatialreference);
}

function testAddPolylineWithArrow(id,coordinates,symbol,spatialreference){
	coordinates = new Array();
	coordinates.push([590036.5823106212,3378004.926107082]);
	coordinates.push([591010.1723839608,3379232.055262021]);
	map.addPolyline(id,coordinates,symbol,true,20,2,spatialreference);
}

function testStartDeleteGraphic(){
	map.startDeleteGraphic();
}

function testStopDeleteGraphic(){
	map.stopDeleteGraphic();
}

function deleteAllPoint(){
	map.clearGraphic("point");
}

function testChangeSymbol(){
	map.changeSymbol("testPoint",new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10,
    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
    new esri.Color([255,0,0]), 1),
    new esri.Color([0,255,0,0.25])));
}

function testBackSymbol(){
	map.backToFormerSymbol();
}

function testUpdatePoint(){
	map.updatePoint("testPoint",590438.9599952165,3377665.4707631157);
}
