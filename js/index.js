var map;

function init(id){
	map = new EsriMap(id,{basemap:"topo"});
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