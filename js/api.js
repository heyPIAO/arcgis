dojo.require("esri/map");
dojo.require("esri/layers/ArcGISDynamicMapServiceLayer");
dojo.require("esri/layers/ArcGISImageServiceLayer");
dojo.require("esri/geometry/Point");
dojo.require("esri/geometry/ScreenPoint");
dojo.require("esri/SpatialReference");

/*
* 初始化一个map对象
* @arg1 id 容纳地图容器的div的id
* @arg2 options 地图初始化选项，详见arcgis for javascript官方api：http://jshelp.thinkgis.cn/jsapi/map-amd.html
*/
function EsriMap(id,options) {
 	this._map = new esri.Map(id,options);
 	// this._map = new esri.Map(id,{
 	// 	basemap:"topo"
 	// });
}

EsriMap.prototype = {
  	
  	/**
	* 添加地图图层函数
	* @arg1 type 地图种类
    * @arg2 url 地图服务的完整url路径,对于
    * @arg3 地图渲染的options,详见arcgis for javascript官方api：https://developers.arcgis.com/javascript/3/jsapi/arcgisdynamicmapservicelayer-amd.html
    **/
    addLayer:function(type,url,options){
    	switch(type){
    		case "ArcGISDynamicMapServiceLayer":
    			this._map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(url,options));
    			break;
			case "ArcGISImageServiceLayer": 
    			this._map.addLayer(new esri.layers.ArcGISImageServiceLayer(url,options));
				break;
			case "FeatureLayer":
				this._map.addLayer(new esri.layers.FeatureLayer(url,options));
				break;
			case "WMSLayer":
				this._map.addLayer(new esri.layers.WMSLayer(url,options));
				break;
			case "WMTSLayer":
				this._map.addLayer(new esri.layers.WMTSLayer(url,options));
				break;
			// case "graphicslayer":
			// 	this._map.addLayer(new esri.layers.GraphicsLayer(url,options));
			// 	break;
			// case "tilelayer": 
			// 	this_map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(url,options));
			// 	break;
			// case "vectortilelayer": 
			// 	this._map.addLayer(new esri.layers.WebTiledLayer(url,options));
			// 	break;
			// case "maptilelayer": break;
			default: 
				console.error("Not support this kind of map service yet"); 
				break;
    	}
	},

	/**
	* 设置比例尺函数
	* @arg1 scale 比例尺: Number > 0
	* Return Type: Boolean
    **/
	setScale:function(scale){
		if(scale <=0 )
		{
			console.error("scale should greater than 0");
			return false;
		} 
		else {
			this._map.setScale(scale);
			return true;
		}
	},

	/**
	* 返回地图当前比例尺大小
	* Return Type: Number
    **/
	getScale:function(){
		return this._map.getScale();
	},

	/**
	* 设置地图中心点函数
	* @arg1 lon 中心点经度
	* @arg2 lat 中心点纬度
	* @arg4 spatialReference? 空间参考系: nullable, 默认为经纬度坐标即spatialreference为4326
    **/
	setCenter:function(lon,lat,spatialreference){
		
		var point = new esri.geometry.Point(lon,lat);

		if(spatialreference){
			point.setSpatialReference(spatialreference);
		} else {
			point.setSpatialReference(this._map.spatialreference);
		}

		this._map.centerAt(point);
	},

	/**
	* 获取地图中心点函数
	* Return Type: 数组，按顺序分别为中心点的横坐标与纵坐标（经纬度坐标或者是投影坐标，具体看数据）
    **/
	getCenter:function(){
		var xmin = this._map.extent.xmin;
		var xmax = this._map.extent.xmax;
		var ymin = this._map.extent.ymin;
		var ymax = this._map.extent.ymax;
		
		var xmid = (xmin + xmax)/2;
		var ymid = (ymin + ymax)/2;

		var result = new Array();
		result.push(xmid);
		result.push(ymid);
		return result;
	},

	/**
	* 将屏幕坐标转换为经纬度坐标
	* @arg1 x
	* @arg2 y
	* @arg3 spatialreference? 空间参考: nullable
	* Return Type: 数组，按顺序分别为中心点的横坐标与纵坐标（经纬度坐标或者是投影坐标，具体看数据）
	**/
	screenToGeocode:function(x,y,spatialreference){
		var point = this._map.toMap(new esri.geometry.ScreenPoint(x,y));
		if(spatialreference){
			point.setSpatialReference(spatialreference);
		} else {
			point.setSpatialReference(this._map.spatialreference);
		}
		var result = new Array();
		result.push(point.x);
		result.push(point.y);
		return result;
	},

	/**
	* 将地理坐标转换为屏幕坐标
	* @arg1 lon 经度
	* @arg2 lat 纬度
	* @arg3 spatialreference? 空间参考 nullable
	* Return Type: 数组，按顺序分别为屏幕坐标x和y
	**/
	geocodeToScreen:function(lon,lat,spatialreference){
		var point = new esri.geometry.Point(lon,lat);
		if(spatialreference){
			point.setSpatialReference(spatialreference);
		} else {
			point.setSpatialReference(this._map.spatialreference);
		}
		var screenPoint = this._map.toScreen(point);
		var result = new Array();
		result.push(screenPoint.x);
		result.push(screenPoint.y);
		return result;
	}

}




