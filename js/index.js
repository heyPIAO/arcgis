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
	var json = "[{\"lat\": \"3377665.4707631157\",\"lon\": \"590438.9599952165\",\"id\": \"testPoint\"}]";
	map.drawMultiPoint(json);
}

function testStartAddPoint(id){
	map.startAddPoint(id);
}

function testStopAddPoint(){
	map.stopAddPoint();
}