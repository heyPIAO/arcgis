dojo.require("esri/map");
dojo.require("esri/Color");
dojo.require("esri/geometry/mathUtils");
dojo.require("esri/geometry/geodesicUtils");
dojo.require("esri/geometry/geometryEngine");
dojo.require("esri/units");
dojo.require("esri/symbols/Font");

dojo.require("esri/layers/ArcGISDynamicMapServiceLayer");
dojo.require("esri/layers/GraphicsLayer");
dojo.require("esri/layers/ArcGISImageServiceLayer");
dojo.require("esri/layers/ArcGISTiledMapServiceLayer");
dojo.require("esri/layers/TiledMapServiceLayer");
dojo.require("esri/layers/FeatureLayer");
dojo.require("esri/layers/WMSLayer");
dojo.require("esri/layers/WMTSLayer");
dojo.require("esri/geometry/Point");
dojo.require("esri/geometry/Polyline");
dojo.require("esri/geometry/Polygon");
dojo.require("esri/geometry/ScreenPoint");
dojo.require("esri/geometry/Circle");

dojo.require("esri/SpatialReference");
dojo.require("esri/symbols/MarkerSymbol");
dojo.require("esri/symbols/TextSymbol");
dojo.require("esri/graphic");
dojo.require("esri/symbols/PictureMarkerSymbol");
dojo.require("esri/symbols/SimpleMarkerSymbol");
dojo.require("esri/symbols/LineSymbol");
dojo.require("esri/symbols/SimpleLineSymbol");

dojo.require("esri/toolbars/draw");
dojo.require("esri/toolbars/edit");

dojo.require("esri/tasks/FindParameters");
dojo.require("esri/tasks/FindTask");
//dojo.require("dojo/_base/event");

