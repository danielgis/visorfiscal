define(['dojo/_base/declare', 'jimu/BaseWidget', 'dijit/_WidgetsInTemplateMixin', "esri/toolbars/draw", "esri/toolbars/edit", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 'dojo/_base/Color', "esri/layers/GraphicsLayer", "esri/geometry/Point", "jimu/LayerInfos/LayerInfos", "dojo/_base/lang", "esri/layers/FeatureLayer", "esri/tasks/QueryTask", "esri/tasks/query", "jimu/WidgetManager", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/webMercatorUtils", "esri/tasks/Geoprocessor", 'esri/dijit/util/busyIndicator', "jimu/dijit/Message", "https://unpkg.com/@turf/turf@6/turf.min.js", "https://unpkg.com/xlsx@0.17.2/dist/xlsx.full.min.js", "dojo/Deferred", "esri/symbols/TextSymbol", "esri/symbols/Font", './CaseInfo', "esri/tasks/StatisticDefinition", "esri/request", './case/Subdivision', './case/Acumulation', './case/Independence', './components/LandAssignment', './components/LandProcess', './components/LandMatrix', './case/UtilityCase'], function (declare, BaseWidget, _WidgetsInTemplateMixin, Draw, Edit, Graphic, SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol, Color, GraphicsLayer, Point, LayerInfos, lang, FeatureLayer, QueryTask, Query, WidgetManager, geometryEngine, Polyline, Polygon, webMercatorUtils, Geoprocessor, BusyIndicator, Message, turf, XLSX, Deferred, TextSymbol, Font, CaseInfo, StatisticDefinition, esriRequest, SubDivision, Acumulation, Independence, LandAssignment, LandProcess, LandMatrix, UtilityCase) {
  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var requestToAttendState = "por_atender";
  var requestsObservedState = "observado";
  var requestsAttendState = "atendido";

  // Layers ids
  var idLyrCatastroFiscal = "CARTO_FISCAL_6806";
  var idLyrCfPredios = "CARTO_FISCAL_6806_0";
  var idLyrCfLotesPun = "CARTO_FISCAL_6806_1";
  var idLyrCfEje_vial = "CARTO_FISCAL_6806_2";
  var idLyrCfNumeracion = "CARTO_FISCAL_6806_3";
  var idLyrCfArancel = "CARTO_FISCAL_6806_4";
  var idLyrCfLotes = "CARTO_FISCAL_6806_5";
  var idLyrCfUnidadesurbanas = "CARTO_FISCAL_6806_6";
  var idLyrCfParques = "CARTO_FISCAL_6806_7";
  var idLyrCfManzana = "CARTO_FISCAL_6806_8";
  var idLyrCfManzanaUrb = "CARTO_FISCAL_6806_9";
  var idLyrCfSector = "CARTO_FISCAL_6806_9";
  // const idLyrActpuntoimg = "ACTUALIZACION_DE_PUNTO_IMG_1890"
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

  var symbolPredioSelected2 = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 30, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 183, 205]), 2), new Color([0, 255, 255]));

  var symbolSnapPointCm = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));

  // Identificadores de graficos
  var idGraphicPredioCm = "graphicPredioCm2";
  var idGraphicPredioByDivison = "graphicPredioByDivison";
  // const idGraphicLandsByIndependence = "graphicLandsByIndependence"
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

  // const graphicLayerLandsByIndependence = new GraphicsLayer({
  //   id: idGraphicLandsByIndependence,
  // });

  var fontAwesome = document.createElement('script');
  fontAwesome.src = 'https://use.fontawesome.com/releases/v5.3.1/js/all.js';
  document.head.appendChild(fontAwesome);

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
    idButtonDrawActive: '',
    queryRequests: {
      ubigeo: paramsApp['ubigeo'],
      limit: 1000000,
      ordering: "-date"
    },

    responseRequests: null,
    currentLotsRows: null,
    currentLandRows: null,
    currentPoinLotsRows: null,
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
      var queryPredios = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getFilter();
      queryPredios = queryPredios ? queryPredios + " AND " + selfCm.queryUbigeo : selfCm.queryUbigeo;
      selfCm.layersMap.getLayerInfoById(idLyrCfPredios).setFilter(queryPredios);
      selfCm.layersMap.getLayerInfoById(idLyrCfLotesPun).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfEje_vial).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfNumeracion).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfArancel).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfLotes).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfUnidadesurbanas).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfParques).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfManzana).setFilter(selfCm.queryUbigeo);
      selfCm.layersMap.getLayerInfoById(idLyrCfSector).setFilter(selfCm.queryUbigeo);
      // selfCm.layersMap.getLayerInfoById(idLyrActpuntoimg).setFilter(selfCm.queryUbigeo)
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
    _loadDocSupportCm: function _loadDocSupportCm() {
      var urlStatusRequest = selfCm.config.applicationListUrl + '/' + selfCm.codRequestsCm;
      selfCm._callApiRestServices(urlStatusRequest, {}).then(function (result) {
        try {
          dojo.query("#showInfoDocCm")[0].value = result.support;
        } catch (error) {
          selfCm.busyIndicator.hide();
          selfCm._showMessage(error.message, type = "error");
        }
      });
    },
    _loadRequestsCm: function _loadRequestsCm(evt) {
      selfCm.busyIndicator.show();
      selfCm._callApiRestServices(selfCm.config.applicationListUrl, selfCm.queryRequests).then(function (response) {
        // // ----------------------------------------------
        // // @danielgis
        // // comentar esta linea cuando se pase a produccion
        // // ----------------------------------------------
        // response = {
        //   "count": 8,
        //   "next": null,
        //   "previous": null,
        //   "results": [
        //     {
        //       "id": 92,
        //       "lands": [
        //         {
        //           "cpm": "1758",
        //         }
        //       ],
        //       "status": "Por atender",
        //       "type": "Independización",

        //       "idType": 5,
        //       "date": "2023-12-27T11:04:20.817416",
        //       "idStatus": 1,
        //       "support": "http://appstest.mineco.gob.pe/plataformaCF/catastroback/media/sustento/Captura_de_pantalla_2023-12-19_103952.png",
        //       "usermane": null,
        //       "ubigeo": "240104"
        //     },
        //     {
        //       "id": 9,
        //       "lands": [
        //         {
        //           "cpm": "380",
        //         }
        //       ],
        //       "status": "Por atender",
        //       "type": "División",
        //       "idType": 3,
        //       "date": "2023-12-19T10:16:31.828636",
        //       "idStatus": 1,
        //       "support": "http://appstest.mineco.gob.pe/plataformaCF/catastroback/media/sustento/Captura_de_pantalla_2023-07-10_155226_5mUbV5D.png",
        //       "usermane": null,
        //       "ubigeo": "240104"
        //     },
        //   ]
        // }
        // // ----------------------------------------------

        response = response['results'];
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
      var cod_pred = evt.currentTarget.dataset.codpre;
      return selfCm._zoomToPredSelected(cod_pred);
      // .then(results => {
      //   console.log(results)
      // })
      // .catch(error => {
      //   selfCm._showMessage(error.message, type = "error")
      // })
    },
    _handleFeatureSelected: function _handleFeatureSelected(feature) {
      var featureSelected = new GraphicsLayer({
        id: idGraphicPredioSelectedCm
      });
      feature[0].setSymbol(symbolPredioSelected);
      featureSelected.add(feature[0]);
      selfCm.map.addLayer(featureSelected);
      selfCm.map.centerAt(feature[0].geometry);

      // Parpadeo de seleccion
      // const interval = setInterval(function () {
      //   if (featureSelected.graphics[0].symbol === symbolPredioSelected) {
      //     featureSelected.graphics[0].setSymbol(null);
      //   } else {
      //     featureSelected.graphics[0].setSymbol(symbolPredioSelected);
      //   }
      // }, 200);
      setTimeout(function () {
        // clearInterval(interval);
        selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
      }, 1000);
    },
    _zoomToPredSelected: function _zoomToPredSelected(cod_pred) {
      selfCm.busyIndicator.show();
      var deferred = new Deferred();
      selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
      var prediosLayer = selfCm.layersMap.getLayerInfoById(idLyrCfPredios);
      var propertyLayer = new FeatureLayer(prediosLayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      // crear una consulta para seleccionar la fila deseada
      var query = new Query();
      query.where = _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\' and ' + _COD_PRE_FIELD + ' = \'' + cod_pred + '\'';

      // seleccionar la fila
      propertyLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW).then(function (results) {
        if (results.length == 0) {
          throw new Error("No se encontró el predio seleccionado");
        }
        selfCm._handleFeatureSelected(results);
        selfCm.busyIndicator.hide();
        return deferred.resolve(results);
      }).catch(function (error) {
        selfCm.busyIndicator.hide();
        selfCm._showMessage(error.message, type = "error");
        deferred.reject(error);
      });
      return deferred.promise;
    },
    _openSupportingDocument: function _openSupportingDocument(evt) {
      // check if value is empty
      if (!evt.currentTarget.value) {
        selfCm._showMessage("No se adjuntó documento de soporte", type = "error");
        return;
      }
      window.open(evt.currentTarget.value, '_blank').focus();
    },
    executeQueryTask: function executeQueryTask(url, query) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'query';

      return new Promise(function (resolve, reject) {
        var qTask = new QueryTask(url);
        switch (type) {
          case 'query':
            qTask.execute(query, resolve, reject);
            break;
          case 'queryForExtent':
            qTask.executeForExtent(query, resolve, reject);
            break;
          default:
            break;
        }
      });
    },
    _getLandsOriginals: function _getLandsOriginals() {
      var self = this;
      var deferred = new Deferred();
      var LandCls = new UtilityCase.Land();
      var LotCls = new UtilityCase.Lot();
      var queryLands = new Query();
      var codPreOriginal = self.currentLandTabRows.map(function (i) {
        return i.cpm;
      });
      queryLands.where = UtilityCase.ubigeoFieldName + ' = \'' + paramsApp['ubigeo'] + '\' and ' + LandCls.codPre + ' in (\'' + codPreOriginal.join("', '") + '\')';
      queryLands.returnGeometry = true;
      queryLands.outFields = ["*"];
      var urlLands = self.layersMap.getLayerInfoById(idLyrCfPredios).getUrl();
      self.executeQueryTask(urlLands, queryLands).then(function (results) {
        if (results.features.length == 0) {
          throw new Error(self.nls.errorGetLand);
        }
        self.currentLandRows = results.features;
        var idLots = self.currentLandRows.map(function (i) {
          return i.attributes[LotCls.idLotP];
        });
        deferred.resolve(idLots);
      }).catch(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },
    _getLotsOriginals: function _getLotsOriginals(idLots) {
      var self = this;
      var LotCls = new UtilityCase.Lot();
      var deferred = new Deferred();
      var queryLots = new Query();
      queryLots.where = LotCls.idLotP + ' in (' + idLots.join(",") + ') and (' + UtilityCase.ubigeoFieldName + ' = ' + paramsApp['ubigeo'] + ')';
      self.lotesQuery = queryLots.where;
      queryLots.returnGeometry = true;
      queryLots.outFields = ["*"];
      var urlLots = self.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
      self.executeQueryTask(urlLots, queryLots).then(function (results) {
        if (results.features.length == 0) {
          throw new Error("No se encontró ningún lote asociado a esta solicitud");
        }
        self.currentLotsRows = results.features;
        var codMznValues = self.currentLotsRows.map(function (i) {
          return i.attributes[_COD_MZN_FIELD];
        }).join(",");
        var codSectValues = self.currentLotsRows.map(function (i) {
          return i.attributes[_COD_SECT_FIELD];
        }).join(",");
        self.arancel = '(' + UtilityCase.ubigeoFieldName + ' = ' + paramsApp['ubigeo'] + ') and ' + _COD_MZN_FIELD + ' in (' + codMznValues + ') and ' + _COD_SECT_FIELD + ' in (' + codSectValues + ')';
        deferred.resolve(idLots);
      }).catch(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },
    _getPointLotsOriginals: function _getPointLotsOriginals(idLots) {
      var self = this;
      var LotCls = new UtilityCase.Lot();
      var deferred = new Deferred();
      var queryPointLots = new Query();
      queryPointLots.where = LotCls.idLotP + ' in (' + idLots.join(",") + ') and (' + UtilityCase.ubigeoFieldName + ' = ' + paramsApp['ubigeo'] + ')';
      queryPointLots.returnGeometry = true;
      queryPointLots.outFields = ["*"];
      var urlPointLots = self.layersMap.getLayerInfoById(idLyrCfLotesPun).getUrl();
      self.executeQueryTask(urlPointLots, queryPointLots).then(function (results) {
        if (results.features.length == 0) {
          throw new Error("No se encontró ningún punto lote asociado a esta solicitud");
        }
        self.currentPoinLotsRows = results.features;
        deferred.resolve(idLots);
      }).catch(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },
    _getLandsOriginalsTab: function _getLandsOriginalsTab(idSolicitud) {
      var self = this;
      var deferred = new Deferred();
      var urlOriginal = self.config.landsByApplicationUrl + '/' + idSolicitud;
      fetch(urlOriginal).then(function (response) {
        return response.json();
      }).then(function (response) {
        if (response.length == 0) {
          throw new Error(self.nls.errorGetLand);
        }
        self.currentLandTabRows = response.results;
        deferred.resolve(self.currentLandTabRows);
      }).catch(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },
    _getOriginalData: function _getOriginalData(idSolicitud) {
      var _this = this;

      return this._getLandsOriginalsTab(idSolicitud).then(function (landsTab) {
        return _this._getLandsOriginals();
      }).then(function (idLots) {
        return _this._getPointLotsOriginals(idLots);
      }).then(function (idLots) {
        return _this._getLotsOriginals(idLots);
      }).then(function (idLots) {
        return idLots;
      }).catch(function (error) {
        selfCm._showMessage(error.message, type = "error");
        // throw error;
      });
    },
    _zoomExtentToLote: function _zoomExtentToLote() {
      var unionPredios = this._unionFeatures(this.currentLotsRows.map(function (i) {
        return i.geometry;
      }));
      this.map.setExtent(unionPredios.getExtent().expand(2));
    },
    _zoomExtentToLoteRefactor: function _zoomExtentToLoteRefactor(cod_pre) {
      var query = new Query();

      query.where = _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\' and ' + _COD_PRE_FIELD + ' in (\'' + cod_pre.split(',').join("', '") + '\')';
      // fields return
      query.outFields = [_ID_LOTE_P_FIELD, _COD_MZN_FIELD, _COD_SECT_FIELD];
      query.returnGeometry = false;

      // Return distinct values
      query.returnDistinctValues = true;

      // let qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl())
      var urlPredios = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl();

      return selfCm.executeQueryTask(urlPredios, query).then(function (results) {
        var idLote = results.features.map(function (i) {
          return i.attributes[_ID_LOTE_P_FIELD];
        });
        // selfCm.idlotes = idLote;
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
        var urlLotes = selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
        // let qTaskLote = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl())
        selfCm.busyIndicator.hide();
        return selfCm.executeQueryTask(urlLotes, queryLote);
      }).then(function (results) {
        if (results.features.length == 0) {
          // execute error for catch
          throw new Error("No se encontró el lote seleccionado");
          // selfCm._showMessage("No se encontró el lote seleccionado", type = "error")
          // return
        }
        var unionPredios = selfCm._unionFeatures(results.features.map(function (i) {
          return i.geometry;
        }));

        selfCm.map.setExtent(unionPredios.getExtent().expand(2));

        var graphic = new Graphic(unionPredios, symbolLoteSelected);
        var featureSelected = new GraphicsLayer({
          id: idGraphicLoteSelectedCm
        });
        featureSelected.add(graphic);
        selfCm.map.addLayer(featureSelected);

        // Parpadeo de seleccion
        var interval = setInterval(function () {
          var graphic = featureSelected.graphics[0];
          graphic.setSymbol(graphic.symbol === symbolLoteSelected ? null : symbolLoteSelected);
        }, 200);

        setTimeout(function () {
          clearInterval(interval);
          selfCm._removeLayerGraphic(idGraphicLoteSelectedCm);
        }, 2000);
        selfCm.busyIndicator.hide();
        return selfCm.map.setExtent(unionPredios.getExtent().expand(2));
      }).catch(function (error) {
        console.log(error);
        selfCm.busyIndicator.hide();
        throw error;
      });
    },
    _zoomHomeRequests: function _zoomHomeRequests() {
      return selfCm._zoomExtentToLote();
    },
    _toggleBodyCaseInfo: function _toggleBodyCaseInfo(evt) {
      this.closest('.caseInfoClsCm').querySelector('.bodyPredInfoClsCm').classList.toggle('active');
    },
    _requestCaseInfo: function _requestCaseInfo(idSolicitud) {
      selfCm.busyIndicator.show();
      // const urlOriginal = `${selfCm.config.landsByApplicationUrl}/${idSolicitud}`
      var urlResults = selfCm.config.resultsByApplication + '/' + idSolicitud;
      var urlDocSupport = selfCm.config.applicationListUrl + '/' + selfCm.codRequestsCm;

      Promise.all([
      // fetch(urlOriginal).then(response => response.json()),
      selfCm._getOriginalData(idSolicitud), fetch(urlResults).then(function (response) {
        return response.json();
      }), fetch(urlDocSupport).then(function (response) {
        return response.json();
      })]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            _ = _ref2[0],
            responseResults = _ref2[1],
            responseDocSupport = _ref2[2];

        var rows = selfCm.currentLandTabRows.map(function (i) {
          return CaseInfo.contentCard(i, 'original', active = selfCm.case != 2 ? true : false);
        });

        if (selfCm.case != 4) {
          if (responseResults.results.length == 0) {
            // Escribir mensaje de error
            selfCm._showMessage('No existe registro de los predios resultantes en esta solicitud: ' + idSolicitud, type = "error");
            selfCm.busyIndicator.hide();
            return;
          }
        }

        dojo.query("#showInfoDocCm")[0].value = responseDocSupport.support;
        dojo.query('.CtnOriginalClsCm')[0].innerHTML = rows.join('');
        dojo.query(".zoomPredInfoClsCm").on('click', selfCm._zoomToPredSelectedEvt);

        if (selfCm.case != 4) {
          var rowsResults = responseResults.results.map(function (i) {
            return CaseInfo.contentCard(i, 'result');
          });
          dojo.query('.CtnResultClsCm')[0].innerHTML = rowsResults.join('');
          dojo.query('.lblResultsClsCm').addClass('active');
        } else {
          dojo.query('.CtnResultClsCm')[0].innerHTML = '';
          dojo.query('.lblResultsClsCm').removeClass('active');
        }

        dojo.query(".colapsePredInfoClsCm").on('click', selfCm._toggleBodyCaseInfo);

        selfCm.codigosPredios = selfCm.currentLandTabRows.map(function (i) {
          return i.cpm;
        }).join(',');
        selfCm.responseRequests = responseResults['results'];
      }).then(function () {
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
            selfCm.eliminacionApCm.classList.toggle('active');
            break;
          case "5":
            selfCm.independenceApCm.classList.toggle('active');
            selfCm.independenceApCm.innerHTML = '';
            LandAssignment.title = "Independización";
            LandAssignment.lands = selfCm.responseRequests;
            LandAssignment.pointLots = selfCm.currentPoinLotsRows;
            LandAssignment.map = selfCm.map;
            LandAssignment.landsSymbol = symbolPredio;
            LandAssignment.landsSymbolSelected = symbolPredioSelected2;
            // LandAssignment.graphicLayer = graphicLayerLandsByIndependence;
            LandAssignment.removeAllGraphics();
            selfCm.independenceApCm.appendChild(LandAssignment.renderTableLandAssignment());

            LandProcess.title = "Enviar datos";
            LandProcess.type = "independence";
            selfCm.independenceApCm.appendChild(LandProcess.renderButtonProcess());
            dojo.query('#' + LandProcess.id).on('click', selfCm._executeIndependenceLands);
            dojo.query(".pointLotSelectionCm").on('change', LandAssignment.selectedPointLots.bind(LandAssignment));
            dojo.query('.tableClsCm tr').on('mouseover', LandAssignment.highlightLand.bind(LandAssignment));
            dojo.query('.tableClsCm tr').on('mouseout', LandAssignment.reestartSymbolLand.bind(LandAssignment));
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
        selfCm._zoomExtentToLote();
        selfCm.busyIndicator.hide();
      }).catch(function (error) {
        selfCm.busyIndicator.hide();
        console.log(error);
      });

      // selfCm._zoomExtentToLote(selfCm.codigosPredios)
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

        selfCm.case = evt.currentTarget.value;
        selfCm._requestCaseInfo(selfCm.codRequestsCm);
      } else if (evt.currentTarget.id == 'backTrayCm' || evt.currentTarget.id == 'backTrayResultCm') {
        // desactivar el toolbarCm de edicion si esta activado
        toolbarCm.deactivate();

        // deshabilitar snapping
        selfCm.map.disableSnapping();
        selfCm.bodyTbLinesDvApCm.innerHTML = '';
        // selfCm.CtnPrediosDvApCm.style.display = 'none'
        selfCm.bodyTbPrediosDvApCm.innerHTML = '';

        dojo.query(".caseClsCm").removeClass("active");
        // remove all graphics layer if exist
        selfCm._removeLayerGraphic(idGraphicPredioCm);
        selfCm._removeLayerGraphic(idGraphicLoteCm);
        selfCm._removeLayerGraphic(idGraphicPuntoLote);
        selfCm._removeLayerGraphic(idGraphicFrenteLote);
        selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
        selfCm._removeLayerGraphic(idGraphicLabelCodLote);
        selfCm.bodyTbDatosLoteDvApCm.innerHTML = '';

        graphicLayerLineaDivision.clear();
        graphicLayerLabelLineaDivision.clear();
        graphicLayerPredioByDivison.clear();

        selfCm.lotesQuery = null;
        selfCm.arancel = null;
        selfCm.xy = [];

        selfCm.casesCtnApCm.classList.remove('active');
        selfCm.resultCtnApCm.classList.remove('active');
        selfCm.obsCtnApCm.classList.remove('active');
        selfCm.requestTrayApCm.classList.toggle('active');
        selfCm._removeClassActiveButton();
        selfCm._loadIniRequestsCm();
      }
    },
    _openFormObs: function _openFormObs() {
      selfCm.textAreaObsApCm.value = '';
      var imageDiv = dojo.query(".thumbnailClsCm")[0];
      selfCm.imgUploadApCm.value = '';
      imageDiv.style.backgroundImage = "none";
      imageDiv.innerHTML = "<span class=alignVCenter><i class='far fa-image'></i></span>";
      dojo.query('#headeRequestsCtnCm')[0].innerHTML = '<span class="alignVCenter">Solicitud: ' + selfCm.codRequestsCm + '</span>';
      selfCm.casesCtnApCm.classList.toggle("active");
      selfCm.obsCtnApCm.classList.toggle('active');
    },
    _FormResult: function _FormResult(id_solicitud, caseCm) {
      var urlPredioResults = selfCm.config.resultsByApplication + '/' + id_solicitud;
      selfCm._callApiRestServices(urlPredioResults, {}).then(function (response) {
        try {
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
            selfCm._removeClassActiveButton();
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
        selfCm._removeClassActiveButton();
        // desactiva el boton luego de dibujar
      }
      // check exist activeButton class in button
    },
    _removeClassActiveButton: function _removeClassActiveButton() {
      if (dojo.query('#' + selfCm.idButtonDrawActive).length > 0) {
        dojo.query('#' + selfCm.idButtonDrawActive)[0].classList.remove('activeButton');
      }
    },
    _removeLayerGraphic: function _removeLayerGraphic(layerId) {
      if (selfCm.map.graphicsLayerIds.includes(layerId)) {
        selfCm.map.removeLayer(selfCm.map.getLayer(layerId));
      }
    },
    _activateTool: function _activateTool(evt) {
      selfCm._removeClassActiveButton();
      selfCm.idButtonDrawActive = evt.currentTarget.id;
      dojo.query('#' + selfCm.idButtonDrawActive)[0].classList.add('activeButton');
      selfCm._activateSnappingByReasignar();
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      toolbarCm.activate(Draw["POINT"]);
    },
    _activateToolAcumulacion: function _activateToolAcumulacion(evt) {
      selfCm._removeClassActiveButton();
      var id = evt.currentTarget.id;
      selfCm.idPredioAcumulacion = id;
      selfCm.idButtonDrawActive = id;
      dojo.query('#' + selfCm.idButtonDrawActive)[0].classList.add('activeButton');
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._activateSnappingByAcumulacion();
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      toolbarCm.activate(Draw["POINT"]);
    },
    _activateToolLinesDivision: function _activateToolLinesDivision(evt) {
      selfCm._removeClassActiveButton();
      selfCm.idButtonDrawActive = evt.currentTarget.id;
      dojo.query('#' + selfCm.idButtonDrawActive)[0].classList.add('activeButton');
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._activateSnappingByDivision();
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);
      selfCm.bodyTbDatosLoteDvApCm.innerHTML = '';
      // selfCm.bodyTbPrediosDvApCm.innerHTML = ''
      graphicLayerPredioByDivison.clear();
      toolbarCm.activate(Draw["POLYLINE"]);
    },
    _activateSnappingByReasignar: function _activateSnappingByReasignar() {
      var cflayer = selfCm.layersMap.getLayerInfoById(idLyrCfLotesPun);
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
    _unionFeaturesAcumulation: function _unionFeaturesAcumulation() {
      // Creamos grafico de lote fusionado
      var graphicLayerLoteFusion = new GraphicsLayer({
        id: idGraphicLoteCm
      });
      // let arr = []
      // const polygonGeometry = selfCm.currentLotsRows[0].geometry;
      var arr = selfCm.currentLotsRows.map(function (i) {
        return i.geometry;
      });
      // for (let i of selfCm.currentLotsRows) {
      //   arr.push(i.geometry)
      // }
      var response = selfCm._unionFeatures(arr);
      var graphic = new Graphic(response, symbolFusionLote);

      graphicLayerLoteFusion.add(graphic);
      selfCm.map.addLayer(graphicLayerLoteFusion);
      selfCm.map.setExtent(graphic._extent.expand(1.5), true);
      return [response];
    },
    _ApplyAcumulationLotsRefactor: function _ApplyAcumulationLotsRefactor() {
      selfCm.busyIndicator.show();
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);

      if (!selfCm.lotesQuery) {
        selfCm._showMessage(selfCm.nls.errorGetLand, 'warning');
        selfCm.busyIndicator.hide();
        return;
      }

      return selfCm._getOriginalLots(selfCm.lotesQuery).then(function (originLots) {
        var geomLoteAcumulation = selfCm._unionFeaturesAcumulation();
        return selfCm._getMaxCodLot(geomLoteAcumulation);
      }).then(function (proprsLot) {
        selfCm._ordenarPoligonosNorteSur(proprsLot.polygons, parseInt(proprsLot.maxCodLote), selfCm.bodyTbDatosLoteFsApCm);
        selfCm.map.setExtent(proprsLot.polygons[0].getExtent().expand(1.5), true);
        return selfCm._addGraphicsPointLotsAndArancel();
      }).then(function () {
        selfCm._populateTablePredio(selfCm.bodyTbPrediosFsApCm, selfCm._activateToolAcumulacion);
        selfCm.busyIndicator.hide();
      }).catch(function (error) {
        console.log(error);
        selfCm.busyIndicator.hide();
        selfCm._showMessage(error.message, type = "error");
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
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var path = _step2.value;

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
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);
      graphicLayerPredioByDivison.clear();
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
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = response.results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var predio = _step3.value;

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
      selfCm._removeClassActiveButton();
      selfCm.idButtonDrawActive = evt.currentTarget.id;
      dojo.query('#' + selfCm.idButtonDrawActive)[0].classList.add('activeButton');
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
      // let id = evt.currentTarget.id.replace('loteUrbanoDv_', '');
      var id = evt.target.id.replace('loteUrbanoDv_', '');
      var lyr = selfCm.map.getLayer(idGraphicLabelCodLote);
      var graphic = lyr.graphics.filter(function (item) {
        return item.attributes.id == 'label_' + id;
      });
      graphic[0].attributes.lot_urb = evt.target.selectedOptions[0].value;
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

        var loteUrbCell = document.createElement('td');
        var loteUrbSelect = document.createElement('select');
        loteUrbSelect.className = "loteUrbSelectDvCls";
        loteUrbSelect.id = 'loteUrbanoDv_' + predio.num;
        selfCm.responseRequests.forEach(function (request, idx) {
          var option = document.createElement('option');
          option.value = request.urbanLotNumber;
          option.textContent = request.urbanLotNumber;
          loteUrbSelect.appendChild(option);
          if (predio.num == idx + 1) {
            option.selected = true;
          }
          // selected option by index predio.num
        });
        loteUrbCell.appendChild(loteUrbSelect);
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
      dojo.query('.loteUrbanoDvCls').on('change', selfCm._editLoteUrbanoDivision);
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
        var graphicLabel = new Graphic(pointLabel, txtSym, {
          id: idGraphic,
          lot_urb: selfCm.responseRequests[index].urbanLotNumber,
          clase: 'labelCodLoteDivision'
        });
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
    _getMaxCodLot: function _getMaxCodLot(polygonos) {
      var deferred = new Deferred();
      var estadisticaDef = new StatisticDefinition();
      estadisticaDef.statisticType = 'max';
      estadisticaDef.onStatisticField = _COD_LOTE_FIELD;
      estadisticaDef.outStatisticFieldName = "resultado";

      var query = new Query();
      query.where = selfCm.arancel;
      query.outFields = [_COD_LOTE_FIELD];
      query.returnGeometry = false;
      query.outStatistics = [estadisticaDef];

      var queryTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      queryTask.execute(query).then(function (result) {
        if (result.features.length > 0) {
          var maxCodLote = result.features[0].attributes.resultado;
          return deferred.resolve({
            maxCodLote: maxCodLote,
            polygons: polygonos
          });
        } else {
          return deferred.reject('No se encontraron lotes');
        }
      });
      return deferred.promise;
    },
    _getOriginalLots: function _getOriginalLots(query) {
      var selfCm = this;
      var deferred = new Deferred();
      var params = {
        where: query,
        returnGeometry: true,
        outFields: "*",
        outSR: 4326,
        f: "json"
      };

      var requestOptions = {
        url: selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl() + '/query',
        content: params,
        handleAs: "json",
        callbackParamName: "callback"
      };

      esriRequest(requestOptions, {
        usePost: true
      }).then(function (response) {
        selfCm.currentLotsRows = response.features;
        selfCm.currentLotsRows.forEach(function (row) {
          row.geometry = new Polygon({
            rings: row.geometry.rings,
            spatialReference: { wkid: 4326 }
          });
        });
        return deferred.resolve(selfCm.currentLotsRows);
      }, function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },
    _getPolylinesDrawn: function _getPolylinesDrawn() {
      var arr = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = graphicLayerLineaDivision.graphics[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var i = _step4.value;

          arr.push(i.geometry);
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

      var unionGraphicLayerLineaDivision = selfCm._unionFeatures(arr);

      var lineGeometry = new Polyline({
        paths: unionGraphicLayerLineaDivision.paths,
        spatialReference: { wkid: 102100 }
      });
      lineGeometry = esri.geometry.webMercatorToGeographic(lineGeometry);
      return lineGeometry;
    },
    _divideLotsByLines: function _divideLotsByLines() {
      // const geomLote = results.features[0].geometry
      if (selfCm.currentLotsRows.length == 0) {
        selfCm._showMessage(selfCm.nls.errorLotQuery, 'warning');
        return;
      }
      var lineGeometry = selfCm._getPolylinesDrawn();

      var polygonGeometry = selfCm.currentLotsRows[0].geometry;

      var geomLoteDivided = selfCm._dividePolygon(polygonGeometry, lineGeometry);

      if (geomLoteDivided.length == 0) {
        //  genera un mensage show indicando que no se encontro el lote
        selfCm._showMessage(selfCm.nls.errorDivideLot, type = 'error');
        return;
      }

      // Creamos grafico de lote fusionado
      var graphicLayerLoteDivision = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      // iterar sobre los graficos de la capa de division y agregar cada uno a graphicLayerLoteDivision
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = geomLoteDivided[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var i = _step5.value;

          var lote = new Graphic(i, symbolFusionLote);

          // agregar el grafico directo al mapa
          graphicLayerLoteDivision.add(lote);
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

      selfCm.map.addLayer(graphicLayerLoteDivision);
      return geomLoteDivided;
    },
    _addGraphicsPointLotsAndArancel: function _addGraphicsPointLotsAndArancel() {
      var deferred = new Deferred();
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
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = results.features[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var row = _step6.value;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
              for (var _iterator8 = graphicLoteDivision.graphics[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var graphic = _step8.value;

                var isItc = geometryEngine.intersects(row.geometry, graphic.geometry);
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

        console.log(frentes);
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = graphicLoteDivision.graphics[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var lote = _step7.value;

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

        selfCm.map.addLayer(graphicLayerFrenteLote);
        selfCm.map.addLayer(graphicLayerPuntoLote);
        selfCm._removeLayerGraphic(idGraphicPredioByDivison);
        selfCm.map.addLayer(graphicLayerPredioByDivison);
        deferred.resolve();
      });
      return deferred.promise;
    },
    _ApplyDivideLotesRefactor: function _ApplyDivideLotesRefactor() {
      selfCm.busyIndicator.show();
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);
      selfCm._removeLayerGraphic(idGraphicLabelCodLote);

      // Union all graphics of graphicslayer
      // let graphicLayerLineaDivision = selfCm.map.getLayer(idGraphicLineaDivision);
      if (graphicLayerLineaDivision.graphics.length == 0) {
        selfCm._showMessage('No se ha dibujado ninguna linea de division', 'warning');
        selfCm.busyIndicator.hide();
        return;
      }
      if (!selfCm.lotesQuery) {
        selfCm._showMessage(selfCm.nls.errorGetLand, 'warning');
        selfCm.busyIndicator.hide();
        return;
      }
      return selfCm._getOriginalLots(selfCm.lotesQuery).then(function (originLots) {
        var geomLoteDivided = selfCm._divideLotsByLines();
        return selfCm._getMaxCodLot(geomLoteDivided);
      }).then(function (proprsLot) {
        selfCm._ordenarPoligonosNorteSur(proprsLot.polygons, parseInt(proprsLot.maxCodLote), selfCm.bodyTbDatosLoteDvApCm);
        selfCm.map.reorderLayer(selfCm.map.getLayer(idGraphicLoteCm), selfCm.map.graphicsLayerIds.indexOf(graphicLayerLabelLineaDivision.id));
        selfCm.map.setExtent(selfCm.currentLotsRows[0].geometry.getExtent().expand(1.5), true);
        return selfCm._addGraphicsPointLotsAndArancel();
      }).then(function () {
        selfCm._populateTablePredio(selfCm.bodyTbPrediosDvApCm, selfCm._activateToolPrediosByDivision);
        selfCm.busyIndicator.hide();
      }).catch(function (error) {
        console.log(error);
        selfCm.busyIndicator.hide();
        selfCm._showMessage(error.message, type = "error");
      });
    },
    _executeReasignacionGpService: function _executeReasignacionGpService(evt) {
      if (!selfCm.xy.length) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se grafico la nueva ubicación del predio", type = "error");
        return;
      }
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          var _params = {
            "cod_pred": selfCm.codigosPredios,
            "ubigeo": paramsApp['ubigeo'],
            "geometry": selfCm.xy,
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm

            // revisar si alguna propiedad tiene valor nulo o indefinido
          };for (var key in _params) {
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
      if (!selfCm.lotesQuery) {
        selfCm._showMessage(selfCm.nls.errorGetLand, 'warning');
        selfCm.busyIndicator.hide();
        return;
      }
      if (!selfCm.map.getLayer(idGraphicLoteCm)) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se ha previsualizado la acumulación", type = "error");
        return;
      }

      if (!selfCm.xy.length) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se grafico el predio resultante", type = "error");
        return;
      }
      var labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote);

      selfCm._showMessageConfirm().then(function (result) {
        selfCm.busyIndicator.show();
        selfCm._addWarningMessageExecute();
        if (result) {
          var labelCodLotesLayerGraphic = labelCodLotesLayer.graphics;

          Acumulation.codRequests = selfCm.codRequestsCm;
          Acumulation.currentLotsRows = selfCm.currentLotsRows;

          Acumulation.attributes = labelCodLotesLayerGraphic.map(function (i) {
            return {
              codLot: i.symbol.text,
              lotUrb: i.attributes.lot_urb,
              coords: [i.geometry.x, i.geometry.y]
            };
          });

          Acumulation.newPointLotsGraphics = selfCm.map.getLayer(idGraphicPuntoLote).graphics;
          Acumulation.newLandsGraphics = selfCm.map.getLayer(idGraphicPredioCm).graphics;
          Acumulation.newLandsGraphics[0]['codPre'] = selfCm.idPredioAcumulacion.split("_")[2];
          Acumulation.landUrl = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl();
          Acumulation.pointLotUrl = selfCm.layersMap.getLayerInfoById(idLyrCfLotesPun).getUrl();
          Acumulation.lotUrl = selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
          Acumulation.arancelUrl = selfCm.layersMap.getLayerInfoById(idLyrCfArancel).getUrl();
          Acumulation.blockUrl = selfCm.layersMap.getLayerInfoById(idLyrCfManzanaUrb).getUrl();
          Acumulation.cadastralBlockUrl = selfCm.layersMap.getLayerInfoById(idLyrCfManzana).getUrl();
          Acumulation.config = selfCm.config;
          Acumulation.lotGraphic = selfCm.map.getLayer(idGraphicLoteCm).graphics;
          Acumulation.ubigeo = paramsApp['ubigeo'];
          Acumulation.user = paramsApp['username'];
          Acumulation.caseRequest = selfCm.case;

          Acumulation.executeAcumulation().then(function (response) {
            selfCm._removeLayerGraphic(idGraphicPredioCm);
            selfCm._removeLayerGraphic(idGraphicLoteCm);
            selfCm._removeLayerGraphic(idGraphicPuntoLote);
            selfCm._removeLayerGraphic(idGraphicFrenteLote);
            selfCm._removeLayerGraphic(idGraphicLabelCodLote);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(false);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(true);
            selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
            selfCm.busyIndicator.hide();
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage("Proceso completado satisfactoriamente", type = "success");
          }).catch(function (error) {
            console.log(error);
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage(error, type = "error");
            selfCm.busyIndicator.hide();
          });
        } else {
          selfCm.busyIndicator.hide();
          return;
        }
      });
    },
    _executeSubdivisionGpService: function _executeSubdivisionGpService(evt) {

      var layerLote = selfCm.map.getLayer(idGraphicLoteCm);

      if (!selfCm.lotesQuery) {
        selfCm._showMessage(selfCm.nls.errorGetLand, 'warning');
        selfCm.busyIndicator.hide();
        return;
      }

      if (!layerLote) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se ha previsualizado la subdivisión", type = "error");
        return;
      }

      if (graphicLayerPredioByDivison.graphics.length != layerLote.graphics.length) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se graficaron los predios resultantes", type = "error");
        return;
      }

      // Check if all labels have a value
      var labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote);
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = labelCodLotesLayer.graphics[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var pred = _step9.value;

          if (!pred.attributes.lot_urb || pred.attributes.lot_urb === "...") {
            selfCm._showMessage("Debe especificar los valores de Lote Urbano", type = "error");
            return;
          }
        }

        // Check if all lots have a land
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

      var checkLotsWithinLands = UtilityCase.checkLotsWithinLands(layerLote.graphics, graphicLayerPredioByDivison.graphics);
      if (!checkLotsWithinLands) {
        selfCm._showMessage("La solicitud no se puede realizar porque uno de los lotes no tiene un predio resultante", type = "error");
        return;
      }

      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          selfCm.busyIndicator.show();
          selfCm._addWarningMessageExecute();
          var labelCodLotesLayerGraphic = labelCodLotesLayer.graphics;

          SubDivision.blockUrl = selfCm.layersMap.getLayerInfoById(idLyrCfManzanaUrb).getUrl();
          SubDivision.lotUrl = selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl();
          SubDivision.pointLotUrl = selfCm.layersMap.getLayerInfoById(idLyrCfLotesPun).getUrl();
          SubDivision.arancelUrl = selfCm.layersMap.getLayerInfoById(idLyrCfArancel).getUrl();
          SubDivision.landUrl = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl();
          SubDivision.cadastralBlockUrl = selfCm.layersMap.getLayerInfoById(idLyrCfManzana).getUrl();
          SubDivision.currentLotsRows = selfCm.currentLotsRows;
          SubDivision.newPointLotsGraphics = selfCm.map.getLayer(idGraphicPuntoLote).graphics;
          SubDivision.newLandsGraphics = graphicLayerPredioByDivison.graphics;
          SubDivision.newLandsGraphics.forEach(function (i) {
            i['codPre'] = i.attributes.id.split("_")[2];
          });
          SubDivision.lotGraphic = layerLote.graphics;

          SubDivision.attributes = labelCodLotesLayerGraphic.map(function (i) {
            return {
              codLot: i.symbol.text,
              lotUrb: i.attributes.lot_urb,
              coords: [i.geometry.x, i.geometry.y]
            };
          });

          SubDivision.config = selfCm.config;
          SubDivision.ubigeo = paramsApp['ubigeo'];
          SubDivision.user = paramsApp['username'];
          SubDivision.caseRequest = selfCm.case;
          SubDivision.codRequests = selfCm.codRequestsCm;

          SubDivision.executeSubdivision().then(function (response) {
            graphicLayerPredioByDivison.clear();
            graphicLayerLineaDivision.clear();
            graphicLayerLabelLineaDivision.clear();
            selfCm._removeLayerGraphic(idGraphicLoteCm);
            selfCm._removeLayerGraphic(idGraphicPuntoLote);
            selfCm._removeLayerGraphic(idGraphicFrenteLote);
            selfCm._removeLayerGraphic(idGraphicLabelCodLote);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(false);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(true);
            selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
            selfCm.busyIndicator.hide();
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage("Proceso completado satisfactoriamente", type = "success");
          }).catch(function (error) {
            console.log(error);
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage(error, type = "error");
            selfCm.busyIndicator.hide();
          });
        } else {
          return;
        }
      });
    },
    _executeInactivarGpService: function _executeInactivarGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          // let labelCodLotesLayer = selfCm.map.getLayer(idGraphicLabelCodLote)
          var _params2 = {
            "ubigeo": paramsApp['ubigeo'],
            "cod_pred": selfCm.codigosPredios,
            "user": paramsApp['username'],
            "id_solicitud": selfCm.codRequestsCm
            // revisar si alguna propiedad tiene valor nulo o indefinido
          };for (var key in _params2) {
            if (_params2[key] == null || _params2[key] == undefined) {
              selfCm._showMessage('Debe especificar el valor de ' + key, type = "error");
              return;
            }
          }
          selfCm._executeGPService(selfCm.config.inactivacionUrl, _params2);
        } else {
          return;
        }
      });
    },
    _addWarningMessageExecute: function _addWarningMessageExecute() {
      var self = this;
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
      loadingText.innerHTML = self.nls.warningExecute;

      dojo.query("#dojox_widget_Standby_0")[0].appendChild(loadingText);
    },
    _removeWarningMessageExecute: function _removeWarningMessageExecute() {
      dojo.query("#loadingTextCustom")[0].remove();
    },
    _executeIndependenceLands: function _executeIndependenceLands(evt) {
      if (!LandAssignment.checkPointLotsSelected()) {
        selfCm._showMessage("La solicitud no se puede realizar porque no se selecciono la vía donde se ubica el predio", type = "error");
        return;
      }
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          selfCm.busyIndicator.show();
          selfCm._addWarningMessageExecute();
          Independence.codRequest = selfCm.codRequestsCm;
          Independence.cadastralBlockUrl = selfCm.layersMap.getLayerInfoById(idLyrCfManzana).getUrl();
          Independence.ubigeo = paramsApp['ubigeo'];
          Independence.user = paramsApp['username'];
          Independence.newLands = LandAssignment.lands;
          Independence.urlLands = selfCm.layersMap.getLayerInfoById(idLyrCfPredios).getUrl();
          Independence.matrixLand = selfCm.currentLandTabRows;
          Independence.config = selfCm.config;
          Independence.currentLotsRows = selfCm.currentLotsRows;
          Independence.caseRequest = selfCm.case;

          Independence.executeIndependence().then(function (response) {
            LandAssignment.removeAllGraphics();
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(false);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(true);
            selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
            selfCm.busyIndicator.hide();
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage("Proceso completado satisfactoriamente", type = "success");
          }).catch(function (error) {
            console.log(error);
            selfCm._removeWarningMessageExecute();
            selfCm._showMessage(error, type = "error");
            selfCm.busyIndicator.hide();
          });
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
      var textMessage = JobInfo.messages.map(function (message) {
        return message.description;
      });
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
            if (!result.value.status) {
              selfCm.busyIndicator.hide();
              selfCm._showMessage(result.value.message, type = "error");
              return;
            }

            selfCm._sendDataToPlatform(result.value.response);

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
                break;
              case "3":
                graphicLayerPredioByDivison.clear();
                graphicLayerLineaDivision.clear();
                graphicLayerLabelLineaDivision.clear();
                // selfCm._removeLayerGraphic(idGraphicPredioCm);
                selfCm._removeLayerGraphic(idGraphicLoteCm);
                selfCm._removeLayerGraphic(idGraphicPuntoLote);
                selfCm._removeLayerGraphic(idGraphicFrenteLote);
                selfCm._removeLayerGraphic(idGraphicLabelCodLote);
                break;
              case "4":
                // dojo.query(".tablinksCm.active")[0].click();
                // selfCm._loadIniRequestsCm()
                break;
              default:
                break;
            }
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(false);
            selfCm.map.getLayer(idLyrCatastroFiscal).setVisibility(true);
            if (selfCm.case == "4") {
              dojo.query(".backTrayClsCm")[0].click();
            } else {
              selfCm._FormResult(selfCm.codRequestsCm, selfCm.caseDescription);
            }
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
    _sendDataToPlatform: function _sendDataToPlatform(data) {
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = data.results[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var predio = _step10.value;

          predio['ubigeo'] = paramsApp.ubigeo;
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

      data['idType'] = parseInt(selfCm.case);
      fetch(selfCm.config.updateStatusApplication, {
        method: 'POST', // o 'PUT'
        body: JSON.stringify(data), // los datos pueden ser de tipo 'string' o {object}
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function (res) {
        return res.json();
      }).then(function (response) {
        return selfCm._showMessage('El proceso se completó satisfactoriamente.');
      })
      // .catch(error => console.error('Error:', error));
      .catch(function (error) {
        return selfCm._showMessage(error, type = "error");
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
        dojo.query(".tablinksCm.active")[0].click();
      }
    },
    _sortedByDate: function _sortedByDate(evt) {
      var columnOrder = evt.currentTarget.dataset.val;
      evt.currentTarget.dataset.val = columnOrder.includes('-') ? columnOrder.replace('-', '') : '-' + columnOrder;
      selfCm.queryRequests['ordering'] = evt.currentTarget.dataset.val;
      dojo.query(".tablinksCm.active")[0].click();
    },
    onOpen: function onOpen() {
      console.log('CartoMaintenanceWgt::onOpen');
      // let panel = this.getPanel();
      // panel.position.height = 700;
      // panel.setPosition(panel.position);
      // panel.panelManager.normalizePanel(panel);

      this._createToolbar();

      dojo.query(".backTrayClsCm").on('click', this._openFormCase);
      dojo.query(".tablinksCm").on('click', this._loadRequestsCm);
      dojo.query("#btnObsCaseCm").on('click', this._openFormObs);
      dojo.query(".backRequestsClsCm").on('click', this._openFormObs);
      // dojo.query("#goodRequestsCm").on('click', this._openFormResult);
      dojo.query("#showInfoDocCm").on('click', this._openSupportingDocument);

      // Reasignacion
      dojo.query("#btnDrawMarkerCm").on('click', this._activateTool);

      dojo.query("#btnFsCm").on('click', this._ApplyAcumulationLotsRefactor);
      dojo.query("#btnDrawLinesDvCm").on('click', this._activateToolLinesDivision);
      dojo.query("#btnApplyDvCm").on('click', this._ApplyDivideLotesRefactor);
      dojo.query("#titleCaseCm").on('click', this._zoomHomeRequests);
      dojo.query("#sendDataRsCm").on('click', this._executeReasignacionGpService);
      dojo.query('#sendDataFsCm').on('click', this._executeAcumulacionGpService);
      dojo.query('#sendDataDvCm').on('click', this._executeSubdivisionGpService);
      dojo.query('#sendDataDtCm').on('click', this._executeInactivarGpService);
      dojo.query('#btnReportCm').on('click', this._exportTableToExcel);
      dojo.query('#imgUploadCm').on('change', this._uploadImagenObs);
      dojo.query('#sendDataObsGrCm').on('click', this._sendObservation);
      dojo.query('#searchTbxCm').on("keyup", this._searchRequestByCodPred);
      dojo.query('.columnDateClsCm').on("click", this._sortedByDate);
      // dojo.query('.columnCaseClsCm').on("click", this._sortedByDate)
      this._loadIniRequestsCm();

      selfCm.map.addLayer(graphicLayerLabelLineaDivision);
      // selfCm.map.addLayer(graphicLayerLandsByIndependence)
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
