dojo.require("esri/map");
dojo.require("esri/layers/ArcGISDynamicMapServiceLayer");
dojo.require("esri/layers/ArcGISImageServiceLayer");
dojo.require("esri/layers/ArcGISTiledMapServiceLayer");
dojo.require("esri/layers/TiledMapServiceLayer");
dojo.require("esri/layers/FeatureLayer");
dojo.require("esri/layers/WMSLayer");
dojo.require("esri/layers/WMTSLayer");
dojo.require("esri/geometry/Point");
dojo.require("esri/geometry/ScreenPoint");
dojo.require("esri/SpatialReference");
dojo.require("esri/symbols/MarkerSymbol");
dojo.require("esri/graphic");
dojo.require("esri/symbols/PictureMarkerSymbol");
dojo.require("esri/symbols/SimpleMarkerSymbol");
/*
* 新封装一个map类
* @arg1 id 容纳地图容器的div的id
* @arg2 options 地图初始化选项: optional 详见arcgis for javascript官方api：http://jshelp.thinkgis.cn/jsapi/map-amd.html
*/
function EsriMap(id,options) {
 	this._map = new esri.Map(id,options);

 	this.mapOnClickHandler = new Object();
 	this.mapOnDoubleClickHandler = new Object();
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
    * ReturnType：返回图层id
    **/
    addLayer:function(type,url,options){
    	switch(type){
    		case "ArcGISDynamicMapServiceLayer":
    			var tmp = new esri.layers.ArcGISDynamicMapServiceLayer(url,options);
    			this._map.addLayer(tmp);
    			return tmp.id;
			case "ArcGISImageServiceLayer": 
				var tmp = new esri.layers.ArcGISImageServiceLayer(url,options);
    			this._map.addLayer(tmp);
    			return tmp.id;
			case "FeatureLayer":
				var tmp = new esri.layers.FeatureLayer(url,options);
				this._map.addLayer(tmp);
				return tmp.id;
			case "WMSLayer":
				var tmp = new esri.layers.WMSLayer(url,options);
				this._map.addLayer(tmp);
				return tmp.id;
			case "WMTSLayer":
				var tmp  = new esri.layers.WMTSLayer(url,options);
				this._map.addLayer(tmp);
				return tmp.id;
			case "TiledMapServiceLayer":
				var tmp = new esri.layers.TiledMapServiceLayer(url,options);
				this._map.addLayer(tmp);
				return tmp.id;
			case "ArcGISTiledMapServiceLayer":
				var tmp = new esri.layers.ArcGISTiledMapServiceLayer(url,options);
				this._map.addLayer(tmp);
				return tmp.id;
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
	* @arg4 spatialReference? 空间参考系: optional, 默认为经纬度坐标即spatialreference为4326
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
	* @arg3 spatialreference? 空间参考: optional
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
	* @arg3 spatialreference? 空间参考 optional
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
	},

	/**
	* 设置鼠标光标
	* @arg1 图片路径或ArcGIS支持的光标参数,若为空,则设置为默认值;若值无法找到或不符合规则，则仍为默认光标
	**/
	setCursor:function(cursor){
		if(cursor){
			this._map.setMapCursor(cursor + ",default");
		} else {
			this._map.setMapCursor("default");
		}
	},


	/**
	* 设置图层名称函数
	* @arg1 图层id
	* @arg2 图层名称
	* ReturnType: Boolean
	**/
	setLayerName:function(id,name){
		this._map.getLayer(id).name = name;
		return true;
	},

	/**
	* 获取所有图层名
	* Return Type：三大种类的所有图层id和name的Array
	* 说明：map中的图层有三类：basemaplayer，graphiclayer和普通的地图服务layer;
	*	   graphicsLayerId 管理地图上的FeatureLayer图层和GraphicLayer图层的id;
	*	   basemapLayerId 管理basemap的图层id;
	*  	   layerId 管理地图上非graphicsLayerId的其他地图图层的id,包含basemaplayerId。
	* 注意：name并非图层的必有属性，必须要调用setLayerName()显示设置以后才会有,否则其值为undefined
	**/
	getLayersName:function(){

		var result = new Array();
		var basemaplayers = new Array();
		var graphiclayers = new Array();
		var layers = new Array();

		for(baselayerid in this._map.basemapLayerIds){
			basemaplayers.push({"id":this._map.basemapLayerIds[baselayerid],"name":this._map.getLayer(this._map.basemapLayerIds[baselayerid]).name});
		}

		for(graphiclayerid in this._map.graphicsLayerIds){
			graphiclayers.push({"id":this._map.basemapLayerIds[graphiclayerid],"name":this._map.getLayer(this._map.basemapLayerIds[graphiclayerid]).name});
		}

		for(layerid in this._map.layerIds){
			layers.push({"id":this._map.layerIds[layerid],"name":this._map.getLayer(this._map.layerIds[layerid]).name});
		}

		result.push({"type":"basemapLayerIds","value":basemaplayers});
		result.push({"type":"graphicsLayerIds","value":graphiclayers});
		result.push({"type":"layerIds","value":layers});

		return result;
	},

	/**
	* 利用经纬度添加单个点
	* @arg1 经度
	* @arg2 纬度
	* @arg3 点id
	* @arg4 点渲染器: optional
	* @arg5 空间参考: optional 若为空,默认为当前地图的空间参考
	**/
	drawPoint:function(lon,lat,id,symbol,spatialreference){
		var point;
		if(spatialreference){
			point = new Point(lon,lat,spatialreference,id);
		} else {
			point = new Point(lon,lat,this._map.spatialReference,id);
		}
		if(symbol){
			point.setSymbol(this.param.symbol);
		}
		var graphic = new esri.Graphic(point._point,point._symbol);
		this._map.graphics.add(graphic);
	},

	/**
	* 利用json添加多个点
	* @arg1 data: 经纬度和id组成的json
	* @arg2 symbol: optional
	* @arg3 spatialreference: optional
	**/
	drawMultiPoint:function(data,symbol,spatialreference){
		obj = JSON.parse(data);
		var point;
		var graphic;
		for(i in obj){
			if(spatialreference){
				point = new Point(obj[i].lon,obj[i].lat,spatialreference,obj[i].id);
			} else {
				point = new Point(obj[i].lon,obj[i].lat,this._map.spatialReference);
			}
			if(symbol){
				point.setSymbol(this.param.symbol);
			}	
			graphic = new esri.Graphic(point._point,point._symbol);
			this._map.graphics.add(graphic);
		}
	},

	drawPointByClick:function(evt){
		var point;
		if(this.param.spatialreference){
			point = new Point(evt.mapPoint.x,evt.mapPoint.y,this.param.spatialreference,this.param.id);
		} else {
			point = new Point(evt.mapPoint.x,evt.mapPoint.y,this.param.map.spatialReference,this.param.id);
		}
		if(this.param.symbol){
			point.setSymbol(this.param.symbol);
		}
		var graphic = new esri.Graphic(point._point,point._symbol);
		this.param.map.graphics.add(graphic);
	},

	/**
	* 打开地图上单击添加点事件
	**/
	startAddPoint:function(id,symbol,spatialreference){
		var param = new Object();
		param.id = id;
		param.symbol = symbol;
		param.spatialreference = spatialreference;
		param.map = this._map;

		mapOnClickHandler = dojo.connect(this._map,"onClick",{"param":param},this.drawPointByClick);
	},

	/**
	* 结束地图上单击添加点事件
	**/
	stopAddPoint:function(){
		dojo.disconnect(mapOnClickHandler);
	}
}

/**
* 封装Point类
* @arg1: lat
* @arg2: lon
* @arg3: spatialreference
* @arg4: id
**/
function Point(lon,lat,spatialreference,id) {
	this._point = new esri.geometry.Point(lon,lat); 
	if(spatialreference){
		this._point.setSpatialReference(spatialreference);
	}
	this._symbol = new esri.symbol.SimpleMarkerSymbol();
	this._formerSymbol = new esri.symbol.SimpleMarkerSymbol();
	this._id = id;
}

Point.prototype={

	/**
	* 设置点的Symbol
	* @arg1: 点渲染器
	**/
	setSymbol:function(symbol){
		this._formerSymbol = this._symbol;
		this._symbol = symbol;
	},

	setId:function(id){
		this._id = id;
	}

}

/**
* 简单点渲染器
* @arg1 options: optional,样式选择的json, 可选样式详情请见arcgis for javascript的API：http://jshelp.thinkgis.cn/jsapi/simplemarkersymbol-amd.html
**/
function SimMarkerSymbol(options){
	this._symbol = new esri.symbol.SimpleMarkerSymbol(options);
}

SimMarkerSymbol.prototype = {

	/**
	* 设置点角度函数
	* @arg1 点角度
	**/
	setAngle:function(angle){
		this._symbol.setAngle(angle);
	}
}

/**
* 图片点渲染器
* @arg1 图片url
* @arg2 图片宽度(in pixels)
* @arg3 图片高度(in pixels)
**/
function PicMarkerSymbol(url,width,height){
	this._symbol = new esri.symbol.PictureMarkerSymbol(url,width,height);
}

PicMarkerSymbol.prototype = {

	/**
	* 设置点角度函数
	* @arg1 点角度
	**/
	setAngle:function(angle){
		this._symbol.setAngle(angle);
	}
}