var editingEnabled = false;
var isAllowedDeleteVertex = true;
var editBar;
var drawBar;
var editBarVertextHandler;
/*
* 新封装一个map类
* @arg1 id 容纳地图容器的div的id
* @arg2 options 地图初始化选项: optional 详见arcgis for javascript官方api：http://jshelp.thinkgis.cn/jsapi/map-amd.html
*/
function EsriMap(id,options) {
 	this._map = new esri.Map(id,options);
 	this.mapOnClickHandler = new Object();
 	this.graphicSelecteOnClickHandler = new Object();
 	this.graphicDeleteOnClickHander = new Object();
 	this.mapOnDoubleClickHandler = new Object();
 	this.mapOnEditGraphicHandler = new Object();
 	this.mapMeasureLengthOnClickHandler = null;
 	this.measureGraphicLayerMouseOverHandler = null;
 	this.measureGraphicLayerMouseOutHandler = null;
 	this.drawEndHandler = null;

 	//初始化toolbar编辑器
 	// this._toolbar = new esri.toolbars.Draw(this._map);
 	// this._editBar = new esri.toolbars.Edit(this._map);
 	// this._map = new esri.Map(id,{
 	// 	basemap:"topo"
 	// });
	this.selectedGraphic = new esri.Graphic();
	this.selectedPointSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE,20,
    		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color([255,0,0]), 1),
    		new esri.Color([0,255,0,0.25]));
    this.selectedPolylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color([255,0,0]),1);
	this.selectedPolylineSymbol.setWidth(6);
	this.selectedPolygonSymbol = new esri.symbol.SimpleFillSymbol();
	this.selectedPolygonSymbol.setColor(new esri.Color([255,255,0,0.5]));

	//TODO 还需添加selectedLineSymbol和selectedPolygonSymbol
	this.selectedGraphicLayer = new esri.layers.GraphicsLayer({id:"selectedGraphicLayer",opacity:1});
	this.selectedGraphicLayer.visible = true;

	this.measureGraphic = new esri.Graphic();
	this.measureGraphicLayer = new esri.layers.GraphicsLayer({id:"measureGraphicLayer",opacity:1});
	this.measureGraphicLayer.visible = true;

	editBar = new esri.toolbars.Edit(this._map);
	drawBar = new esri.toolbars.Draw(this._map);

	this.defaultPolygonSymbol = new esri.symbol.SimpleFillSymbol();
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
	* 根据layerid获取layerinfo
	**/
	getLayerInfo:function(id){
		return this._map.getLayer(id).layerInfos;
	},

	/**
	* 根据id删除图层
	* @arg1 id
	**/
	deleteLayer:function(id,type){
		this._map.removeLayer(this._map.getLayer(id));
	},

	/**
	* 显示或者隐藏图层
	**/
	setLayerVisibility:function(id,isVisible){
		if(isVisible){
			this._map.getLayer(id).show();
			return;
		}
		this._map.getLayer(id).hide();
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
			point.setSpatialReference(this._map.spatialReference);
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
			point.setSpatialReference(this._map.spatialReference);
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
			point.setSpatialReference(this._map.spatialReference);
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
	* @arg1 lon: 经度
	* @arg2 lat: 纬度
	* @arg3 id: 点id
	* @arg4 symbol: 点渲染器 optional
	* @arg5 spatialreference: 空间参考 optional 若为空,默认为当前地图的空间参考
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
		graphic.id = point._id;
		graphic.formerSymbol = point._formerSymbol;
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
				point = new Point(obj[i].lon,obj[i].lat,this._map.spatialReference,obj[i].id);
			}
			if(symbol){
				point.setSymbol(this.param.symbol);
			}	
			graphic = new esri.Graphic(point._point,point._symbol);
			graphic.id = point._id;
			graphic.formerSymbol = point._formerSymbol;
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
		graphic.id = point._id;
		graphic.formerSymbol = point._formerSymbol;
		this.param.map.graphics.add(graphic);
		//console.log(graphic);
	},

	/**
	* 打开地图上单击添加点事件
	* @arg1 id 线的id
	* @arg2 symbol, 点的symbol
	* @arg3 spatialreference 参考系: optional
	**/
	startAddPoint:function(id,symbol,spatialreference){
		var param = new Object();
		param.id = id;
		param.symbol = symbol;
		param.spatialreference = spatialreference;
		param.map = this._map;

		this.mapOnClickHandler = dojo.connect(this._map,"onClick",{"param":param},this.drawPointByClick);
	},

	/**
	* 结束地图上单击添加点事件
	**/
	stopAddPoint:function() {
		dojo.disconnect(this.mapOnClickHandler);
		this.mapOnClickHandler = new Object();
	},

	/**
	* 开始在地图上选graphic
	**/
	startSelectGraphic:function() {
		//dojo.disconnect(mapOnClickHandler);
		var param = new Object();
		param.esrimap = this;
		param.map = this._map;
		this.graphicSelecteOnClickHandler = dojo.connect(this._map.graphics,"onClick",{"param":param},this.selectGraphicByClick);
	},

	/**
	* 点击选中graphic，graphic包括所有添加在graphiclayer上的点线面
	* 返回点的id
	**/
	selectGraphicByClick:function(evt){
		//console.log(evt);
		if(this.param.map.getLayer("selectedGraphicLayer")==undefined){
			this.param.esrimap.selectedGraphicLayer.spatialReference = this.param.map.spatialReference;
			this.param.esrimap.selectedGraphicLayer.visible = true;
			this.param.map.addLayer(this.param.esrimap.selectedGraphicLayer);
		}
		this.param.esrimap.selectedGraphicLayer.clear();
		switch(evt.graphic.geometry.type){
			case "point":
				//同样的位子再打一个点标示选中
				this.param.esrimap.selectedGraphic.geometry = evt.graphic.geometry;
				this.param.esrimap.selectedGraphic.id = evt.graphic.geometry.id;
				this.param.esrimap.selectedGraphic.symbol = this.param.esrimap.selectedPointSymbol;
				this.param.esrimap.selectedGraphicLayer.add(this.param.esrimap.selectedGraphic);
				this.param.esrimap.selectedGraphicLayer.redraw();
				break;
			case "polyline": 
				this.param.esrimap.selectedGraphic.geometry = evt.graphic.geometry;
				this.param.esrimap.selectedGraphic.id = evt.graphic.geometry.id;
				this.param.esrimap.selectedGraphic.symbol = this.param.esrimap.selectedPolylineSymbol;
				this.param.esrimap.selectedGraphicLayer.add(this.param.esrimap.selectedGraphic);
				this.param.esrimap.selectedGraphicLayer.redraw();
				break;
			case "polygon": 
				this.param.esrimap.selectedGraphic.geometry = evt.graphic.geometry;
				this.param.esrimap.selectedGraphic.id = evt.graphic.geometry.id;
				this.param.esrimap.selectedGraphic.symbol = this.param.esrimap.selectedPolygonSymbol;
				this.param.esrimap.selectedGraphicLayer.add(this.param.esrimap.selectedGraphic);
				this.param.esrimap.selectedGraphicLayer.redraw();
				break;
		}
		return evt.graphic.id;
	},

	/**
	* 停止在地图上选点
	**/
	stopSelectGraphic:function(){
		//this.selectedGraphicLayer.hide();
		//this._map.graphics.hide();
		this.selectedGraphicLayer.clear();
		this.selectedGraphicLayer.redraw();
		this._map.removeLayer(this.selectedGraphicLayer);
		//this.selectedGraphic =  new esri.Graphic();
		dojo.disconnect(this.graphicSelecteOnClickHandler);
		this.graphicSelecteOnClickHandler = new Object();
	},

	selectGraphicByGeometry:function(geometry){
		if(this._map.getLayer("selectedGraphicLayer")==undefined){
			this.selectedGraphicLayer.spatialReference = this._map.spatialReference;
			this.selectedGraphicLayer.visible = true;
			this._map.addLayer(this.selectedGraphicLayer);
		}
		this.selectedGraphicLayer.clear();
		switch(geometry.type){
			case "point": 
				this.selectedGraphic.geometry = geometry;
				this.selectedGraphic.id = "selectedGraphic";
				this.selectedGraphic.symbol = this.selectedPointSymbol;
				this.selectedGraphicLayer.add(this.selectedGraphic);
				this.selectedGraphicLayer.redraw();
				break;
			case "polyline": 
				this.selectedGraphic.geometry = geometry;
				this.selectedGraphic.id = "selectedGraphic";
				this.selectedGraphic.symbol = this.selectedPolylineSymbol;
				this.selectedGraphicLayer.add(this.selectedGraphic);
				this.selectedGraphicLayer.redraw();
				break;
			case "polygon": 
				this.selectedGraphic.geometry = geometry;
				this.selectedGraphic.id = "selectedGraphic";
				this.selectedGraphic.symbol = this.selectedPolygonSymbol;
				this.selectedGraphicLayer.add(this.selectedGraphic);
				this.selectedGraphicLayer.redraw();
				break;
		};
	},

	selectGraphicById:function(id){
		if(this._map.getLayer("selectedGraphicLayer")==undefined){
			this.selectedGraphicLayer.spatialReference = this._map.spatialReference;
			this.selectedGraphicLayer.visible = true;
			this._map.addLayer(this.selectedGraphicLayer);
		}
		this.selectedGraphicLayer.clear();
		var loop = this._map.graphics.graphics.length;
		
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.id==id){
				switch(this._map.graphics.graphics[i].geometry.type){
					case "point":
						//同样的位子再打一个点标示选中
						this.selectedGraphic.geometry = this._map.graphics.graphics[i].geometry;
						this.selectedGraphic.id = this._map.graphics.graphics[i].geometry.id;
						this.selectedGraphic.symbol = this.selectedPointSymbol;
						this.selectedGraphicLayer.add(this.selectedGraphic);
						this.selectedGraphicLayer.redraw();
						break;
					case "polyline":
						this.selectedGraphic.geometry = this._map.graphics.graphics[i].geometry;
						this.selectedGraphic.id = this._map.graphics.graphics[i].geometry.id;
						this.selectedGraphic.symbol = this.selectedPolylineSymbol;
						this.selectedGraphicLayer.add(this.selectedGraphic);
						this.selectedGraphicLayer.redraw();
						break;
					case "polygon":
						this.selectedGraphic.geometry = this._map.graphics.graphics[i].geometry;
						this.selectedGraphic.id = this._map.graphics.graphics[i].geometry.id;
						this.selectedGraphic.symbol = this.selectedPolygonSymbol;
						this.selectedGraphicLayer.add(this.selectedGraphic);
						this.selectedGraphicLayer.redraw();
						break;
				}
				break;
			}
		};
	},

	clearSelectedGraphic:function() {
		this.selectedGraphicLayer.clear();
		this.selectedGraphicLayer.redraw();
		this._map.removeLayer(this.selectedGraphicLayer);
	},

	/**
	* 开始在地图上删除graphic
	**/
	startDeleteGraphic:function(){
		var param = new Object();
		//dojo.disconnect(mapOnClickHandler);
		param.esrimap = this;
		//this._map.addLayer(this.selectedGraphicLayer);
		param.map = this._map;
		this.graphicDeleteOnClickHander = dojo.connect(this._map.graphics,"onClick",{"param":param},this.deleteGraphicByClick);
	},

	deleteGraphicByClick:function(evt){
		switch(evt.graphic.geometry.type){
			case "point":
				this.param.map.graphics.remove(evt.graphic);
				if(evt.graphic.isArrow){
					this.param.map.graphics.remove(evt.graphic.connectedGraphic);
				}
				break;
			case "polyline":
				if(evt.graphic._isArrow){
					this.param.map.graphics.remove(evt.graphic.connectedGraphic);
				}
				this.param.map.graphics.remove(evt.graphic);
				break;
			case "polygon":
				this.param.map.graphics.remove(evt.graphic);
				break;
		}
		
	},

	/**
	* 通过id来删除graphic
	* @arg1 id
	**/
	deleteGraphicById:function(id){
		var loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.id==id){
				var graphic = this._map.graphics.graphics[i];
				if(this._map.graphics.graphics[i]._isArrow){
					this._map.graphics.remove(graphic.connectedGraphic);
				}
				this._map.graphics.remove(graphic);
				return true;
			}
		};
		console.log("没有id为" + id + "的graphic");
		return false;
	},

	/**
	* 结束在地图上删除graphic
	**/
	stopDeleteGraphic:function(){
		dojo.disconnect(this.graphicDeleteOnClickHander);
		this.graphicDeleteOnClickHander = new Object();
	},

	/**
	* 删除所有的graphic
	* @type graphic的类型:optional
	**/
	clearGraphic:function(type){
		var loop=0;
		var gra = new Array();
		switch(type){
			case "point": 
				loop = this._map.graphics.graphics.length;
				for (var i=0;i<loop;i++){
					if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="point"){
						if(this._map.graphics.graphics[i].isArrow){
							continue;
						}
						this._map.graphics.remove((this._map.graphics.graphics[i]));
						loop--;
						i--;
					}
				};
				break;
			case "polyline":
				loop = this._map.graphics.graphics.length;
				for (var i=0;i<loop;i++){
					if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="polyline"){
						this._map.graphics.remove((this._map.graphics.graphics[i]));
						if(this._map.graphics.graphics[i]._isArrow){
							this._map.graphics.remove(this._map.graphics.graphics[i].connectedGraphic);
						}
						loop--;
						i--;
					}
				};
				break;
			case "polygon": 
				loop = this._map.graphics.graphics.length;
				for (var i=0;i<loop;i++){
					if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="polygon"){
						this._map.graphics.remove((this._map.graphics.graphics[i]));
						loop--;
						i--;
					}
				};
				break;
		}
	},

	/**
	* 在地图上添加线函数
	* 说明: symbol中可以设置线颜色，线宽度，线类型
	* @arg1 id: 线id
	* @arg2 coordinates: 线的坐标
	* @arg3 symbol
	* @arg4 isArrow: 是否要添加箭头
	* @arg5 arrowSize: 箭头的大小
	* @arg6 arrowPosition: 箭头的位置 1起始处添加,2中间添加,3结尾处添加
	* @arg7 spatialreference
	**/
	addPolyline:function(id,coordinates,symbol,isArrow,arrowColor,arrowPosition,spatialreference){
		var line = new Polyline(id,coordinates,symbol,spatialreference);
		if(spatialreference){
			line.setSpatialReference(this._map.spatialReference);
		}
		var graphic = new esri.Graphic(line._line,line._symbol);
		graphic.id = line._id;
		if(isArrow){
			line._isArrow = isArrow;
			line._arrowPosition = arrowPosition;
			line._line._arrowPosition = arrowPosition;
			graphic._isArrow = isArrow;
			graphic._arrowSize = line._arrowSize;
			graphic._arrowPosition = line._arrowPosition;
			//设置箭头的位置
			var arrowPoint = line._line.getPoint(0,1);
			switch(arrowPosition){
				case 1:
					arrowPoint = line._line.getPoint(0,0); //获得线的第一个点
					arrowPoint.setSpatialReference = this._map.spatialReference;
					break;
				case 2:
					var start = line._line.getPoint(0,0);
					var end = line._line.getPoint(0,1); 
					var lon = (start.x + end.x)/2;
					var lat = (start.y + end.y)/2;
					arrowPoint = new esri.geometry.Point(lon,lat);
					arrowPoint.setSpatialReference = this._map.spatialReference;
					break;
				case 3:
					arrowPoint = line._line.getPoint(0,1); //获得线的最后一个点
					arrowPoint.setSpatialReference = this._map.spatialReference;
					break;
			}

			var arrowGraphic;
			//画箭头
			if(arrowColor){
				arrowGraphic = this.createArrowGraphic(arrowPoint,graphic,arrowColor);
			} else {
				arrowGraphic = this.createArrowGraphic(arrowPoint,graphic,graphic.symbol.color);
			}
			arrowGraphic.id = graphic.id + "_arrow";
			graphic.connectedGraphic = arrowGraphic;
			this._map.graphics.add(arrowGraphic);
		}

		this._map.graphics.add(graphic);
		return line;
	},

	/**
	* 根据ID更改graphic的symbol
	**/
	changePointSymbol:function(id,symbol) {
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].id==id && this._map.graphics.graphics[i].geometry.type=="point") {
				this._map.graphics.graphics[i].formerSymbol = this._map.graphics.graphics[i].symbol;
				this._map.graphics.graphics[i].setSymbol(symbol);
				this._map.graphics.redraw();
				return this._map.graphics.graphics[i];
			}
		};
		console.log("没有id为" + id + "的点");
	},

	/**
	* 对于地图上的所有点，更新点到之前的样式
	**/
	backToFormerSymbol:function(){
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="point"){
				if(this._map.graphics.graphics[i].formerSymbol!=this._map.graphics.graphics[i].symbol){
					var tmp = this._map.graphics.graphics[i].symbol;
					this._map.graphics.graphics[i].setSymbol(this._map.graphics.graphics[i].formerSymbol);
					this._map.graphics.graphics[i].formerSymbol = tmp;
				}
			}
		};
		this._map.graphics.redraw();
	},

	/**
	* 更新点位置
	* @arg1 id
	* @arg2 lon: 新的经度
	* @arg3 lat: 新的纬度
	**/
	updatePoint:function(id,lon,lat){
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="point" && this._map.graphics.graphics[i].geometry.id==id){
				var tmp = esri.geometry.Point(this._map.graphics.graphics[i].geometry);
				tmp.update(lon,lat);
				//console.log(tmp);
				this._map.graphics.graphics[i].setGeometry(tmp);
				this._map.graphics.redraw();
				return this._map.graphics.graphics[i];
				break;
			}
		};
	},

	changePolylineSymbol:function(id,symbol,isArrow,arrowColor,arrowPosition){
		//首先找到那个graphic
		var destGraphic;
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].geometry.type=="polyline" && this._map.graphics.graphics[i].geometry.id==id){
				destGraphic = this._map.graphics.graphics[i];
				if(destGraphic.connectedGraphic){
					this._map.graphics.remove(destGraphic.connectedGraphic);
				}
				this._map.graphics.remove(destGraphic);
				if(symbol){
					destGraphic.symbol = symbol;
				}

				if(isArrow){
					destGraphic._isArrow = isArrow;
					//this._map.graphics.remove(destGraphic._arrowGraphic);
					if(arrowColor){
						destGraphic._arrowColor = arrowColor;
					} else {
						destGraphic._arrowColor = null;
					}
					if(arrowPosition){
						destGraphic._arrowPosition = arrowPosition;
					} else {
						destGraphic._arrowPosition = 1;
					}

					var line = this.addPolyline(id,destGraphic.geometry.paths,destGraphic.symbol,destGraphic._isArrow,destGraphic._arrowColor,destGraphic._arrowPosition,destGraphic.geometry.spatialReference);
					return line;
				} else {
					destGraphic._isArrow = false;
					//addPolyline:function(id,coordinates,symbol,isArrow,arrowColor,arrowPosition,spatialreference)
					var line = this.addPolyline(id,destGraphic.geometry.paths,destGraphic.symbol,destGraphic._isArrow,null,null,destGraphic.geometry.spatialReference);
					return line;
				}
			}
		}

		console.log("没有对应id的graphic");
	},

	/**
	* 在地图上添加Polygon
	* @arg1 id
	* @arg2 coordinates
	* @arg3 symbol
	* @arg3 spatialReference
	**/
	addPolygon:function(id,coordinates,symbol,spatialReference){
		var polygon = new Polygon(id,coordinates,symbol,spatialReference);
		if(!spatialReference){
			polygon.setSpatialReference(this._map.spatialReference);
		}
		var graphic = new esri.Graphic(polygon._polygon,polygon._symbol);
		graphic.id = polygon._id;
		this._map.graphics.add(graphic);
		return id;
	},

	/**
	* 更新Polygon
	* @arg1 id
	* @arg2 symbol
	**/
	updatePolygon:function(id,symbol){
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].id==id && this._map.graphics.graphics[i].geometry.type=="polygon"){
				this._map.graphics.graphics[i].setSymbol(symbol);
				return this._map.graphics.graphics[i];
			}
		};
		//this._map.graphics.redraw();
	},

	/**
	* 判断点是否在多边形内
	* @arg1 id：多变形id
	* @arg2 lat
	* @arg3
	**/ 
	containsPoint:function(id,lat,lon){
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].id==id && this._map.graphics.graphics[i].geometry.type=="polygon"){
				return this._map.graphics.graphics[i].geometry.contains(new esri.geometry.Point(lat,lon));
			}
		};
		return false;
	},

	/*
	* 开始移动点线面节点
	*/
	startEditMoveGraphic:function(){
		editingEnabled = true;
		this._map.graphics.on("click",function(evt) {
			evt.preventDefault();
			if(editingEnabled) {
				// switch(evt.graphic.geometry.type){
				// 	case "polyline":

				// 	case "polygon":

				// }
				var dif = 0
				if(evt.graphic.geometry.type=="polygon"){
					dif = 1
				}

				if(evt.graphic.geometry.type=="polygon" && evt.graphic.geometry.rings[0].length == (3+dif)){
					editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:false});
					isAllowedDeleteVertex = false;
				} else if(evt.graphic.geometry.type=="polyline"){
					editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:false,allowAddVertices:false});
					//editBar.activate(esri.toolbars.Edit.MOVE,evt.graphic);
					isAllowedDeleteVertex = false;
				} else {
					editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:true});
					isAllowedDeleteVertex = true;
				}

				//editBar.allowDeletevertices = false;
				editBar.on("vertex-delete",function(evt){
					if(evt.graphic.geometry.type=="polygon"){
						var ring = evt.graphic.geometry.rings[evt.vertexinfo.segmentIndex];
						if(ring.length == (3+dif) ) {
							editBar.deactivate();
							editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:false});
							isAllowedDeleteVertex = false;
							console.error("无法继续删除Vertext，Vertext少于构成Geometry必须的数量");
						}
					} else if(evt.graphic.geometry.type=="polyline"){
						var path = evt.graphic.geometry.paths[evt.vertexinfo.segmentIndex];
						if(path.length == (2+dif)){
							editBar.deactivate();
							editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:false,allowAddVertices:false});
							isAllowedDeleteVertex = false;
							console.error("无法继续删除Vertext，Vertext少于构成Geometry必须的数量");
						}
					}
				});

				editBar.on("vertex-add",function(evt){
					if(evt.graphic.geometry.type=="polygon"){
						var ring = evt.graphic.geometry.rings[evt.vertexinfo.segmentIndex];
						if(ring.length > (3+dif) ) {
							editBar.deactivate();
							editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:true});
							isAllowedDeleteVertex = true;
						}
					} else if(evt.graphic.geometry.type=="polyline"){
						var path = evt.graphic.geometry.paths[evt.vertexinfo.segmentIndex];
						if(path.length > 2+dif){
							editBar.deactivate();
							editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:true,allowAddVertices:false});
							isAllowedDeleteVertex = true;
						}
					}
					
				});

				editBar.on("graphic-move-start",function(evt){
					if(evt.graphic.geometry.type=="point" && evt.graphic.isArrow){
						//TODO
						//防止点击在箭头上
						//editBar.deactivate();
						editBar.refresh();
						//editBar.activate(esri.toolbars.Edit.EDIT_VERTICES|esri.toolbars.Edit.MOVE,evt.graphic,{allowDeleteVertices:isAllowedDeleteVertex});
					}
				});

				editBar.on("vertex-move-stop",function(evt) {
					var map = evt.target._map;
					if(evt.graphic.geometry.type=="polyline" && evt.graphic._isArrow) {
						//TODO 对于含箭头的polyline，在vertext移动以后，箭头也要跟着动
						map.graphics.remove(evt.graphic.connectedGraphic);
						var line = evt.graphic.geometry;
						var arrowPosition = evt.graphic._arrowPosition;
						var arrowPoint;
						switch(arrowPosition){
							case 1:
								arrowPoint = line.getPoint(0,0); //获得线的第一个点
								arrowPoint.setSpatialReference = map.spatialReference;
								break;
							case 2:
								var start = line.getPoint(0,0);
								var end = line.getPoint(0,1); 
								var lon = (start.x + end.x)/2;
								var lat = (start.y + end.y)/2;
								arrowPoint = new esri.geometry.Point(lon,lat);
								arrowPoint.setSpatialReference = map.spatialReference;
								break;
							case 3:
								arrowPoint = line.getPoint(0,1); //获得线的最后一个点
								arrowPoint.setSpatialReference = map.spatialReference;
								break;
						}

						var arrow = evt.graphic.connectedGraphic.geometry;
						arrow.update(arrowPoint.x,arrowPoint.y);
						var arrowsymbol = evt.graphic.connectedGraphic.symbol;

						var startPoint = line.getPoint(0,0);
        				var endPoint = line.getPoint(0,1);

        				var deltx = endPoint.x - startPoint.x;
        				var delty = endPoint.y - startPoint.y;
        				var delt = deltx/delty;

        				var angle = (Math.atan(delt)/Math.PI) * 180;


        				// if(delt < 0){
        				// 	angle = angle + 180;
        				// }
        				// if(deltx < 0 && delty > 0){
        				// 	angle = angle + 90;
        				// } else 
        				if(deltx > 0 && delty < 0){
        					angle = angle + 180;
        				} else if(deltx < 0 && delty < 0){
        					angle = angle + 180;
        				}

        				arrowsymbol.setAngle(angle);
        				var arrowGraphic = new esri.Graphic(arrow,arrowsymbol);
        				arrowGraphic.isArrow = true;
        				arrowGraphic.connectedGraphic = evt.graphic;
        				evt.graphic.connectedGraphic = arrowGraphic;

        				map.graphics.add(arrowGraphic);
					}
				});

			} else {
				editBar.deactivate();
			}
		});
	},

	/**
	* 结束移动点线面节点
	**/
	stopEditMoveGraphic:function(){
		editingEnabled = false;
		editBar.deactivate();
	},

	/**
	* 添加扇形
	**/
	addSection:function(id,lat,lon,startAngle,angle,radius,symbol) {
		var sector = new Sector(id,lat,lon,startAngle,angle,radius,symbol,this._map.spatialReference,30);
		sector.init();
		var graphicSector = new esri.Graphic(sector._polygon,sector._symbol);
		graphicSector.id = id;
		this._map.graphics.add(graphicSector);
		return sector;
	},

	/**
	* 更新扇形
	**/
	updateSection:function(id,startAngle,angle,radius,symbol){
		loop = this._map.graphics.graphics.length;
		for (var i=0;i<loop;i++){
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].id==id && this._map.graphics.graphics[i].geometry.type=="polygon" && this._map.graphics.graphics[i].geometry.circletype=="section"){
				var sec = this._map.graphics.graphics[i];
				var lat = sec.geometry.center[0];
				var lon = sec.geometry.center[1];
				this._map.graphics.remove(this._map.graphics.graphics[i]);
				var sector = this.addSection(id,lat,lon,startAngle,angle,radius,symbol);
				return sector;
			}
		};
		return null;
	},

	/**
	* 根据id获取点线面的所有点
	**/
	getGeometry:function(id) {
		loop = this._map.graphics.graphics.length;
		for(var i=0;i<loop;i++) {
			if(this._map.graphics.graphics[i] && this._map.graphics.graphics[i].id == id){
				switch(this._map.graphics.graphics[i].geometry.type){
					case "point":
						var result = new Array();
						result.push({"type":"point"});
						var points = new Array();
						points.push(this._map.graphics.graphics[i].geometry.x);
						points.push(this._map.graphics.graphics[i].geometry.y);
						result.push({"geometry":points});
						return result;
						break;
					case "polyline":
						var result = new Array();
						result.push({"type":"polyline"});
						var points = this._map.graphics.graphics[i].geometry.paths;
						result.push({"geometry":points});
						return result;
						break;
					case "polygon":
						var result = new Array();
						result.push({"type":"polygon"});
						var points = this._map.graphics.graphics[i].geometry.rings;
						result.push({"geometry":points});
						return result;
						break;
				}
			}
		}
		return null;
	},

	/**
	* 开始在地图上画面
	* @arg1 id
	* @arg2 画面的Symbol
	* @arg3 画面参数，activate的options参数: optional 具体参见https://developers.arcgis.com/javascript/3/jsapi/draw-amd.html
	**/
	startDrawPolygonByClick:function(id,symbol,options){

		var map = this._map;
		drawBar.activate(esri.toolbars.Draw.POLYGON,options);
		var polygonSymbol;
		if(symbol){
			polygonSymbol = symbol;
		} else {
			polygonSymbol = this.defaultPolygonSymbol;
		}

		drawBar.setFillSymbol(polygonSymbol);
		// if(pointsymbol){
		// 	this._toolbar.setMarkerSymbol(pointsymbol);
		// } else {
		// 	this._toolbar.setMarkerSymbol(esri.symbol.SimpleMarkerSymbol());
		// }

		if(this.drawEndHandler!=null){
			dojo.disconnect(this.drawEndHandler);
			this.drawEndHandler = null;
		}

		this.drawEndHandler = dojo.connect(drawBar,"onDrawEnd",{"map":map,"id":id},function (evt){
			var polygon = new esri.geometry.Polygon(evt.rings);
			var graphic = new esri.Graphic(polygon,polygonSymbol);
			graphic.id = id;
			// graphic.geometry = new esri.geometry.Polygon(graphic.rings);
			graphic.geometry.id = id;
    		map.graphics.add(graphic);
    		drawBar.deactivate();
		});
		// drawBar.on("draw-end",function(evt){
		// 	var graphic = new esri.Graphic(evt.geometry,polygonSymbol);
		// 	graphic.id = id;
		// 	graphic.geometry.id = id;
  //   		map.graphics.add(graphic);
  //   		drawBar.deactivate();
		// });
	},

	/**
	* 地图测距
	* @arg1 startPoint的coordinate
	* @arg2 endPoint的coordinate
	* @arg3 unint：计量单位
	**/
	measureLength:function(start,end,unit){
		var unitStr;
		if(unit == "METERS"){
			unitStr = esri.Units.METERS;
		} else {
			unitStr = esri.Units.KILOMETERS;
		}
		var startPoint = new esri.geometry.Point(start,this._map.spatialReference);
		var endPoint = new esri.geometry.Point(end,this._map.spatialReference);
		var points = new Array();
		points.push(startPoint);
		points.push(endPoint);
		var polyline = new esri.geometry.Polyline(this._map.spatialReference);
		polyline.addPath(points);
		var polylines = new Array();
		polylines.push(polyline);
		var length;
		if(this._map.spatialReference.isWebMercator()||this._map.spatialReference.wkid == "4326"){
			length = esri.geometry.geodesicLengths(polylines,unitStr);
		} else {
			length = esri.geometry.planarLength(polylines[0],unitStr);
		}
		return length[0];
	},

	/**
	* 仿百度地图测量距离
	* @arg1 距离单位
	**/
	startBDMeasureLengthClick:function(unit){
		if(this._map.getLayer("measureGraphicLayer")==undefined){
			this.measureGraphicLayer.spatialReference = this._map.spatialReference;
			this.measureGraphicLayer.visible = true;
			this._map.addLayer(this.measureGraphicLayer);
		}
		//this.measureGraphicLayer.clear();
		this.measureGraphicLayer.show();

		var self = this;

		//初始化测量图层事件
		if(this.measureGraphicLayerMouseOverHandler){
			dojo.disconnect(this.measureGraphicLayerMouseOverHandler);
			this.measureGraphicLayerMouseOverHandler = null;
		}
		if(this.measureGraphicLayerMouseOutHandler){
			dojo.disconnect(this.measureGraphicLayerMouseOutHandler);
			this.measureGraphicLayerMouseOutHandler = null;
		}

		if(this.mapMeasureLengthOnClickHandler){
			dojo.disconnect(this.mapMeasureLengthOnClickHandler);
			this.mapMeasureLengthOnClickHandler = null;
		}
		
		this.measureGraphicLayerMouseOverHandler = dojo.connect(this.measureGraphicLayer,"onMouseOver",{"self":self},function (evt){
			var graphic = evt.graphic;
            if (graphic.symbol.isClearBtn) {
                self._map.setMapCursor("pointer");
                graphic.getShape().on("click",function(){
                	self._map.setMapCursor("default");
                	self.measureGraphicLayer.remove(graphic);
                	self.measureGraphicLayer.remove(graphic.connectedGraphic);
                	for(var i in graphic.stopGraphics){
                		self.measureGraphicLayer.remove(graphic.stopGraphics[i]);
                	}
                	for(var j in graphic.textGraphics){
                		self.measureGraphicLayer.remove(graphic.textGraphics[j]);
                	}
                	self.measureGraphicLayer.redraw();
                });
            }
		});

		this.measureGraphicLayerMouseOutHandler = dojo.connect(this.measureGraphicLayer,"onMouseOut",{"self":self},function (evt){
			self._map.setMapCursor("default");
		});

		var stopPoints = new Array();
		var stopDistances = new Array();

		var stopGraphics = new Array();
		var textGraphics = new Array();

		var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,10,
                new esri.symbol.SimpleLineSymbol( esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new esri.Color("#DC143C"), 2),
                new esri.Color("#FFA500"));

		drawBar.deactivate();
		drawBar.activate(esri.toolbars.Draw.POLYLINE,{showTooltips: false});

		this.mapMeasureLengthOnClickHandler = dojo.connect(this._map,"onClick",{"self":self},function (evt) {
			var distance = 0;
            var stopPoint = evt.mapPoint;
            if (stopPoints.length > 0) {
                var startPoint = stopPoints[stopPoints.length - 1];
                distance = self.measureLength([startPoint.x,startPoint.y],[stopPoint.x,stopPoint.y],unit);
                 if (stopDistances.length > 0) {
                    distance += stopDistances[stopDistances.length - 1];
                 }
                stopDistances.push(distance);
            }
            stopPoints.push(stopPoint);
            var stopGraphic = new esri.Graphic(stopPoint,markerSymbol);
            var textGraphic = self.createTextSymbolGraphic(stopPoint,distance);
            self.measureGraphicLayer.add(stopGraphic);
            stopGraphics.push(stopGraphic);
            self.measureGraphicLayer.add(textGraphic);
            textGraphics.push(textGraphic);
            self.measureGraphicLayer.redraw();
		});

		if(this.drawEndHandler!=undefined){
			dojo.disconnect(this.drawEndHandler);
			this.drawEndHandler = null;
		}
		this.drawEndHandler = dojo.connect(drawBar,"onDrawEnd",{"self":self},function (geometry){
			var endPoint = stopPoints[stopPoints.length - 1];
			var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color("#FFA500"));
			lineSymbol.setWidth(2);
			var lineGraphic = new esri.Graphic(geometry,lineSymbol);
			var clearGraphic = self.createClearBtn(endPoint,lineGraphic,stopGraphics,textGraphics);
			var deltx = endPoint.x - stopPoints[stopPoints.length-2].x;
			if(deltx < 0){
				clearGraphic.symbol.setOffset(-20,0);//改变清空图标位置
			} else {
				clearGraphic.symbol.setOffset(20,0);//改变清空图标位置
			}
			
			self.measureGraphicLayer.add(clearGraphic);
            self.measureGraphicLayer.add(lineGraphic);
            lineGraphic.getDojoShape().moveToBack();
            self.measureGraphicLayer.redraw();
            drawBar.deactivate();
            dojo.disconnect(self.mapMeasureLengthOnClickHandler);
            self.mapMeasureLengthOnClickHandler = null;
		});
	},

	/**
	* create text symbol
	**/
	createTextSymbolGraphic:function(point,distance){
		var text = "";
		if(distance > 0){
			text = distance.toFixed(2) + "";
		} else {
			text = "起点";
		}
		var fontColor = new esri.Color("#696969");
        var holoColor = new esri.Color("#fff");
        var font = new esri.symbol.Font("10pt", esri.symbol.Font.STYLE_ITALIC, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, "Courier");
        var textSymbol = new esri.symbol.TextSymbol(text,font,fontColor);
        textSymbol.setOffset(10, 10).setHaloColor(holoColor).setHaloSize(2);
        textSymbol.setAlign(esri.symbol.TextSymbol.ALIGN_MIDDLE);

        return new esri.Graphic(point,textSymbol);
	},

	createClearBtn:function(point,connectedGraphic,stopGraphics,textGraphics){
		var iconPath = "M13.618,2.397 C10.513,-0.708 5.482,-0.713 2.383,2.386 C-0.718,5.488 -0.715,10.517 2.392,13.622 C5.497,16.727 10.529,16.731 13.627,13.632 C16.727,10.533 16.724,5.502 13.618,2.397 L13.618,2.397 Z M9.615,11.351 L7.927,9.663 L6.239,11.351 C5.55,12.04 5.032,12.64 4.21,11.819 C3.39,10.998 3.987,10.48 4.679,9.79 L6.367,8.103 L4.679,6.415 C3.989,5.726 3.39,5.208 4.21,4.386 C5.032,3.566 5.55,4.165 6.239,4.855 L7.927,6.541 L9.615,4.855 C10.305,4.166 10.82,3.565 11.642,4.386 C12.464,5.208 11.865,5.726 11.175,6.415 L9.487,8.102 L11.175,9.789 C11.864,10.48 12.464,10.998 11.642,11.819 C10.822,12.64 10.305,12.04 9.615,11.351 L9.615,11.351 Z";
        var iconColor = "#b81b1b";
        var clearSymbol = new esri.symbol.SimpleMarkerSymbol();
        //clearSymbol.setOffset(-40, 15);
        clearSymbol.setPath(iconPath);
        clearSymbol.setColor(new esri.Color(iconColor));
        clearSymbol.setOutline(null);
        clearSymbol.isClearBtn = true;
        
        // var connectedLine = connectedGraphic.geometry;
        // var point1 = connectedLine.paths[0][(connectedLine.paths[0].length-2)];
        // var point2 = connectedLine.paths[0][(connectedLine.paths[0].length-1)];
        // var deltx = point2[0] - point1[0];
        // var delty = point2[1] - point1[1];
        // if(deltx >= 0){
        // 	deltx = deltx + 5;
        // } else {
        // 	deltx = deltx - 5;
        // }

        // if(delty >= 0){
        // 	delty = delty + 5;
        // } else {
        // 	delty = delty - 5;
        // }

        //point.update(point1[0]+deltx,point1[1]+delty);
        var graphic = esri.Graphic(point,clearSymbol);

        graphic.connectedGraphic = connectedGraphic;
        graphic.stopGraphics = stopGraphics;
        graphic.textGraphics = textGraphics;
        return graphic;
	},

	createArrowGraphic:function(point,connectedGraphic,arrowColor){
		//var iconPath = "M13.618,2.397 C10.513,-0.708 5.482,-0.713 2.383,2.386 C-0.718,5.488 -0.715,10.517 2.392,13.622 C5.497,16.727 10.529,16.731 13.627,13.632 C16.727,10.533 16.724,5.502 13.618,2.397 L13.618,2.397 Z M9.615,11.351 L7.927,9.663 L6.239,11.351 C5.55,12.04 5.032,12.64 4.21,11.819 C3.39,10.998 3.987,10.48 4.679,9.79 L6.367,8.103 L4.679,6.415 C3.989,5.726 3.39,5.208 4.21,4.386 C5.032,3.566 5.55,4.165 6.239,4.855 L7.927,6.541 L9.615,4.855 C10.305,4.166 10.82,3.565 11.642,4.386 C12.464,5.208 11.865,5.726 11.175,6.415 L9.487,8.102 L11.175,9.789 C11.864,10.48 12.464,10.998 11.642,11.819 C10.822,12.64 10.305,12.04 9.615,11.351 L9.615,11.351 Z";
        //var iconPath = "M2,2 L2,11 L10,6 L2,2";
        var iconPath = "M0,10 L5,0 L10,10 Z";
        var iconColor = "#b81b1b";
        if(arrowColor){
        	iconColor = arrowColor;
        }
        var line = connectedGraphic.geometry;
        var startPoint = line.paths[0][0];
        var endPoint = line.paths[0][1];

        var deltx = endPoint[0] - startPoint[0];
        var delty = endPoint[1] - startPoint[1];
        var delt = deltx/delty;

        var angle = (Math.atan(delt)/Math.PI) * 180;

        var symbol = new esri.symbol.SimpleMarkerSymbol();

        if(deltx > 0 && delty < 0){
        	angle = angle + 180;
        } else if(deltx < 0 && delty < 0){
        	angle = angle + 180;
        }

        symbol.setAngle(angle);
        //symbol.setOffset(3,-1);
        symbol.setOutline(null);
        symbol.setPath(iconPath);
        symbol.setColor(new esri.Color(iconColor));
        symbol.isArrow = true;
        var graphic = esri.Graphic(point,symbol);
        graphic.isArrow = true;
        graphic.connectedGraphic = connectedGraphic;
        return graphic;
	},

	/**
	* 开始地图点击交互测距
	**/
	startMeasureLengthClick:function(symbol,unit){
		drawBar.activate(esri.toolbars.Draw.POLYLINE,{showTooltips: false});
		var unitStr;
		if(unit == "METERS"){
			unitStr = esri.Units.METERS;
		} else {
			unitStr = esri.Units.KILOMETERS;
		}
		var lineSymbol;
		if(symbol){
			lineSymbol = symbol;
		} else {
			lineSymbol = new esri.symbol.SimpleLineSymbol();
		}

		if(this._map.getLayer("measureGraphicLayer")==undefined){
			this.measureGraphicLayer.spatialReference = this._map.spatialReference;
			this.measureGraphicLayer.visible = true;
			this._map.addLayer(this.measureGraphicLayer);
		}
		var map = this;
		//this.measureGraphicLayer.clear();
		this.measureGraphicLayer.show();
		drawBar.on("draw-end",function(evt) {
			if(map._map.spatialReference.isWebMercator()||map._map.spatialReference.wkid=="4326"){
				var graphic = new esri.Graphic(evt.geometry,lineSymbol);
				graphic.id = id;
				graphic.geometry.id = id;
    			map.measureGraphicLayer.add(graphic);
    			map.measureGraphicLayer.redraw();
    			map.measureGraphic = graphic;
    			drawBar.deactivate();
    			var paths = graphic.geometry.paths;
    			var startPoint = new esri.geometry.Point(map._map.spatialReference);
    			var endPoint = new esri.geometry.Point(map._map.spatialReference);
    			var polylines = new Array();
    			for(var i in paths){
    				var path = paths[i];
    				for(var j=0;j<path.length-1;j++) {
    					startPoint.x = path[j][0];
    					startPoint.y = path[j][1];
    					endPoint.x = path[j+1][0];
    					endPoint.y = path[j+1][1];
    					var polyline = new esri.geometry.Polyline(map._map.spatialReference);
    					var points = new Array();
    					points.push(startPoint);
    					points.push(endPoint);
    					polyline.addPath(points);
    					polylines.push(polyline);
    					//length += esri.geometry.getLength(startPoint,endPoint);
    				}
    			}
    			polylines.push(evt.geometry);
    			var length = esri.geometry.geodesicLengths(polylines,unitStr);
    			console.log(length);
    			return;
			} else {
				var length = new Array();
				var paths = graphic.geometry.paths;
				var startPoint = new esri.geometry.Point(map._map.spatialReference);
    			var endPoint = new esri.geometry.Point(map._map.spatialReference);
				for(var i in paths){
					var path = paths[i];
					for(var j=0;j<path.length-1;j++){
						startPoint.x = path[j][0];
    					startPoint.y = path[j][1];
    					endPoint.x = path[j+1][0];
    					endPoint.y = path[j+1][1];
    					var polyline = new esri.geometry.Polyline(map._map.spatialReference);
    					var points = new Array();
    					points.push(startPoint);
    					points.push(endPoint);
    					polyline.addPath(points);
    					length.push(esri.geometry.planarLength(polyline,unitStr));
					}
				}
				length.push(esri.geometry.planarLength(evt.geometry,unitStr));
				console.log(length);
				return;
			}
		});
	},

	/**
	* 结束点击交互测距
	**/
	stopMeasureLengthClick:function(){
		if(this.drawEndHandler!=undefined){
			dojo.disconnect(this.drawEndHandler);
		}
		dojo.disconnect(this.measureGraphicLayerMouseOverHandler);
		dojo.disconnect(this.measureGraphicLayerMouseOutHandler);
		dojo.disconnect(this.mapMeasureLengthOnClickHandler);
		this.measureGraphicLayerMouseOutHandler = null;
		this.measureGraphicLayerMouseOverHandler = null;
		this.drawEndHandler = null;
		this.mapMeasureLengthOnClickHandler = null;
		this.measureGraphicLayer.clear();
		this.measureGraphicLayer.redraw();
		this._map.removeLayer(this.measureGraphicLayer);
		drawBar.deactivate();
	},

	/**
	* 开始框选
	* @arg1 type
	**/
	startSelectByExtenx:function(type){

		if(this._map.getLayer("selectedGraphicLayer")==undefined){
			this.selectedGraphicLayer.spatialReference = this._map.spatialReference;
			this.selectedGraphicLayer.visible = true;
			this._map.addLayer(this.selectedGraphicLayer);
		}

		this.selectedGraphicLayer.clear();

		if(this.drawEndHandler){
			dojo.disconnect(this.drawEndHandler);
			this.drawEndHandler = null;
		}

		var self = this;

		var selectType;

		if(type){
			selectType = type;
		} else {
			selectType = "rectangle";
		}

		switch(selectType){
			case "rectangle":
				drawBar.activate(esri.toolbars.Draw.RECTANGLE);
				break;
			case "polygon":
				drawBar.activate(esri.toolbars.Draw.POLYGON);
				break;
			case "circle":
				drawBar.activate(esri.toolbars.Draw.CIRCLE);
				break;
			default:
				console.error("Not Support This Type");
				return null;
		}

		require(["esri/geometry/geometryEngine"],function(geometryEngine){
			this.drawEndHandler = dojo.connect(drawBar,"onDrawEnd",{"self":self},function (evt){
					drawBar.deactivate();
					var geometry = evt;
					loop = self._map.graphics.graphics.length;
					for(var i=0;i<loop;i++){
						if(self._map.graphics.graphics[i].geometry){
							var geo = self._map.graphics.graphics[i].geometry;
							if(geo.type=="polygon" && (!geometryEngine.disjoint(geometry,geo))){
									var selected = new esri.Graphic();
									selected.geometry = geo;
									selected.id = geo.id;
									selected.symbol = self.selectedPolygonSymbol
									self.selectedGraphicLayer.add(selected);
							} else if(geo.type=="polyline"){
								if(geometryEngine.contains(geometry,geo)||(!geometryEngine.disjoint(geometry,geo))){
									var selected = new esri.Graphic();
									selected.geometry = geo;
									selected.id = geo.id;
									selected.symbol = self.selectedPolylineSymbol;
									self.selectedGraphicLayer.add(selected);
								}
							} else if(geo.type=="point"){
								if(geometryEngine.contains(geometry,geo)){
									var selected = new esri.Graphic();
									selected.geometry = geo;
									selected.id = geo.id;
									selected.symbol = self.selectedPointSymbol;
									self.selectedGraphicLayer.add(selected);
									//this.selectedGraphicLayer.redraw();
								}
							}
						}
					}
					self.selectedGraphicLayer.redraw();
				});
		});
	},

	/**
	* 结束框选
	**/
	stopSelectByExtenx:function(){
		this.selectedGraphicLayer.clear();
		this._map.removeLayer(this.selectedGraphicLayer);
		drawBar.deactivate();
		dojo.disconnect(this.drawEndHandler);
		this.drawEndHandler = null;
	},

	/**
	* FindTask
	* @arg1: url String,目标地图服务的url
	* @arg2: showResultFunc Function,获取请求结果的Function,Function形如Function(results),详见http://jshelp.thinkgis.cn/jssamples/find_map_datagrid.html
	* @arg3: layerIds Number[],指定搜索图层的id
	* @arg4: fields String[],指定的搜索字段
	* @arg5: searchText
	* @arg6: returnGeometry boolean,是否返回Geometry，默认为false
	**/
	doFindTask:function(url,showResultFunc,layerIds,fields,searchText,returnGeometry){
		var isReturn = false;
		if(returnGeometry){
			isReturn = true;
		}
		var findParamter = new esri.tasks.FindParameters();
		findParamter.returnGeometry = isReturn;
		if(layerIds){
			findParamter.layerIds = layerIds;
		}
		if(fields){
			findParamter.searchFields = fields;
		}
		findParamter.searchText = searchText;
		findParamter.outSpatialReference = this._map.spatialReference;

		var findTask = new esri.tasks.FindTask(url);
		findTask.execute(findParamter,showResultFunc);
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
	this._point.id = id;
	this._symbol = new esri.symbol.SimpleMarkerSymbol();
	this._formerSymbol = new esri.symbol.SimpleMarkerSymbol();
	this._id = id;
}

