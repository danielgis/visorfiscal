define(['dojo/_base/declare', 'jimu/BaseWidget', 'dijit/_WidgetsInTemplateMixin', "esri/toolbars/draw", "esri/toolbars/edit", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 'dojo/_base/Color', "esri/layers/GraphicsLayer", "esri/geometry/Point", "jimu/LayerInfos/LayerInfos", "dojo/_base/lang", "esri/layers/FeatureLayer", "esri/tasks/QueryTask", "esri/tasks/query", "jimu/WidgetManager", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "esri/geometry/webMercatorUtils", "esri/tasks/Geoprocessor", 'esri/dijit/util/busyIndicator', "jimu/dijit/Message", "turf", "xlsx", "dojo/Deferred", "esri/symbols/TextSymbol", "esri/symbols/Font"], function (declare, BaseWidget, _WidgetsInTemplateMixin, Draw, Edit, Graphic, SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol, Color, GraphicsLayer, Point, LayerInfos, lang, FeatureLayer, QueryTask, Query, WidgetManager, geometryEngine, Polyline, webMercatorUtils, Geoprocessor, BusyIndicator, Message, turf, XLSX, Deferred, TextSymbol, Font) {
  // import 'core-js/stable'
  // import 'regenerator-runtime/runtime'


  // const dataRequestsToAttendCm = [
  //   {"case":"Reasignar","caseId":1,"cod_pre":"01-34-0017","estado":"por_atender","fec_solicitud":"10/11/2022", "id_solicitud":1},
  //   {"case":"Acumulación","caseId":2,"cod_pre":"01-34-0011,01-34-0012","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":2},
  //   {"case":"División","caseId":3,"cod_pre":"01-34-0010","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":3},
  //   {"case":"Inactivar","caseId":5,"cod_pre":"01-23-0036","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":5},
  //   {"case":"Reasignar","caseId":1,"cod_pre":"01-38-0010","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":6},
  //   {"case":"Acumulación","caseId":2,"cod_pre":"01-58-0004,01-58-0003","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":7},
  //   {"case":"División","caseId":3,"cod_pre":"01-12-0028","estado":"por_atender","fec_solicitud":"10/11/2022","id_solicitud":11},
  //   {"case":"Fusión","caseId":2,"cod_pre":"1376","estado":"obaservado","fec_solicitud":"10/11/2022","id_solicitud":8},
  //   {"case":"División","caseId":3,"cod_pre":"1376","estado":"observado","fec_solicitud":"10/11/2022","id_solicitud":9},
  //   {"case":"Inactivar","caseId":4,"cod_pre":"1376","estado":"atendido","fec_solicitud":"10/11/2022","id_solicitud":10}
  //   ]

  // const dataRequestsToAttendCm2 = {
  // 	"count":1,
  // 	"next":null,
  // 	"previous":null,
  // 	"results":[
  // 		{"type":"Reasignar","idType":1,"lands":[{"cup":"01-34-0017"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":1},
  // 		{"type":"Acumulación","idType":2,"lands":[{"cup":"01-34-0011"},{"cup":"01-34-0012"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":2},
  // 		{"type":"División","idType":3,"lands":[{"cup":"01-34-0010"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":3},
  // 		{"type":"Inactivar","idType":5,"lands":[{"cup":"01-23-0036"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":5},
  // 		{"type":"Reasignar","idType":1,"lands":[{"cup":"01-38-0010"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":6},
  // 		{"type":"Acumulación","idType":2,"lands":[{"cup":"01-58-0004"},{"cup":"01-58-0003"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":7},
  // 		{"type":"División","idType":3,"lands":[{"cup":"01-12-0028"}],"status":"Por atender","idStatus":1,"date":"2023-05-14T22:38:35.742809","id":11},
  // 		{"type":"Fusión","idType":2,"lands":[{"cup":"1376"}],"status":"Observado","idStatus":3,"date":"2023-05-14T22:38:35.742809","id":8},
  // 		{"type":"División","idType":3,"lands":[{"cup":"1376"}],"status":"Observado","idStatus":3,"date":"2023-05-14T22:38:35.742809","id":9},
  // 		{"type":"Inactivar","idType":4,"lands":[{"cup":"1376"}],"status":"Atendido","idStatus":2,"date":"2023-05-14T22:38:35.742809","id":10}
  // 	]
  // }


  // const dataByRequest = {
  //   "1": [{"cod_pre": "01-34-0017", "x": -79.739827, "y": -6.643564, "direccion": "Av. Los Jazmines 123", "num_alt": 567, "sec_eje": "Sección 1", "cod_cuc": "ABC123"}],
  //   "2": [
  //     {"cod_pre": "01-34-0011","x": -67.89,"y": -12,"direccion": "Calle Las Rosas 456","num_alt": 789,"sec_eje": "Sección 2","cod_cuc": "DEF456"}, 
  //     { "cod_pre": "01-34-0012", "x": 345.67, "y": 89.01, "direccion": "Jr. Los Girasoles 789", "num_alt": 234, "sec_eje": "Sección 3", "cod_cuc": "GHI789"},
  //   ],
  //   "3": [{"cod_pre": "01-34-0010","x": -67.89,"y": -12,"direccion": "Calle Las Rosas 456","num_alt": 789,"sec_eje": "Sección 2", "cod_cuc": "DEF456"}],
  //   "5": [{"cod_pre": "01-23-0036","x": -67.89,"y": -12,"direccion": "Jr. Los Girasoles 789","num_alt": 234,"sec_eje": "Sección 3","cod_cuc": "GHI789"}],
  //   "6": [{"cod_pre": "01-38-0010", "x": -79.739827, "y": -6.643564, "direccion": "Av. Los Jazmines 123", "num_alt": 567, "sec_eje": "Sección 1", "cod_cuc": "ABC123"}],
  //   "7": [
  //     {"cod_pre": "01-58-0004","x": -67.89,"y": -12,"direccion": "Calle Las Rosas 456","num_alt": 789,"sec_eje": "Sección 2","cod_cuc": "DEF456"}, 
  //     { "cod_pre": "01-58-0003", "x": 345.67, "y": 89.01, "direccion": "Jr. Los Girasoles 789", "num_alt": 234, "sec_eje": "Sección 3", "cod_cuc": "GHI789"},
  //   ],
  //   "11": [{"cod_pre": "01-12-0028","x": -67.89,"y": -12,"direccion": "Calle Las Rosas 456","num_alt": 789,"sec_eje": "Sección 2", "cod_cuc": "DEF456"}],
  // }

  // const dataByRequest2 = {
  //   "1": [
  //   	{"cpm": "01-34-0017", "streetName": "Av. Los Jazmines 123", "streetNameAlt": 567, "secEjec": "Sección 1", "codCuc": "ABC123"}
  //   ],
  //   "2": [
  //     {"cpm": "01-34-0011", "streetName": "Calle Las Rosas 456","streetNameAlt": 789,"secEjec": "Sección 2","codCuc": "DEF456"}, 
  //     { "cpm": "01-34-0012", "streetName": "Jr. Los Girasoles 789", "streetNameAlt": 234, "secEjec": "Sección 3", "codCuc": "GHI789"},
  //   ],
  //   "3": [
  //   	{"cpm": "01-34-0010", "streetName": "Calle Las Rosas 456","streetNameAlt": 789,"secEjec": "Sección 2", "codCuc": "DEF456"}
  //   ],
  //   "5": [
  //   	{"cpm": "01-23-0036", "streetName": "Jr. Los Girasoles 789","streetNameAlt": 234,"secEjec": "Sección 3","codCuc": "GHI789"}
  //   ],
  //   "6": [
  //   	{"cpm": "01-38-0010", "streetName": "Av. Los Jazmines 123", "streetNameAlt": 567, "secEjec": "Sección 1", "codCuc": "ABC123"}
  //   ],
  //   "7": [
  //     {"cpm": "01-58-0004", "streetName": "Calle Las Rosas 456","streetNameAlt": 789,"secEjec": "Sección 2","codCuc": "DEF456"}, 
  //     { "cpm": "01-58-0003", "streetName": "Jr. Los Girasoles 789", "streetNameAlt": 234, "secEjec": "Sección 3", "codCuc": "GHI789"},
  //   ],
  //   "11": [
  //   	{"cpm": "01-12-0028", "streetName": "Calle Las Rosas 456","streetNameAlt": 789,"secEjec": "Sección 2", "codCuc": "DEF456"}
  //   ],
  // }

  // const responseDivision = {
  //   "6": [
  //     {"cod_pre": "prueba-69", "direccion": "Calle Las Rosas 456 con av. Argentina 123"},
  //     {"cod_pre": "prueba-70", "direccion": "Calle Las Rosas 457 con av. Argentina 123"},
  //   ],
  //   "11": [
  //     {"cod_pre": "prueba-71", "direccion": "Calle Las Rosas 456 con av. Argentina 123"},
  //     {"cod_pre": "prueba-72", "direccion": "Calle Las Rosas 457 con av. Argentina 123"},
  //   ],
  //   "2": [
  //     {"cod_pre": "prueba-73", "direccion": "Calle Las Rosas 456 con av. Argentina 123"},
  //   ],
  //   "1": [
  //     {"cod_pre": "01-34-0017", "direccion": "Calle Las Rosas 456 con av. Argentina 123"},
  //   ],
  //   "5":[
  //     {"cod_pre": "01-23-0036", "direccion": "Calle Las Rosas 456 con av. Argentina 123"},
  //   ]
  // }


  var requestToAttendState = "por_atender";
  var requestsObservedState = "observado";
  var requestsAttendState = "atendido";

  // Layers ids
  var idLyrCatastroFiscal = "CARTO_FISCAL_6806";
  var idLyrCfPredios = "CARTO_FISCAL_6806_0";
  var idLyrCfLotes_pun = "CARTO_FISCAL_6806_1";
  var idLyrCfEje_vial = "CARTO_FISCAL_6806_2";
  var idLyrCfNumeracion = "CARTO_FISCAL_6806_3";
  var idLyrCfArancel = "CARTO_FISCAL_6806_4";
  var idLyrCfLotes = "CARTO_FISCAL_6806_5";
  var idLyrCfUnidadesurbanas = "CARTO_FISCAL_6806_6";
  var idLyrCfParques = "CARTO_FISCAL_6806_7";
  var idLyrCfManzana = "CARTO_FISCAL_6806_8";
  var idLyrCfSector = "CARTO_FISCAL_6806_9";
  var idLyrActpuntoimg = "ACTUALIZACION_DE_PUNTO_IMG_1890";
  var idLyrDistricts = "limites_nacional_1821_2";

  var iconByState = {
    "por_atender": { 'icon': 'fas fa-pencil-alt', 'id': 'editRequestsCm', 'desc': "Por atender" },
    "observado": { 'icon': 'fas fa-pause', 'id': 'obsRequestsCm', 'desc': "Observado" },
    "atendido": { 'icon': 'fas fa-check', 'id': 'goodRequestsCm', 'desc': "Atendido" }

    // Fields 
  };var _UBIGEO_FIELD = "UBIGEO";
  var _ID_LOTE_P_FIELD = "ID_LOTE_P";
  var _COD_MZN_FIELD = "COD_MZN";
  var _F_MZN_FIELD = "F_MZN";
  var _COD_SECT_FIELD = "COD_SECT";
  var _COD_PRE_FIELD = "COD_PRE";
  var _COD_LOTE_FIELD = "COD_LOTE";

  // const samplePdf = "https://www.africau.edu/images/default/sample.pdf"

  var toolbarCm = void 0;

  var params = new URLSearchParams(window.location.search);
  var paramsApp = {};

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = params.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      paramsApp[key] = params.get(key);
    }

    // console.log(paramsApp)
    // Styles
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var symbolPuntoLote = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 92, 230, 1]));

  var symbolFusionLote = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

  var symbolEliminarLote = new SimpleFillSymbol(SimpleFillSymbol.STYLE_DIAGONAL_CROSS, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([100, 100, 100]), 2), new Color([229, 229, 229, 0.9]));

  var symbolLoteSelected = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.75]), 4), new Color([0, 255, 0, 0]));

  var symbolDivisionLote = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2);

  var symbolPredio = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([235, 69, 95, 1]));

  var symbolPredioSelected = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 4), new Color([0, 255, 0, 0]));

  var symbolSnapPointCm = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));

  // Identificadores de graficos
  var idGraphicPredioCm = "graphicPredioCm2";
  var idGraphicPredioByDivison = "graphicPredioByDivison";
  var idGraphicPredioSelectedCm = "graphicPredioSelected";
  var idGraphicLoteCm = "graphicLoteCm";
  var idGraphicLoteSelectedCm = "graphicLoteSelectedCm";
  var idGraphicPuntoLote = "graphicPuntoLote";
  var idGraphicFrenteLote = "graphicFrenteLote";
  var idGraphicLineaDivision = "graphicLineaDivision";
  var idGraphicLoteDeleteCm = "graphicLoteDeleteCm";
  var idGraphicLabelLineaDivision = "graphicLabelLineaDivision";
  var idGraphicLabelCodLote = "graphicLabelCodLoteDivision";

  // symbol by case
  var symbolByCase = {
    "1": { "symbol": symbolPredio },
    "2": { "symbol": symbolPredio },
    "3": { "symbol": symbolPredio }

    // graphicsLayer main
  };var graphicLayerLineaDivision = new GraphicsLayer({
    id: idGraphicLineaDivision
  });

  var graphicLayerLabelLineaDivision = new GraphicsLayer({
    id: idGraphicLabelLineaDivision
  });

  // let graphicLayerLabelCodLoteDivision = new GraphicsLayer({
  //   id: idGraphicLabelCodLote,
  // });

  var graphicLayerPredioByDivison = new GraphicsLayer({
    id: idGraphicPredioByDivison
  });

  // To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'carto-maintenance-wgt',
    codRequestsCm: null,
    currentTabActive: null,
    layersMap: [],
    queryUbigeo: paramsApp['ubigeo'] ? _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\'' : "1=1",
    case: 0,
    caseDescription: '',
    lotesQuery: null,
    idlotes: null,
    arancel: null,
    codigosPredios: null,
    xy: [],
    idxLines: 0,
    idPredioDivision: '',
    idPredioAcumulacion: '',
    editToolbar: null,
    queryRequests: {
      ubigeo: paramsApp['ubigeo'],
      limit: 1000
    },

    postCreate: function postCreate() {
      this.inherited(arguments);
      console.log('CartoMaintenanceWgt::postCreate');
      this._getAllLayers();
      selfCm = this;
      this._filterByDistrictCm();
      this._startExtentByDistrictCm();
      esri.bundle.toolbars.draw.addPoint = esri.bundle.toolbars.draw.addPoint + "<br/>Pulsar <strong>CTRL</strong> para activar la alineación";
      esri.bundle.toolbars.draw.addShape = esri.bundle.toolbars.draw.addShape + "<br/>Pulsar <strong>CTRL</strong> para activar la alineación";
      esri.bundle.toolbars.draw.resume = esri.bundle.toolbars.draw.resume + "<br/>Pulsar <strong>CTRL</strong> para activar la alineación";
      esri.bundle.toolbars.draw.start = esri.bundle.toolbars.draw.start + "<br/>Pulsar <strong>CTRL</strong> para activar la alineación";
    },
    _getAllLayers: function _getAllLayers() {
      LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
        this.layersMap = layerInfosObj;
      }));
    },
    _showMessage: function _showMessage(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'message';

      var title = this.nls._widgetLabel + ': ' + type;
      switch (type) {
        case 'error':
          new Message({
            type: type,
            titleLabel: title,
            message: message
          });
          break;
        default:
          new Message({
            type: type,
            titleLabel: title,
            message: message
          });
          break;
      }
    },
    _showMessagePromise: function _showMessagePromise(messagetext) {
      var deferred = new Deferred();
      var message = new Message({
        message: messagetext,
        buttons: [{
          label: "Ok",
          onClick: function onClick() {
            deferred.resolve(true);
            message.hide();
          }
        }]
      });
      return deferred.promise;
    },
    _showMessageConfirm: function _showMessageConfirm() {
      var deferred = new Deferred();
      var mensaje = new Message({
        message: "¿Estás seguro de que deseas continuar?",
        type: "question",
        buttons: [{
          label: "Sí",
          onClick: function onClick() {
            deferred.resolve(true);
            mensaje.hide();
          }
        }, {
          label: "No",
          onClick: function onClick() {
            deferred.resolve(false);
            mensaje.hide();
          }
        }]
      });
      return deferred.promise;
    },
    _filterByDistrictCm: function _filterByDistrictCm() {
      // let queryUbigeo = `${_UBIGEO_FIELD} = '${paramsApp['ubigeo']}'`
      var queryPredios = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getFilter();
      queryPredios = queryPredios ? queryPredios + " AND " + selfCm.queryUbigeo : selfCm.queryUbigeo;
      selfCm.layersMap.getLayerInfoById(idLyrCfPredios).setFilter(queryPredios);
      selfCm.layersMap.getLayerInfoById(idLyrCfLotes_pun).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfEje_vial).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfNumeracion).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfArancel).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfLotes).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfUnidadesurbanas).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfParques).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfManzana).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfSector).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrActpuntoimg).setFilter(selfCm.queryUbigeo);
    },
    _startExtentByDistrictCm: function _startExtentByDistrictCm() {
      var query = new Query();
      query.where = selfCm.queryUbigeo;

      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrDistricts).getUrl());

      qTask.executeForExtent(query, function (results) {
        selfCm.map.setExtent(results.extent).then(function () {
          // get the next scale value from the current scale
          var homeWidget = WidgetManager.getInstance().getWidgetsByName("HomeButton");
          homeWidget[0].homeDijit.extent = selfCm.map.extent;
        });
      }, function (error) {
        console.log(error);
      });
    },
    startup: function startup() {
      this.inherited(arguments);
      console.log('CartoMaintenanceWgt::startup');

      this.busyIndicator = BusyIndicator.create({
        target: this.domNode.parentNode.parentNode,
        backgroundOpacity: 0
      });
    },
    _callApiRestServices: function _callApiRestServices(baseUrl, params) {
      var url = new URL(baseUrl);
      Object.keys(params).forEach(function (key) {
        return url.searchParams.append(key, params[key]);
      });

      return fetch(url).then(function (response) {
        if (!response) {
          selfCm.busyIndicator.hide();
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      }).catch(function (err) {
        selfCm.busyIndicator.hide();
        console.log("An error occurred while fetching the data.");
      });
    },
    _getRequestsTrayDataCm: function _getRequestsTrayDataCm(responseData, state) {
      // Reemplazar todo el metodo para capturar datos de servicio
      // let response = selfCm._fetchServices(selfCm.config.applicationListUrl, {'ubigeo': paramsApp['ubigeo']})
      // let response = selfCm._fetchServices(selfCm.config.applicationListUrl, {userId: 1})
      // console.log(response)
      var data = responseData.filter(function (i) {
        return i.status == state;
      });
      return data;
    },
    _loadIniRequestsCm: function _loadIniRequestsCm() {
      dojo.query('#' + requestToAttendState)[0].click();
    },
    _parseDateStringtoFormat: function _parseDateStringtoFormat(dateString) {
      var date = new Date(dateString);
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      return day + '/' + month + '/' + year;
    },
    _loadRequestsByEventCm: function _loadRequestsByEventCm(evt) {
      var params = {
        ubigeo: paramsApp['ubigeo']
      };
      var target = evt.target;
      selfCm._loadRequestsCm(params, target);
    },
    _loadDocSupportCm: function _loadDocSupportCm() {
      var urlStatusRequest = selfCm.config.applicationListUrl + '/' + selfCm.codRequestsCm;
      selfCm._callApiRestServices(urlStatusRequest, {}).then(function (result) {
        try {
          dojo.query("#showInfoDocCm")[0].value = result.support;
          // if (result.idStatus != 1){
          //   throw new Error(`Esta solicitud (${selfCm.codRequestsCm}) ya fue procesada con anterioridad: ${result.date}`)
          // }
          // selfCm.busyIndicator.show();
          // // Agregar un elemento de texto debajo del BusyIndicator
          // let buzyElm = dojo.query("#dojox_widget_Standby_0")[0]
          // let imgElm = buzyElm.querySelector("img")
          // let loadingText = document.createElement('div');
          // loadingText.id = 'loadingTextCustom';
          // loadingText.style.position = 'absolute';
          // let topMessage = parseFloat(imgElm.style.top) + 80;
          // loadingText.style.top = `${topMessage}px`;
          // let leftImg = parseFloat(imgElm.style.left) + imgElm.width/2;
          // loadingText.style.left = `${leftImg}px`;
          // loadingText.style.transform = 'translate(-50%, -50%)';
          // loadingText.style.background = 'white';
          // loadingText.style.zIndex = '1000';

          // dojo.query("#dojox_widget_Standby_0")[0].appendChild(loadingText);
          // // selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
          // selfCm.gp = new Geoprocessor(url);
          // selfCm.gp.submitJob(params, selfCm._completeCallback, selfCm._statusCallback);        
        } catch (error) {
          selfCm.busyIndicator.hide();
          selfCm._showMessage(error.message, type = "error");
        }
      });
    },
    _loadRequestsCm: function _loadRequestsCm(evt) {
      selfCm.busyIndicator.show();
      selfCm._callApiRestServices(selfCm.config.applicationListUrl, selfCm.queryRequests).then(function (response) {
        // ----------------------------------------------
        // comentar esta linea cuando se pase a produccion
        // response = dataRequestsToAttendCm2
        // ----------------------------------------------
        response = response['results'].slice(20);
        console.log(response);
        selfCm.currentTabActive = evt.target.id;
        var estado = iconByState[evt.target.id].desc;
        var data = selfCm._getRequestsTrayDataCm(response, estado);
        var dataHtml = data.map(function (i) {
          return '<tr>\n                                        <td>' + i.id + '</td>\n                                        <td>' + i.type + '</td>\n                                        <td>' + i.lands.map(function (lnd) {
            return lnd['cpm'];
          }).join(',') + '</td>\n                                        <td>' + selfCm._parseDateStringtoFormat(i.date) + '</td>\n                                        <td>\n                                          <button id="' + iconByState[evt.target.id].id + '" value="' + i.idType + '" class="stateRequestClsCm">\n                                            <i class="' + iconByState[evt.target.id].icon + '"></i>\n                                          </button>\n                                        </td>\n                                      </tr>';
        });
        var tbody = dojo.create('tbody', { innerHTML: dataHtml.join('') });
        var tb = dojo.query(".tableRequestClsCm")[0];
        if (tb.getElementsByTagName("tbody").length > 0) {
          selfCm.tableRequestApCm.removeChild(tb.getElementsByTagName("tbody")[0]);
        }
        selfCm.tableRequestApCm.appendChild(tbody);
        if (evt.target.id == requestToAttendState) {
          dojo.query(".stateRequestClsCm").on('click', selfCm._openFormCase);
        }
        if (evt.target.id == requestsAttendState) {
          dojo.query(".stateRequestClsCm").on('click', selfCm._openFormResult);
        }

        dojo.query(".tablinksCm").removeClass("active");
        evt.target.classList.add("active");
        selfCm.busyIndicator.hide();
      });
    },
    _zoomToPredSelectedEvt: function _zoomToPredSelectedEvt(evt) {
      var cod_pred = evt.currentTarget.children[0].innerHTML.split(': ')[1];
      selfCm._zoomToPredSelected(cod_pred);
    },
    _zoomToPredSelected: function _zoomToPredSelected(cod_pred) {
      selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
      // let cod_pred = evt.currentTarget.children[0].innerHTML.split(': ')[1]
      var prediosLayer = selfCm.layersMap.getLayerInfoById(idLyrCfPredios);
      var propertyLayer = new FeatureLayer(prediosLayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      // crear una consulta para seleccionar la fila deseada
      var query = new Query();
      query.where = _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\' and ' + _COD_PRE_FIELD + ' = \'' + cod_pred + '\'';
      // console.log(query.where)

      // propertyLayer.setSelectionSymbol(symbolPredioSelected);
      // seleccionar la fila
      propertyLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
        var featureSelected = new GraphicsLayer({
          id: idGraphicPredioSelectedCm
        });
        featureSelected.add(results[0]);
        selfCm.map.addLayer(featureSelected);
        selfCm.map.centerAt(results[0].geometry);

        // Parpadeo de seleccion
        var interval = setInterval(function () {
          if (featureSelected.graphics[0].symbol === symbolPredioSelected) {
            featureSelected.graphics[0].setSymbol(null);
          } else {
            featureSelected.graphics[0].setSymbol(symbolPredioSelected);
          }
        }, 200);
        setTimeout(function () {
          clearInterval(interval);
          selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
        }, 2000);
      });
    },
    _openSupportingDocument: function _openSupportingDocument(evt) {
      window.open(evt.currentTarget.value, '_blank').focus();
    },
    _zoomExtentToLote: function _zoomExtentToLote(cod_pre) {
      var query = new Query();

      query.where = _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\' and ' + _COD_PRE_FIELD + ' in (\'' + cod_pre.split(',').join("', '") + '\')';
      // console.log(query.where)
      // fields return
      query.outFields = [_ID_LOTE_P_FIELD, _COD_MZN_FIELD, _COD_SECT_FIELD];
      query.returnGeometry = false;
      // Return distinct values
      query.returnDistinctValues = true;

      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl());

      qTask.execute(query, function (results) {
        var idLote = results.features.map(function (i) {
          return i.attributes[_ID_LOTE_P_FIELD];
        });
        selfCm.idlotes = idLote;
        var idmanzana = results.features.map(function (i) {
          return i.attributes[_COD_MZN_FIELD];
        });
        var idsector = results.features.map(function (i) {
          return i.attributes[_COD_SECT_FIELD];
        });
        var queryLote = new Query();
        queryLote.where = _ID_LOTE_P_FIELD + ' in (' + idLote.join(",") + ') and (' + _UBIGEO_FIELD + ' = ' + paramsApp['ubigeo'] + ')';
        selfCm.lotesQuery = queryLote.where;
        selfCm.arancel = _UBIGEO_FIELD + ' = \'' + paramsApp.ubigeo + '\' and (' + _COD_MZN_FIELD + ' in (' + idmanzana.join(",") + ')) and (' + _COD_SECT_FIELD + ' IN (' + idsector.join(",") + '))';
        queryLote.returnGeometry = true;
        var qTaskLote = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
        qTaskLote.executeForExtent(queryLote, function (results) {
          selfCm.map.setExtent(results.extent.expand(2)).then(function () {
            qTaskLote.execute(queryLote, function (results) {
              var arr = [];
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = results.features[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var i = _step2.value;

                  arr.push(i.geometry);
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              var response = selfCm._unionFeatures(arr);
              var graphic = new Graphic(response, symbolLoteSelected);
              var featureSelected = new GraphicsLayer({
                id: idGraphicLoteSelectedCm
              });
              featureSelected.add(graphic);
              selfCm.map.addLayer(featureSelected);

              // Parpadeo de seleccion
              var interval = setInterval(function () {
                if (featureSelected.graphics[0].symbol === symbolLoteSelected) {
                  featureSelected.graphics[0].setSymbol(null);
                } else {
                  featureSelected.graphics[0].setSymbol(symbolLoteSelected);
                }
              }, 200);
              setTimeout(function () {
                clearInterval(interval);
                selfCm._removeLayerGraphic(idGraphicLoteSelectedCm);
              }, 2000);
            });
          });
        });
      });
    },
    _zoomHomeRequests: function _zoomHomeRequests() {
      selfCm._zoomExtentToLote(selfCm.codigosPredios);
    },
    _populateFormsByPredio: function _populateFormsByPredio(id_solicitud) {
      var url = selfCm.config.landsByApplicationUrl + '/' + id_solicitud;
      selfCm._callApiRestServices(url, {}).then(function (response) {
        // -----------------------------------------------
        // Eliminar la siguiente linea cuando existan casos de prueba
        // response['results'] = selfCm._getDataPredioByRequests(id_solicitud)
        // -----------------------------------------------
        if (response.results.length == 0) {
          // Escribir mensaje de error
          selfCm._showMessage('No existe registro de los predios asociados a esta solicitud: ' + id_solicitud, type = "error");
          return;
        }
        var rows = response['results'].map(function (i) {
          return '<div class="caseInfoClsCm">\n          <div class="headPredInfoClsCm">\n            <span class="alignVCenter">Predio: ' + i.cpm + '</span>\n          </div>\n          <div class="bodyPredInfoClsCm">\n            <label for="direccion">Direcci\xF3n:</label>\n            <input type="text" id="direccion" name="direccion" value="' + i.streetName + '" readonly>\n  \n          </div>\n        </div>';
        });

        dojo.query('.CtnPredInfoClsCm')[0].innerHTML = rows.join('');
        dojo.query(".headPredInfoClsCm").on('click', selfCm._zoomToPredSelectedEvt);
        selfCm.codigosPredios = response['results'].map(function (i) {
          return i.cpm;
        }).join(',');
        // console.log(selfCm.codigosPredios)
        selfCm._zoomExtentToLote(selfCm.codigosPredios);
        // selfCm._zoomHomeRequests()
      });
    },
    _openFormCase: function _openFormCase(evt) {
      if (evt.currentTarget.id == "editRequestsCm") {
        var row = dojo.query(evt.currentTarget).closest("tr")[0];
        var rowList = dojo.query("td", row).map(function (td) {
          return td.innerHTML;
        });
        selfCm.codRequestsCm = rowList[0];
        selfCm.caseDescription = rowList[1];
        dojo.query('#titleCaseCm')[0].innerHTML = '<span>' + selfCm.caseDescription + ' <span class="fa fa-search" style="font-size: 15px"></span></span>';
        selfCm._populateFormsByPredio(selfCm.codRequestsCm);
        // dojo.query('.codPredClsCm')[0].innerHTML = `<span class="alignVCenter">Predios: ${rowList[2]}</span>`
        // dojo.query('.headPredInfoClsCm')[0].innerHTML = `<span class="alignVCenter">Predio: ${rowList[2]}</span>`

        selfCm.case = evt.currentTarget.value;
        switch (selfCm.case) {
          case "1":
            selfCm.reasignarApCm.classList.toggle('active');
            break;
          case "2":
            selfCm.fusionApCm.classList.toggle('active');
            break;
          case "3":
            selfCm.divisionApCm.classList.toggle('active');
            break;
          case "4":
            selfCm.actGeomApCm.classList.toggle('active');
            break;
          case "5":
            selfCm.eliminacionApCm.classList.toggle('active');
            break;
          default:
            break;
        }

        // selfCm.codigosPredios = rowList[2]
        // selfCm._zoomHomeRequests()
        selfCm.resultCtnApCm.classList.remove('active');
        selfCm.obsCtnApCm.classList.remove('active');
        selfCm.requestTrayApCm.classList.remove('active');
        selfCm.casesCtnApCm.classList.toggle('active');
        selfCm._loadDocSupportCm();
      } else if (evt.currentTarget.id == 'backTrayCm' || evt.currentTarget.id == 'backTrayResultCm') {
        // desactivar el toolbarCm de edicion si esta activado
        // toolbarCm.deactivate()
        toolbarCm.deactivate();

        // deshabilitar snapping
        selfCm.map.disableSnapping();
        selfCm.bodyTbLinesDvApCm.innerHTML = '';
        // selfCm.CtnPrediosDvApCm.style.display = 'none'
        selfCm.bodyTbPrediosDvApCm.innerHTML = '';
        // selfCm.map.enableSnapping({
        //   snapPoint: false,
        //   snapLine: false,
        //   snapPolygon: false
        // });

        dojo.query(".caseClsCm").removeClass("active");
        // remove all graphics layer if exist
        selfCm._removeLayerGraphic(idGraphicPredioCm);
        selfCm._removeLayerGraphic(idGraphicLoteCm);
        selfCm._removeLayerGraphic(idGraphicPuntoLote);
        selfCm._removeLayerGraphic(idGraphicFrenteLote);
        selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
        selfCm._removeLayerGraphic(idGraphicLabelCodLote);
        selfCm.bodyTbDatosLoteDvApCm.innerHTML = '';

        // selfCm._removeLayerGraphic(idGraphicLineaDivision)
        graphicLayerLineaDivision.clear();
        graphicLayerLabelLineaDivision.clear();
        graphicLayerPredioByDivison.clear();

        selfCm.lotesQuery = null;
        selfCm.arancel = null;
        selfCm.xy = null;

        selfCm.casesCtnApCm.classList.remove('active');
        selfCm.resultCtnApCm.classList.remove('active');
        selfCm.obsCtnApCm.classList.remove('active');
        selfCm.requestTrayApCm.classList.toggle('active');
      }

      // selfCm.casesCtnApCm.classList.remove('active')
      // selfCm.resultCtnApCm.classList.remove('active')
      // selfCm.obsCtnApCm.classList.remove('active')
      // selfCm.requestTrayApCm.classList.toggle('active')
    },
    _openFormObs: function _openFormObs() {
      // console.log('aqui')
      selfCm.textAreaObsApCm.value = '';
      var imageDiv = dojo.query(".thumbnailClsCm")[0];
      imageDiv.style.backgroundImage = "none";
      imageDiv.innerHTML = "<span><i class='far fa-image'></i></span>";
      dojo.query('#headeRequestsCtnCm')[0].innerHTML = '<span class="alignVCenter">Solicitud: ' + selfCm.codRequestsCm + '</span>';
      selfCm.casesCtnApCm.classList.toggle("active");
      selfCm.obsCtnApCm.classList.toggle('active');
    },
    _FormResult: function _FormResult(id_solicitud, caseCm) {
      var urlPredioResults = selfCm.config.resultsByApplication + '/' + id_solicitud;
      selfCm._callApiRestServices(urlPredioResults, {}).then(function (response) {
        try {
          // ----------------------------------------------------
          // Comentar esta linea cuando se consuma el servicio
          // response = responseDivision[id_solicitud]
          // ----------------------------------------------------
          selfCm.bodyTbResultsApCm.innerHTML = '';
          dojo.query("#titleCaseResult")[0].innerHTML = '<span>Solicitud ' + id_solicitud + ': ' + caseCm + '</span>';

          var rows = response.results.map(function (predio, index) {
            return '<tr><td class="center-aligned">' + (index + 1) + '</td>\n                  <td>' + predio['cpm'] + '</td>\n                  <td>' + predio['address'] + '</td>\n                  <td class="center-aligned">\n                    <span id="' + predio['cpm'] + '_search" class="zoomPredioResultClsCm"><i class="fas fa-search"></i></span>\n                  </td></tr>';
          });
          selfCm.bodyTbResultsApCm.innerHTML = rows.join('');
          dojo.query('.zoomPredioResultClsCm').on('click', selfCm._centerAtPredioResult);
          selfCm.casesCtnApCm.classList.remove("active");
          selfCm.obsCtnApCm.classList.remove('active');
          selfCm.requestTrayApCm.classList.remove('active');
          selfCm.resultCtnApCm.classList.toggle('active');
          selfCm.busyIndicator.hide();
        } catch (error) {
          console.log(error);
        }
      });
    },
    _centerAtPredioResult: function _centerAtPredioResult(evt) {
      var cod_pre = evt.currentTarget.id.replace('_search', '');
      selfCm._zoomToPredSelected(cod_pre);
    },
    _openFormResult: function _openFormResult(evt) {
      var row = dojo.query(evt.currentTarget).closest("tr")[0];
      var rowList = dojo.query("td", row).map(function (td) {
        return td.innerHTML;
      });
      selfCm.codRequestsCm = rowList[0];
      selfCm.caseDescription = rowList[1];
      selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
    },
    _createToolbar: function _createToolbar() {
      toolbarCm = new Draw(selfCm.map);
      toolbarCm.on("draw-end", selfCm._addToMap);
    },
    _addToMap: function _addToMap(evt) {
      if (evt.geometry.type === "point") {
        var screenPoint = selfCm.map.toScreen(evt.geometry);
        var deferred = selfCm.map.snappingManager.getSnappingPoint(screenPoint);
        deferred.then(function (value) {
          if (value !== undefined) {
            var point_g = webMercatorUtils.webMercatorToGeographic(new Point(value));
            var graphic = new Graphic(point_g, symbolByCase[selfCm.case].symbol);
            // si es el caso reasignacion de predio
            if (selfCm.case == 1 || selfCm.case == 2) {

              var graphicLayer = new GraphicsLayer({
                id: idGraphicPredioCm
              });
              graphicLayer.add(graphic);
              selfCm.map.addLayer(graphicLayer);
              selfCm.xy = [point_g.x, point_g.y];
            } else if (selfCm.case == 3) {
              graphic['attributes'] = { id: selfCm.idPredioDivision };
              graphicLayerPredioByDivison.add(graphic);
            }
            selfCm.map.setInfoWindowOnClick(true);
            toolbarCm.deactivate();
          } else {
            alert(selfCm.nls.errorSnapingLocate);
          }
        }, function (error) {
          console.log(error);
        });
      } else if (evt.geometry.type === "polyline") {
        selfCm.idxLines = selfCm.idxLines + 1;
        var nameIdLine = 'Polyline_' + selfCm.idxLines;
        var graphic = new Graphic(evt.geometry, symbolDivisionLote, { id: nameIdLine });
        graphicLayerLineaDivision.add(graphic);
        selfCm._populateTableDrawLine(nameIdLine);
        selfCm._addNameToLine(nameIdLine, evt.geometry);
        selfCm.map.addLayer(graphicLayerLineaDivision);
        selfCm.map.setInfoWindowOnClick(true);
        toolbarCm.deactivate();
      }
    },
    _removeLayerGraphic: function _removeLayerGraphic(layerId) {
      if (selfCm.map.graphicsLayerIds.includes(layerId)) {
        selfCm.map.removeLayer(selfCm.map.getLayer(layerId));
      }
    },
    _activateTool: function _activateTool() {
      selfCm._activateSnappingByReasignar();
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      toolbarCm.activate(Draw["POINT"]);
    },
    _activateToolAcumulacion: function _activateToolAcumulacion(evt) {
      var id = evt.currentTarget.id;
      selfCm.idPredioAcumulacion = id;
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._activateSnappingByAcumulacion();
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      toolbarCm.activate(Draw["POINT"]);
    },
    _activateToolLinesDivision: function _activateToolLinesDivision() {
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._activateSnappingByDivision();
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);
      selfCm.bodyTbDatosLoteDvApCm.innerHTML = '';
      selfCm.bodyTbPrediosDvApCm.innerHTML = '';
      graphicLayerPredioByDivison.clear();
      toolbarCm.activate(Draw["POLYLINE"]);
    },
    _activateSnappingByReasignar: function _activateSnappingByReasignar() {
      var cflayer = selfCm.layersMap.getLayerInfoById(idLyrCfLotes_pun);
      var propertyLayer = new FeatureLayer(cflayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      var snapManager = selfCm.map.enableSnapping({
        // alwaysSnap: true,
        // snapKey: keys.CTRL,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 5
      });
      // get layerinfo by id of layer to snap
      var layerInfos = [{
        layer: propertyLayer
      }];

      snapManager.setLayerInfos(layerInfos);
    },
    _activateSnappingByAcumulacion: function _activateSnappingByAcumulacion() {
      var graphicLayerPuntoLote = selfCm.map.getLayer(idGraphicPuntoLote);
      var graphicsLayerInfo = new esri.layers.LayerInfo({
        id: graphicLayerPuntoLote.id, // El id del `GraphicsLayer`
        name: graphicLayerPuntoLote.name, // El nombre del `GraphicsLayer`
        layer: graphicLayerPuntoLote // El `GraphicsLayer` a utilizar
      });

      // Agregar el `LayerInfo` al mapa y habilitar el snapping
      selfCm.map.enableSnapping({
        layerInfos: [graphicsLayerInfo], // Agregar el `LayerInfo` al mapa
        // alwaysSnap: true,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 5
      });
    },
    _activateSnappingByDivision: function _activateSnappingByDivision() {
      var graphicsLayerInfo = new esri.layers.LayerInfo({
        id: graphicLayerLineaDivision.id, // El id del `GraphicsLayer`
        name: graphicLayerLineaDivision.name, // El nombre del `GraphicsLayer`
        layer: graphicLayerLineaDivision // El `GraphicsLayer` a utilizar
      });

      var cflayer = selfCm.layersMap.getLayerInfoById(idLyrCfLotes);
      var propertyLayer = new FeatureLayer(cflayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });

      var layerInfos = [{
        layer: propertyLayer
      }, graphicsLayerInfo];

      // Agregar el `LayerInfo` al mapa y habilitar el snapping
      selfCm.map.enableSnapping({
        layerInfos: layerInfos, // Agregar el `LayerInfo` al mapa
        // alwaysSnap: true,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 5
      });
    },
    _unionFeatures: function _unionFeatures(arr) {
      var union = geometryEngine.union(arr);
      return union;
    },
    _ApplyAcumulacionLotes: function _ApplyAcumulacionLotes() {
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);

      // Creamos grafico de lote fusionado
      var graphicLayerLoteFusion = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      var query = new Query();
      query.where = selfCm.lotesQuery;
      query.outFields = ["*"];
      query.returnGeometry = true;
      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      qTask.execute(query, function (results) {
        var arr = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = results.features[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var i = _step3.value;

            arr.push(i.geometry);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var response = selfCm._unionFeatures(arr);
        var graphic = new Graphic(response, symbolFusionLote);

        graphicLayerLoteFusion.add(graphic);
        selfCm.map.addLayer(graphicLayerLoteFusion);
        selfCm.map.setExtent(graphic._extent.expand(1.5), true);
        var urlLotes = selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
        selfCm._etiquetasCodLote(urlLotes, _COD_LOTE_FIELD, selfCm.arancel, "max", [response], selfCm.bodyTbDatosLoteFsApCm);
      }).then(function () {
        var query = new Query();
        query.where = selfCm.arancel;
        // especificar los campos devueltos
        query.outFields = [_UBIGEO_FIELD, _F_MZN_FIELD];
        query.returnGeometry = true;
        // query with order by fields
        query.orderByFields = [_F_MZN_FIELD];
        var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfArancel).getUrl());
        qTask.execute(query, function (results) {
          // Creamos grafico de punto lote
          var graphicLayerPuntoLote = new GraphicsLayer({
            id: idGraphicPuntoLote
          });
          // creamos grafico de frente de lote
          var graphicLayerFrenteLote = new GraphicsLayer({
            id: idGraphicFrenteLote
          });
          var graphicFusion = selfCm.map.getLayer(idGraphicLoteCm);
          var frentes = {};
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = results.features[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var row = _step4.value;

              var isItc = geometryEngine.intersects(row.geometry, graphicFusion.graphics[0].geometry);
              if (!isItc) {
                continue;
              }
              // saber si un key esta dentro del objeto frentes
              if (!frentes.hasOwnProperty(row.attributes[_F_MZN_FIELD])) {
                frentes[row.attributes[_F_MZN_FIELD]] = row.geometry;
              } else {
                var unionFrentes = geometryEngine.union([frentes[row.attributes[_F_MZN_FIELD]], row.geometry]);
                frentes[row.attributes[_F_MZN_FIELD]] = unionFrentes;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          for (var idx in frentes) {
            // interseccion entre frentes y lote
            var itcFrentesByLotes = geometryEngine.intersect(frentes[idx], graphicFusion.graphics[0].geometry);
            // Generate symbol by line with random colors

            // polilinea de frentes resultantes
            var polyline = new Polyline({
              paths: itcFrentesByLotes.paths,
              spatialReference: { wkid: 4326 }
            });

            var polylineOne = null;
            if (polyline.paths.length > 1) {
              polylineOne = selfCm._getLongestPolyline(polyline);
            } else {
              polylineOne = polyline;
            }

            // calculamos el punto medio de la polilinea
            var puntoLoteTurf = selfCm._findMidpoint(polylineOne);

            // crear un punto en el mapa
            var puntoLote = new Point({
              x: puntoLoteTurf.geometry.coordinates[0],
              y: puntoLoteTurf.geometry.coordinates[1],
              spatialReference: { wkid: 4326 }
            });

            // Agregar el punto p al mapa          
            var puntoLoteGraphic = new Graphic(puntoLote, symbolPuntoLote);
            graphicLayerPuntoLote.add(puntoLoteGraphic);

            // console.log(point)
            var symbolFrenteLote = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]), 5);
            var frente = new Graphic(polyline, symbolFrenteLote);
            graphicLayerFrenteLote.add(frente);
          }

          selfCm.map.addLayer(graphicLayerFrenteLote);
          selfCm.map.addLayer(graphicLayerPuntoLote);
          selfCm._populateTablePredio(selfCm.bodyTbPrediosFsApCm, selfCm._activateToolAcumulacion);
        });
      });
    },
    _getMidpoint: function _getMidpoint(polyline) {
      var length = geometryEngine.geodesicLength(polyline, "meters");
      var midpoint = geometryEngine.geodesicDensify(polyline, length / 2, "meters").getPoint(0, 0);
      return midpoint;
    },
    _findMidpoint: function _findMidpoint(polyline) {
      var lengthPolylineChunk = geometryEngine.geodesicLength(polyline, "meters");
      var line = turf.lineString(polyline.paths[0]);
      var options = { units: 'meters' };
      var along = turf.along(line, lengthPolylineChunk / 2, options);
      return along;
    },
    _getLongestPolyline: function _getLongestPolyline(polyline) {
      var paths = polyline.paths;
      var longestPath = 0;
      var response = null;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = paths[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var path = _step5.value;

          var polylineChunk = new Polyline({
            paths: [path],
            spatialReference: { wkid: 4326 }
          });
          var lengthPolylineChunk = geometryEngine.geodesicLength(polylineChunk, "meters");
          if (lengthPolylineChunk > longestPath) {
            longestPath = lengthPolylineChunk;
            response = polylineChunk;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return response;
    },
    _dividePolygon: function _dividePolygon(poly, lines) {
      var divide = geometryEngine.cut(poly, lines);
      return divide;
    },
    _populateTableDrawLine: function _populateTableDrawLine(idLine) {
      var row = '<td class="center-aligned">' + selfCm.idxLines + '</td>\n              <td contenteditable="true" id="' + idLine + '_name">' + idLine + '</td>\n              <td class="center-aligned">\n                <span id="' + idLine + '_ext"><i class="fas fa-search"></i></span>\n              </td>\n              <td class="center-aligned">\n                <span id="' + idLine + '_del" style="color: #FF5722;"><i class="far fa-trash-alt"></i></span>\n              </td>';
      var tr = dojo.create('tr');
      tr.id = idLine;
      tr.innerHTML = row;
      tr.style.cursor = "pointer";
      selfCm.bodyTbLinesDvApCm.appendChild(tr);
      dojo.query('#' + idLine + '_del').on('click', selfCm._deleteRowLine);
      dojo.query('#' + idLine + '_ext').on('click', selfCm._zoonToLineDivision);
      dojo.query('#' + idLine + '_name').on('input', selfCm._editaNameLineDivision);
    },
    _deleteRowLine: function _deleteRowLine(evt) {
      var id = evt.currentTarget.id.replace('_del', '');
      var elem = dojo.query('#' + id);
      var graphic = graphicLayerLineaDivision.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      graphicLayerLineaDivision.remove(graphic[0]);
      var graphicLabel = graphicLayerLabelLineaDivision.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      graphicLayerLabelLineaDivision.remove(graphicLabel[0]);
      // graphicLayerLineaDivision.graphics = graphics;
      // selfCm.map.removeLayer(self_lw.map.getLayer(id));
      elem[0].parentNode.removeChild(elem[0]);
    },
    _addNameToLine: function _addNameToLine(name, polylineGeom) {
      var polylineGeomUtm = webMercatorUtils.webMercatorToGeographic(polylineGeom);
      var midPoint = selfCm._findMidpoint(polylineGeomUtm);

      var pointLabel = new Point({
        x: midPoint.geometry.coordinates[0],
        y: midPoint.geometry.coordinates[1],
        spatialReference: { wkid: 4326 }
      });

      var font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
      var txtSym = new TextSymbol(name, font, new Color([250, 0, 0, 0.9]));
      txtSym.setOffset(15, 15).setAlign(TextSymbol.ALIGN_END);
      txtSym.setHaloColor(new Color([255, 255, 255]));
      txtSym.setHaloSize(1.5);
      var graphicLabel = new Graphic(pointLabel, txtSym, { id: name });

      // graphicLayer.add(graphic);
      graphicLayerLabelLineaDivision.add(graphicLabel);
    },
    _zoonToLineDivision: function _zoonToLineDivision(evt) {
      var id = evt.currentTarget.id.replace('_ext', '');
      var graphic = graphicLayerLabelLineaDivision.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      selfCm.map.setExtent(graphic[0]._extent, true);
    },
    _editaNameLineDivision: function _editaNameLineDivision(evt) {
      var id = evt.currentTarget.id.replace('_name', '');
      var graphic = graphicLayerLabelLineaDivision.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      graphic[0].symbol.text = evt.currentTarget.innerText;
      graphicLayerLabelLineaDivision.refresh();
      // console.log(evt.currentTarget.innerText);
    },
    _populateTablePredio: function _populateTablePredio(bodyTable, drawFunction) {
      // obtener del servicio los predios resultantes de la solicitud
      var urlPredioResults = selfCm.config.resultsByApplication + '/' + selfCm.codRequestsCm;
      selfCm._callApiRestServices(urlPredioResults, {}).then(function (response) {
        try {
          // --------------------------------------------------------------
          // Comentar lineas cuando se tenga el servicio
          // response = responseDivision[selfCm.codRequestsCm]
          // --------------------------------------------------------------
          var idx = 1;
          bodyTable.innerHTML = '';
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = response.results[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var predio = _step6.value;

              var tr = dojo.create('tr');
              tr.id = 'predio_' + idx + '_' + predio['cpm'];
              var row = '<td class="center-aligned">' + idx + '</td>\n                     <td>' + predio['cpm'] + '</td>\n                     <td>' + predio['address'] + '</td>\n                     <td class="center-aligned">\n                      <span id="' + tr.id + '_draw"><i class="fas fa-map-marker-alt"></i></span>\n                     </td>';
              tr.innerHTML = row;
              tr.style.cursor = "pointer";
              bodyTable.appendChild(tr);
              dojo.query('#' + tr.id + '_draw').on('click', drawFunction);
              idx = idx + 1;
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        } catch (error) {
          selfCm.busyIndicator.hide();
          selfCm._showMessage(error.message, type = "error");
        }
      });
    },
    _activateSnappingPrediosByDivision: function _activateSnappingPrediosByDivision(graphiclayer) {
      var graphicsLayerInfo = new esri.layers.LayerInfo({
        id: graphiclayer.id, // El id del `GraphicsLayer`
        name: graphiclayer.name, // El nombre del `GraphicsLayer`
        layer: graphiclayer // El `GraphicsLayer` a utilizar
      });

      // Agregar el `LayerInfo` al mapa y habilitar el snapping
      selfCm.map.enableSnapping({
        layerInfos: [graphicsLayerInfo], // Agregar el `LayerInfo` al mapa
        // alwaysSnap: true,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 5
      });
    },
    _activateToolPrediosByDivision: function _activateToolPrediosByDivision(evt) {
      var id = evt.currentTarget.id;
      selfCm.idPredioDivision = id;
      var graphic = graphicLayerPredioByDivison.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      graphicLayerPredioByDivison.remove(graphic[0]);
      selfCm.map.setInfoWindowOnClick(false);
      var graphicLayerPuntoLote = selfCm.map.getLayer(idGraphicPuntoLote);
      selfCm._activateSnappingPrediosByDivision(graphicLayerPuntoLote);
      toolbarCm.activate(Draw["POINT"]);
    },
    _changeValueCodLote: function _changeValueCodLote(evt) {
      var id = evt.target.id.split('_')[1];
      var idx = evt.target.selectedIndex;
      var cod_lote = evt.target.options[idx].value;
      var lyr = selfCm.map.getLayer(idGraphicLabelCodLote);
      var graphicSelected = lyr.graphics.filter(function (item) {
        return item.attributes.id == 'label_' + id;
      });
      graphicSelected[0].symbol.text = cod_lote;
      lyr.refresh();
    },
    _centerAtLabelCodLoteDivision: function _centerAtLabelCodLoteDivision(evt) {
      var id = evt.currentTarget.id;
      var lyr = selfCm.map.getLayer(idGraphicLabelCodLote);
      var graphicSelected = lyr.graphics.filter(function (item) {
        return item.attributes.id == id;
      });
      selfCm.map.centerAt(graphicSelected[0].geometry);
    },
    _editLoteUrbanoDivision: function _editLoteUrbanoDivision(evt) {
      var id = evt.currentTarget.id.replace('loteUrbanoDv_', '');
      var lyr = selfCm.map.getLayer(idGraphicLabelCodLote);
      var graphic = lyr.graphics.filter(function (item) {
        return item.attributes.id == 'label_' + id;
      });
      graphic[0].attributes.lot_urb = evt.currentTarget.textContent;
      lyr.refresh();
    },
    _buildDataLoteTable: function _buildDataLoteTable(tableBody, predios) {
      tableBody.innerHTML = '';
      // const tableBody = document.getElementById(tableBodyId);
      predios.forEach(function (predio, index) {
        var row = document.createElement('tr');

        // celda de índice
        var indexCell = document.createElement('td');
        indexCell.className = "center-aligned";
        indexCell.textContent = predio.num;
        row.appendChild(indexCell);

        // celda de codigo de predio
        var codigoCell = document.createElement('td');
        var select = document.createElement('select');
        select.className = "codLoteSelectDvCls";
        select.id = 'codLoteSelectDv_' + predio.num;
        predios.forEach(function (p) {
          var option = document.createElement('option');
          option.value = p.cod_lote;
          option.textContent = p.cod_lote;
          if (p.cod_lote === predio.cod_lote) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        codigoCell.appendChild(select);
        row.appendChild(codigoCell);

        // celda de lote urbano
        var loteUrbCell = document.createElement('td');
        loteUrbCell.contentEditable = true;
        loteUrbCell.textContent = '...';
        loteUrbCell.id = 'loteUrbanoDv_' + predio.num;
        loteUrbCell.className = "loteUrbanoDvCls";
        row.appendChild(loteUrbCell);

        var locationMarker = document.createElement('td');
        locationMarker.id = predio.id;
        locationMarker.className = "center-aligned";
        locationMarker.innerHTML = '<span class="locationLabelLoteDvCls" id="' + predio.id + '"><i class="fas fa-search"></i></span>';
        row.appendChild(locationMarker);
        tableBody.appendChild(row);
        // dojo.query(`#${predio.id}`).on('click', selfCm._centerAtLabelCodLoteDivision)
      });
      dojo.query('.codLoteSelectDvCls').on('change', selfCm._changeValueCodLote);
      dojo.query('.locationLabelLoteDvCls').on('click', selfCm._centerAtLabelCodLoteDivision);
      dojo.query('.loteUrbanoDvCls').on('input', selfCm._editLoteUrbanoDivision);
    },
    _ordenarPoligonosNorteSur: function _ordenarPoligonosNorteSur(poligonos, idx, bodyTable) {
      // Obtener la coordenada más al norte de cada polígono
      var coordenadasNorte = poligonos.map(function (poligono) {
        var extent = poligono.getExtent();
        return extent.ymax;
      });

      // Ordenar los polígonos en base a la coordenada más al norte
      var poligonosOrdenados = poligonos.slice().sort(function (a, b) {
        var coordenadaNorteA = coordenadasNorte[poligonos.indexOf(a)];
        var coordenadaNorteB = coordenadasNorte[poligonos.indexOf(b)];
        return coordenadaNorteB - coordenadaNorteA; // Ordenar de norte a sur
      });

      var graphicLayerLabelCodLoteDivision = new GraphicsLayer({
        id: idGraphicLabelCodLote
      });

      var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");

      var dataLoteTable = [];
      // Paso 5: Agregar número de polígono a propiedad "order"
      poligonosOrdenados.forEach(function (poligono, index) {

        var polygon = turf.polygon(poligono.rings);
        var center = turf.pointOnFeature(polygon);

        var pointLabel = new Point({
          x: center.geometry.coordinates[0],
          y: center.geometry.coordinates[1],
          spatialReference: { wkid: 4326 }
        });
        var cod_lote = selfCm._zfill(idx + 1, 3);
        var txtSym = new TextSymbol(cod_lote, font, new Color([250, 0, 0, 1]));
        txtSym.setColor(new esri.Color([0, 0, 0, 1])); // color blanco
        txtSym.setSize("12pt");
        txtSym.setHaloColor(new esri.Color([255, 255, 255, 1]));
        txtSym.setHaloSize(2);
        var idGraphic = 'label_' + (index + 1);
        var graphicLabel = new Graphic(pointLabel, txtSym, { id: idGraphic, lot_urb: '', clase: 'labelCodLoteDivision' });
        graphicLayerLabelCodLoteDivision.add(graphicLabel);
        dataLoteTable.push({ num: index + 1, id: idGraphic, cod_lote: cod_lote });
        idx = idx + 1;
        // editToolbar.activate(Edit.MOVE, graphicLabel, {allowAddVertices: false, allowDeleteVertices: false});
      });

      // Completar table
      selfCm._buildDataLoteTable(bodyTable, dataLoteTable);
      selfCm.map.addLayer(graphicLayerLabelCodLoteDivision);
    },
    _enableEditingLabelsLotesDivision: function _enableEditingLabelsLotesDivision(evt) {
      if (evt && evt.graphic && evt.graphic.attributes && evt.graphic.attributes.clase == 'labelCodLoteDivision') {
        selfCm.map.setInfoWindowOnClick(false);
        selfCm.editToolbar.activate(Edit.MOVE, evt.graphic);
      } else {
        selfCm.editToolbar.deactivate();
      }
    },
    _zfill: function _zfill(num, len) {
      return (Array(len).fill('0').join('') + num).slice(-len);
    },
    _etiquetasCodLote: function _etiquetasCodLote(url, campo, queryWhere, tipoEstadistica, polygonos, bodyTable) {
      var estadisticaDef = new esri.tasks.StatisticDefinition();
      estadisticaDef.statisticType = tipoEstadistica;
      estadisticaDef.onStatisticField = campo;
      estadisticaDef.outStatisticFieldName = "resultado";

      var query = new esri.tasks.Query();
      query.where = queryWhere;
      query.outFields = [campo];
      query.returnGeometry = false;
      query.outStatistics = [estadisticaDef];

      var queryTask = new esri.tasks.QueryTask(url);
      queryTask.execute(query, function (result) {
        if (result.features.length > 0) {
          var resultado = result.features[0].attributes.resultado;
          selfCm._ordenarPoligonosNorteSur(polygonos, parseInt(resultado), bodyTable);
        } else {
          return 0;
        }
      }, function (error) {
        console.log("Error al ejecutar la consulta: ", error);
      });
    },
    _ApplyDivideLotes: function _ApplyDivideLotes() {
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);

      // Creamos grafico de lote fusionado
      var graphicLayerLoteDivision = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      // Union all graphics of grpahicslayer
      // let graphicLayerLineaDivision = selfCm.map.getLayer(idGraphicLineaDivision);
      if (graphicLayerLineaDivision.graphics.length == 0) {
        selfCm._showMessage('No se ha dibujado ninguna linea de division', 'warning');
        return;
      }

      var arr = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = graphicLayerLineaDivision.graphics[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var i = _step7.value;

          arr.push(i.geometry);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var unionGraphicLayerLineaDivision = selfCm._unionFeatures(arr);

      var lineGeometry = new Polyline({
        paths: unionGraphicLayerLineaDivision.paths,
        spatialReference: { wkid: 102100 }
      });
      lineGeometry = esri.geometry.webMercatorToGeographic(lineGeometry);

      var query = new Query();
      // query.where = `(${_UBIGEO_FIELD} = '${paramsApp.ubigeo}') and (${_ID_LOTE_P_FIELD} in (49))`
      query.where = selfCm.lotesQuery;
      query.outFields = ["*"];
      query.returnGeometry = true;
      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      qTask.execute(query, function (results) {
        var geomLote = results.features[0].geometry;
        var geomLoteDivided = selfCm._dividePolygon(geomLote, lineGeometry);

        if (geomLoteDivided.length == 0) {
          //  genera un mensage show indicando que no se encontro el lote
          selfCm._showMessage('Las lineas de corte ingresadas no generan la división del lote.\nLas lineas deben iniciar y finalizar en el perimetro del lote.', type = 'error');
          return false;
        }

        // console.log(geomLoteDivided)
        // iterar sobre los graficos de la capa de division y agregar cada uno a graphicLayerLoteDivision
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = geomLoteDivided[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var i = _step8.value;

            var lote = new Graphic(i, symbolFusionLote);

            // agregar el grafico directo al mapa
            graphicLayerLoteDivision.add(lote);
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        selfCm.map.addLayer(graphicLayerLoteDivision);

        var urlLotes = selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
        selfCm._etiquetasCodLote(urlLotes, _COD_LOTE_FIELD, selfCm.arancel, "max", geomLoteDivided, selfCm.bodyTbDatosLoteDvApCm);

        // console.log(graphicLayerLoteDivision._extent)
        selfCm.map.reorderLayer(graphicLayerLoteDivision, selfCm.map.graphicsLayerIds.indexOf(graphicLayerLabelLineaDivision.id));
        selfCm.map.setExtent(results.features[0].geometry.getExtent().expand(1.5), true);
      }).then(function () {
        var query = new Query();
        query.where = selfCm.arancel;
        // especificar los campos devueltos
        query.outFields = [_UBIGEO_FIELD, _F_MZN_FIELD];
        query.returnGeometry = true;
        // query with order by fields
        query.orderByFields = [_F_MZN_FIELD];
        var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfArancel).getUrl());
        qTask.execute(query, function (results) {
          // Creamos grafico de punto lote
          var graphicLayerPuntoLote = new GraphicsLayer({
            id: idGraphicPuntoLote
          });
          // creamos grafico de frente de lote
          var graphicLayerFrenteLote = new GraphicsLayer({
            id: idGraphicFrenteLote
          });
          // let graphicLayerPredio = new GraphicsLayer({
          //   id: idGraphicPredioCm
          // });
          var graphicLoteDivision = selfCm.map.getLayer(idGraphicLoteCm);
          if (!graphicLoteDivision) {
            return;
          }
          var frentes = {};
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = results.features[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var row = _step9.value;
              var _iteratorNormalCompletion11 = true;
              var _didIteratorError11 = false;
              var _iteratorError11 = undefined;

              try {
                for (var _iterator11 = graphicLoteDivision.graphics[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                  var graphic = _step11.value;

                  var isItc = geometryEngine.intersects(row.geometry, graphic.geometry);
                  if (!isItc) {
                    continue;
                  }
                  // saber si un key esta dentro del objeot frentes
                  if (!frentes.hasOwnProperty(row.attributes[_F_MZN_FIELD])) {
                    frentes[row.attributes[_F_MZN_FIELD]] = row.geometry;
                  } else {
                    var unionFrentes = geometryEngine.union([frentes[row.attributes[_F_MZN_FIELD]], row.geometry]);
                    frentes[row.attributes[_F_MZN_FIELD]] = unionFrentes;
                  }
                }
              } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                  }
                } finally {
                  if (_didIteratorError11) {
                    throw _iteratorError11;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = graphicLoteDivision.graphics[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var lote = _step10.value;

              for (var idx in frentes) {
                var idItcFrentesByLotes = geometryEngine.intersects(lote.geometry, frentes[idx]);
                if (!idItcFrentesByLotes) {
                  continue;
                }
                var itcFrentesByLotes = geometryEngine.intersect(frentes[idx], lote.geometry);
                // add frentes to graphicLayerFrenteLote
                var symbolFrenteLote = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]), 5);
                var frente = new Graphic(itcFrentesByLotes, symbolFrenteLote);
                graphicLayerFrenteLote.add(frente);

                // polilinea de frentes resultantes
                var polyline = new Polyline({
                  paths: itcFrentesByLotes.paths,
                  spatialReference: { wkid: 4326 }
                });

                var puntoLoteTurf = selfCm._findMidpoint(polyline);

                // crear un punto en el mapa
                var puntoLote = new Point({
                  x: puntoLoteTurf.geometry.coordinates[0],
                  y: puntoLoteTurf.geometry.coordinates[1],
                  spatialReference: { wkid: 4326 }
                });

                // Agregar el punto p al mapa          
                var puntoLoteGraphic = new Graphic(puntoLote, symbolPuntoLote);
                graphicLayerPuntoLote.add(puntoLoteGraphic);
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }

          selfCm.map.addLayer(graphicLayerFrenteLote);
          selfCm.map.addLayer(graphicLayerPuntoLote);
          selfCm._removeLayerGraphic(idGraphicPredioByDivison);
          selfCm.map.addLayer(graphicLayerPredioByDivison);

          selfCm._populateTablePredio(selfCm.bodyTbPrediosDvApCm, selfCm._activateToolPrediosByDivision);
        });
      }, function (err) {
        console.log(err);
      });
    },
    _executeReasignacionGpService: function _executeReasignacionGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          var _params = {
            "cod_pred": selfCm.codigosPredios,
            "ubigeo": paramsApp['ubigeo'],
            "geometry": selfCm.xy,
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm
          };
          console.log(_params);

          // revisar si alguna propiedad tiene valor nulo o indefinido
          for (var key in _params) {
            if (_params[key] == null || _params[key] == undefined) {
              selfCm._showMessage('Debe especificar el valor de ' + key, type = "error");
              return;
            }
          }
          selfCm._executeGPService(selfCm.config.reasignacionUrl, _params);
        } else {
          return;
        }
      });
    },
    _executeAcumulacionGpService: function _executeAcumulacionGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          var labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote).graphics[0];
          var _params2 = {
            "lotes_orig": selfCm.idlotes,
            "ubigeo": paramsApp['ubigeo'],
            "lote_geom": JSON.stringify(selfCm.map.getLayer("graphicLoteCm").graphics[0].geometry.toJson()),
            "lote_pun_geon": JSON.stringify(selfCm.map.getLayer(idGraphicPuntoLote).graphics.map(function (i) {
              return [i.geometry.x, i.geometry.y];
            })),
            "predio_geom": JSON.stringify({ 'cod_pre': selfCm.idPredioAcumulacion.split("_")[2], 'coords': selfCm.xy }),
            "atributos": JSON.stringify({ 'cod_lote': labelCodLotesLayer.symbol.text, 'lot_urb': labelCodLotesLayer.attributes.lot_urb }),
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm
          };

          console.log(_params2);
          // revisar si alguna propiedad tiene valor nulo o indefinido
          for (var key in _params2) {
            if (_params2[key] == null || _params2[key] == undefined) {
              selfCm._showMessage('Debe especificar el valor de ' + key, type = "error");
              return;
            }
          }
          selfCm._executeGPService(selfCm.config.acumulacionUrl, _params2);
        } else {
          return;
        }
      });
    },
    _executeSubdivisionGpService: function _executeSubdivisionGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (!selfCm.map.getLayer(idGraphicLoteCm)) {
          selfCm._showMessage("La solicitud no se puede realizar porque no se ha previsualizado la división", type = "error");
          return;
        }

        if (graphicLayerPredioByDivison.graphics.length == 0) {
          selfCm._showMessage("La solicitud no se puede realizar porque no se graficaron los predios resultantes", type = "error");
          return;
        }
        var labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote);
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = labelCodLotesLayer.graphics[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var pred = _step12.value;

            if (!pred.attributes.lot_urb || pred.attributes.lot_urb === "...") {
              selfCm._showMessage("Debe especificar los valores de Lote Urbano", type = "error");
              return;
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }

        if (result) {

          var _params3 = {
            "lote_orig": selfCm.idlotes[0],
            "ubigeo": paramsApp['ubigeo'],
            "lotes_geom": JSON.stringify(selfCm.map.getLayer(idGraphicLoteCm).graphics.map(function (i) {
              return i.geometry.toJson();
            })),
            "lotes_pun_geom": JSON.stringify(selfCm.map.getLayer(idGraphicPuntoLote).graphics.map(function (i) {
              return [i.geometry.x, i.geometry.y];
            })),
            "predios_geom": JSON.stringify(graphicLayerPredioByDivison.graphics.map(function (i) {
              return { 'cod_pre': i.attributes.id.split("_")[2], 'coords': [i.geometry.x, i.geometry.y] };
            })),
            "atributos": JSON.stringify(labelCodLotesLayer.graphics.map(function (i) {
              return { 'cod_lote': i.symbol.text, 'lot_urb': i.attributes.lot_urb, 'coords': [i.geometry.x, i.geometry.y] };
            })),
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm
          };
          console.log(_params3);
          // revisar si alguna propiedad tiene valor nulo o indefinido
          for (var key in _params3) {
            if (_params3[key] == null || _params3[key] == undefined) {
              selfCm._showMessage('Debe especificar el valor de ' + key, type = "error");
              return;
            }
          }
          selfCm._executeGPService(selfCm.config.subdivisionUrl, _params3);
        } else {
          return;
        }
      });
    },
    _executeInactivarGpService: function _executeInactivarGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          // let labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote)
          var _params4 = {
            "ubigeo": paramsApp['ubigeo'],
            "cod_pred": selfCm.codigosPredios,
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm
          };
          console.log(_params4);
          // revisar si alguna propiedad tiene valor nulo o indefinido
          for (var key in _params4) {
            if (_params4[key] == null || _params4[key] == undefined) {
              selfCm._showMessage('Debe especificar el valor de ' + key, type = "error");
              return;
            }
          }
          selfCm._executeGPService(selfCm.config.inactivacionUrl, _params4);
        } else {
          return;
        }
      });
    },
    _executeGPService: function _executeGPService(url, params) {
      var urlStatusRequest = selfCm.config.applicationListUrl + '/' + selfCm.codRequestsCm;
      selfCm._callApiRestServices(urlStatusRequest, {}).then(function (result) {
        try {
          if (result.idStatus != 1) {
            throw new Error('Esta solicitud (' + selfCm.codRequestsCm + ') ya fue procesada con anterioridad: ' + result.date);
          }
          selfCm.busyIndicator.show();
          // Agregar un elemento de texto debajo del BusyIndicator
          var buzyElm = dojo.query("#dojox_widget_Standby_0")[0];
          var imgElm = buzyElm.querySelector("img");
          var loadingText = document.createElement('div');
          loadingText.id = 'loadingTextCustom';
          loadingText.style.position = 'absolute';
          var topMessage = parseFloat(imgElm.style.top) + 80;
          loadingText.style.top = topMessage + 'px';
          var leftImg = parseFloat(imgElm.style.left) + imgElm.width / 2;
          loadingText.style.left = leftImg + 'px';
          loadingText.style.transform = 'translate(-50%, -50%)';
          loadingText.style.background = 'white';
          loadingText.style.zIndex = '1000';

          dojo.query("#dojox_widget_Standby_0")[0].appendChild(loadingText);
          // selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
          selfCm.gp = new Geoprocessor(url);
          selfCm.gp.submitJob(params, selfCm._completeCallback, selfCm._statusCallback);
        } catch (error) {
          selfCm.busyIndicator.hide();
          selfCm._showMessage(error.message, type = "error");
        }
      });
    },
    _statusCallback: function _statusCallback(JobInfo) {
      // console.log(JobInfo)
      selfCm.jobId = JobInfo.jobId;
      // get last item of JobInfo.messages
      // console.log(JobInfo.jobStatus)
      var textMessage = JobInfo.messages.map(function (message) {
        return message.description;
      });
      // console.log(textMessage.slice(-1)[0] ? textMessage.slice(-1)[0] : '')
      try {
        dojo.query("#loadingTextCustom")[0].textContent = textMessage.slice(-1)[0] ? textMessage.slice(-1)[0] : '';
      } catch (error) {
        console.log(error);
      }
    },
    _completeCallback: function _completeCallback(JobInfo) {
      switch (JobInfo.jobStatus) {
        case "esriJobSubmitted":
          // El trabajo se ha enviado al servidor y está esperando en la cola.
          console.log("El trabajo se ha enviado y está esperando en la cola.");
          break;
        case "esriJobExecuting":
          // El trabajo se está ejecutando actualmente en el servidor.
          console.log("El trabajo se está ejecutando en el servidor.");
          break;
        case "esriJobSucceeded":
          // El trabajo se ha completado satisfactoriamente y los resultados están disponibles.
          selfCm.gp.getResultData(JobInfo.jobId, "response", function (result) {
            console.log(result);
            if (!result.value.status) {
              selfCm.busyIndicator.hide();
              selfCm._showMessage(result.value.message, type = "error");
              return;
            }

            switch (selfCm.case) {
              case "1":
                selfCm._removeLayerGraphic(idGraphicPredioCm);
                break;
              case "2":
                selfCm._removeLayerGraphic(idGraphicPredioCm);
                selfCm._removeLayerGraphic(idGraphicLoteCm);
                selfCm._removeLayerGraphic(idGraphicPuntoLote);
                selfCm._removeLayerGraphic(idGraphicFrenteLote);
                selfCm._removeLayerGraphic(idGraphicLabelCodLote);
              case "3":
                graphicLayerPredioByDivison.clear();
                graphicLayerLineaDivision.clear();
                graphicLayerLabelLineaDivision.clear();
                // selfCm._removeLayerGraphic(idGraphicPredioCm);
                selfCm._removeLayerGraphic(idGraphicLoteCm);
                selfCm._removeLayerGraphic(idGraphicPuntoLote);
                selfCm._removeLayerGraphic(idGraphicFrenteLote);
                selfCm._removeLayerGraphic(idGraphicLabelCodLote);
              default:
                break;
            }
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(false);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(true);
            selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
            // Codigo para mostrar la ventana de resultados

          });
          break;
        case "esriJobFailed":
          // El trabajo ha fallado y no se han podido generar los resultados.
          selfCm._showMessage("El proceso ha fallado y no se han podido generar los resultados.", type = "error");
          break;
        case "esriJobCancelled":
          // El trabajo ha sido cancelado por el usuario.
          selfCm._showMessage("El proceso ha sido cancelado por el usuario.");
          break;
        case "esriJobTimedOut":
          // El trabajo ha expirado debido a un tiempo de espera.
          selfCm._showMessage("El proceso ha superado el tiempo de espera necesario para su ejecución.", type = "error");
          break;
        default:
          // El estado del trabajo no se reconoce.
          selfCm._showMessage("El estado del proceso no se reconoce.");
          break;
      }
      selfCm.busyIndicator.hide();
      // remove 'loadingTextCustom'
      dojo.query("#loadingTextCustom")[0].remove();
    },
    _cancelProcess: function _cancelProcess(evt) {
      selfCm.gp.cancelJob(selfCm.jobId, function (info) {
        console.log(info.jobStatus);
      });
    },
    _exportTableToExcel: function _exportTableToExcel(evt) {
      // Obtén la tabla HTML
      var table = dojo.query("#tableRequestCm")[0];
      var headerRow = table.querySelector("tr");
      var rows = table.querySelectorAll("tr");

      var headers = [];
      var headerCols = headerRow.querySelectorAll("th");
      for (var h = 0; h < headerCols.length - 1; h++) {
        headers.push(headerCols[h].innerText);
      }

      var data = [];

      // Recorre las filas (ignora la primera fila que contiene los encabezados)
      for (var i = 0; i < rows.length; i++) {
        if (i == 0) continue;
        var row = {},
            cols = rows[i].querySelectorAll("td");

        // Recorre las columnas
        for (var j = 0; j < cols.length - 1; j++) {
          // Usa el texto del encabezado como clave y el texto de la celda como valor
          row[headers[j]] = cols[j].innerText;
        }

        data.push(row);
      }

      // Convierte el array de objetos en una cadena JSON
      var wb = XLSX.utils.book_new();

      // Crear una hoja de cálculo a partir de los datos JSON
      var ws = XLSX.utils.json_to_sheet(data);
      var sheetName = selfCm.currentTabActive.replace("_", " ");
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Escribir el libro de trabajo y forzar una descarga
      XLSX.writeFile(wb, 'reporte_solicitudes_' + selfCm.currentTabActive + '.xlsx');
    },
    _dataURItoBlob: function _dataURItoBlob(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var buffer = new ArrayBuffer(byteString.length);
      var dataView = new Uint8Array(buffer);
      for (var i = 0; i < byteString.length; i++) {
        dataView[i] = byteString.charCodeAt(i);
      }
      return new Blob([buffer], { type: mimeString });
    },
    _sendObservation: function _sendObservation(evt) {
      selfCm.busyIndicator.show();
      var file = selfCm.imgUploadApCm.files[0];
      if (file == undefined) {
        selfCm.busyIndicator.hide();
        selfCm._showMessage("Debe enviar una imagen como elemento de sustento", type = "error");
        return;
      }
      var reader = new FileReader();
      var data = new FormData();
      reader.onloadend = function () {
        data.append('application_id', selfCm.codRequestsCm);
        data.append('description', selfCm.textAreaObsApCm.value);
        data.append('img', selfCm.imgUploadApCm.files[0]);

        return fetch(selfCm.config.observationUrl, {
          method: 'POST',
          body: data
        }).then(function (response) {
          if (!response.ok) {
            selfCm.busyIndicator.hide();
            throw new Error('HTTP error! status: ' + response.status);
          }
          selfCm.busyIndicator.hide();
          selfCm._showMessagePromise("Se envió la solucitud satisfactoriamente.").then(function (result) {
            dojo.query(".backRequestsClsCm")[0].click();
            dojo.query(".backTrayClsCm")[0].click();
            selfCm._loadIniRequestsCm();
          });
        }).catch(function (error) {
          selfCm.busyIndicator.hide();
          selfCm._showMessage('Ocurrio un problema al procesar su solicitud: ' + error, type = "error");
        });
      };
      reader.readAsDataURL(file);
    },
    _uploadImagenObs: function _uploadImagenObs(evt) {
      var imageDiv = dojo.query(".thumbnailClsCm")[0];
      var file = evt.target.files[0];
      var reader = new FileReader();

      reader.onloadend = function () {
        imageDiv.innerHTML = "";
        imageDiv.style.backgroundImage = 'url(' + reader.result + ')';
        imageDiv.style.backgroundSize = 'contain';
        imageDiv.style.backgroundRepeat = 'no-repeat';
        imageDiv.style.backgroundPosition = 'center';
      };

      if (file) {
        reader.readAsDataURL(file);
      } else {
        imageDiv.innerHTML = "<span><i class='far fa-image'></i></span>";
      }
    },
    _searchRequestByCodPred: function _searchRequestByCodPred(evt) {
      if (evt.keyCode === 13) {
        if (evt.target.value == '') {
          if ('cpm' in selfCm.queryRequests) {
            delete selfCm.queryRequests['cpm'];
          }
        } else {
          selfCm.queryRequests['cpm'] = evt.target.value;
        }
        dojo.query(".tablinksCm")[0].click();
      }
    },
    onOpen: function onOpen() {
      console.log('CartoMaintenanceWgt::onOpen');
      var panel = this.getPanel();
      panel.position.height = 750;
      panel.setPosition(panel.position);
      panel.panelManager.normalizePanel(panel);

      this._createToolbar();

      dojo.query(".backTrayClsCm").on('click', this._openFormCase);
      dojo.query(".tablinksCm").on('click', this._loadRequestsCm);
      dojo.query("#btnObsCaseCm").on('click', this._openFormObs);
      dojo.query(".backRequestsClsCm").on('click', this._openFormObs);
      // dojo.query("#goodRequestsCm").on('click', this._openFormResult);
      dojo.query("#showInfoDocCm").on('click', this._openSupportingDocument);

      // Reasignacion
      dojo.query("#btnDrawMarkerCm").on('click', this._activateTool);

      dojo.query("#btnFsCm").on('click', this._ApplyAcumulacionLotes);
      dojo.query("#btnDrawLinesDvCm").on('click', this._activateToolLinesDivision);
      dojo.query("#btnApplyDvCm").on('click', this._ApplyDivideLotes);
      dojo.query("#titleCaseCm").on('click', this._zoomHomeRequests);
      dojo.query("#sendDataRsCm").on('click', this._executeReasignacionGpService);
      dojo.query('#sendDataFsCm').on('click', this._executeAcumulacionGpService);
      dojo.query('#sendDataDvCm').on('click', this._executeSubdivisionGpService);
      dojo.query('#sendDataDtCm').on('click', this._executeInactivarGpService);
      dojo.query('#btnReportCm').on('click', this._exportTableToExcel);
      dojo.query('#imgUploadCm').on('change', this._uploadImagenObs);
      dojo.query('#sendDataObsGrCm').on('click', this._sendObservation);
      dojo.query('#searchTbxCm').on("keyup", this._searchRequestByCodPred);
      this._loadIniRequestsCm();

      selfCm.map.addLayer(graphicLayerLabelLineaDivision);
      selfCm.editToolbar = new Edit(selfCm.map);
      selfCm.map.on("click", selfCm._enableEditingLabelsLotesDivision);
      selfCm.editToolbar.on("deactivate", function (evt) {
        if (evt.info.isModified) {
          selfCm.map.setInfoWindowOnClick(true);
          // firePerimeterFL.applyEdits(null, [evt.graphic], null);
        }
      });
    }
  }

  // onClose(){
  //   console.log('CartoMaintenanceWgt::onClose');
  // },
  // onMinimize(){
  //   console.log('CartoMaintenanceWgt::onMinimize');
  // },
  // onMaximize(){
  //   console.log('CartoMaintenanceWgt::onMaximize');
  // },
  // onSignIn(credential){
  //   console.log('CartoMaintenanceWgt::onSignIn', credential);
  // },
  // onSignOut(){
  //   console.log('CartoMaintenanceWgt::onSignOut');
  // }
  // onPositionChange(){
  //   console.log('CartoMaintenanceWgt::onPositionChange');
  // },
  // resize(){
  //   console.log('CartoMaintenanceWgt::resize');
  // }
  );
});
//# sourceMappingURL=Widget.js.map