Point.prototype = {

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
	},

	setSpatialReference:function(spatialreference){
		this._point.setSpatialReference(spatialreference);
	},

	/**
	* 更改至原先的Symbol
	**/
	backSymbol:function(){
		var tmp = this._symbol;
		this._symbol = this._formerSymbol;
		this._formerSymbol = this._symbol;
	}
}

/**
* 封装Polyline类
* @arg1: id
* @arg2: coordinates 坐标点的array，形如[[-50, 0], [-120, -20], [-130, 0]]
* @arg3: lineSymbol 线渲染器
* @arg4: spatialreference
**/
function Polyline(id,coordinates,symbol,spatialreference) {
	this._line = new esri.geometry.Polyline(coordinates);
	this._line.id = id;
	this._id = id;
	if(symbol){
		this._symbol = symbol;
	} else {
		this._symbol = new esri.symbol.SimpleLineSymbol();
		this._symbol.setWidth(3);
	}
	if(spatialreference){
		this._line.setSpatialReference(spatialreference);
	}
	this._isArrow = false;
	this._arrowSize = 0;
	this._arrowPosition = 1;
	this._line._arrowPosition = 1;
	this._arrowGraphic = null;
}

Polyline.prototype = {
	
	setSymbol:function(symbol){
		this._symbol = symbol;
	},

	setId:function(id){
		this._id = id;
	},

	setSpatialReference:function(spatialreference){
		this._line.setSpatialReference(spatialreference);
	}
}

function Polygon(id,coordinate,symbol,spatialReference){
	this._polygon = new esri.geometry.Polygon(coordinates);
	this._polygon.id = id;
	this._id = id;
	if(symbol){
		this._symbol = symbol;
	} else {
		this._symbol = new esri.symbol.SimpleFillSymbol();
	}
	if(spatialReference){
		this._polygon.spatialReference = spatialReference;
	}
}

Polygon.prototype = {

	setSymbol:function(symbol){
		this._symbol = symbol;
	},

	setId:function(id){
		this._id = id;
	},

	setSpatialReference:function(spatialReference){
		this._polygon.spatialReference = spatialReference;
	}
}

function Sector(id,lat,lon,startAngle,angle,radius,symbol,spatialReference,pointNum){
	this._id = id;
	if(symbol){
		this._symbol = symbol;
	} else {
		this._symbol = new esri.symbol.SimpleFillSymbol();
	}
	this._spatialReference = spatialReference;
	this._polygon = null;
	this._center = new Array();
	this._center.push(lat);
	this._center.push(lon);
	this._pointNum = pointNum;
	this._startAngle = startAngle;
	this._endAngle = startAngle + angle;
	this._radius = radius;
}

Sector.prototype = {
	init:function(){
		var sin;
		var cos;
		var x;
		var y;
		var angle;
		var points = new Array();
		points.push(this._center);
		for (var i = 0; i <= this._pointNum; i++) {
 			angle = this._startAngle + (this._endAngle - this._startAngle) * i / this._pointNum;
 			sin = Math.sin(angle * Math.PI / 180);
			cos = Math.cos(angle * Math.PI / 180);
			x = this._center[0] + this._radius * sin;
			y = this._center[1] + this._radius * cos;
			points.push([x,y]);
		}
		var point = points;
		point.push(this._center);
		var sector = {"rings": [point],"spatialReference":this._spatialReference};
		// sector.addRing(point);
		this._polygon = new esri.geometry.Polygon(sector);
		this._polygon.circletype = "section";
		this._polygon.center = this._center;
		this._polygon.id = this._id;
	},
	setSymbol:function(symbol){
		this._symbol = symbol;
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




