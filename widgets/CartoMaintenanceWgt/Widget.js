define(['dojo/_base/declare', 'jimu/BaseWidget', 'dijit/_WidgetsInTemplateMixin', "esri/toolbars/draw", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 'dojo/_base/Color', "esri/layers/GraphicsLayer", "esri/geometry/Point", "jimu/LayerInfos/LayerInfos", "dojo/_base/lang", "esri/layers/FeatureLayer", "esri/tasks/QueryTask", "esri/tasks/query", "jimu/WidgetManager", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "esri/geometry/webMercatorUtils", "esri/tasks/Geoprocessor", 'esri/dijit/util/busyIndicator', "jimu/dijit/LoadingShelter", "jimu/dijit/Message", "turf", "dojo/Deferred"], function (declare, BaseWidget, _WidgetsInTemplateMixin, Draw, Graphic, SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol, Color, GraphicsLayer, Point, LayerInfos, lang, FeatureLayer, QueryTask, Query, WidgetManager, geometryEngine, Polyline, webMercatorUtils, Geoprocessor, BusyIndicator, LoadingShelter, Message, turf, Deferred) {
  // import GeometryService from 'esri/tasks/GeometryService';

  // importar "jimu/dijit/LoadingShelter"

  // import Polygon from "esri/geometry/Polygon";
  var dataRequestsToAttendCm = [{ "case": "Reasignar", "caseId": 1, "cod_pre": "01-23-0009", "estado": "por_atender", "fec_solicitud": "10/112022", "id_solicitud": 1 }, { "case": "Acumulación", "caseId": 2, "cod_pre": "01-28-0009,01-28-0010", "estado": "por_atender", "fec_solicitud": "10/112022", "id_solicitud": 2 }, { "case": "División", "caseId": 3, "cod_pre": "01-23-0011", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 3 }, { "case": "Eliminación", "caseId": 5, "cod_pre": "15-16-0001", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 5 }, { "case": "Reasignar", "caseId": 1, "cod_pre": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 6 }, { "case": "Fusión", "caseId": 2, "cod_pre": "1376", "estado": "obaservado", "fec_solicitud": "10/11/2022", "id_solicitud": 7 }, { "case": "División", "caseId": 3, "cod_pre": "1376", "estado": "observado", "fec_solicitud": "10/11/2022", "id_solicitud": 8 }, { "case": "Eliminación", "caseId": 5, "cod_pre": "1376", "estado": "atendido", "fec_solicitud": "10/11/2022", "id_solicitud": 10 }];
  // importar "dojo/Deferred"

  // importar esri/geometry/webMercatorUtils

  // import keys from 'dojo/keys';

  var dataByRequest = {
    "1": [{ "cod_pre": "01-23-0009", "x": -79.739827, "y": -6.643564, "direccion": "Av. Los Jazmines 123", "num_alt": 567, "sec_eje": "Sección 1", "cod_cuc": "ABC123" }],
    "2": [{ "cod_pre": "01-28-0009", "x": -67.89, "y": -12, "direccion": "Calle Las Rosas 456", "num_alt": 789, "sec_eje": "Sección 2", "cod_cuc": "DEF456" }, { "cod_pre": "01-28-0010", "x": 345.67, "y": 89.01, "direccion": "Jr. Los Girasoles 789", "num_alt": 234, "sec_eje": "Sección 3", "cod_cuc": "GHI789" }],
    "3": [{ "cod_pre": "01-23-0011", "x": -67.89, "y": -12, "direccion": "Calle Las Rosas 456", "num_alt": 789, "sec_eje": "Sección 2", "cod_cuc": "DEF456" }],
    "5": [{ "cod_pre": "15-16-0001", "x": -67.89, "y": -12, "direccion": "Jr. Los Girasoles 789", "num_alt": 234, "sec_eje": "Sección 3", "cod_cuc": "GHI789" }]
  };

  var requestToAttendState = "por_atender";
  var requestsObservedState = "observado";
  var requestsAttendState = "atendido";

  // Layers ids
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
    "por_atender": { 'icon': 'fas fa-pencil-alt', 'id': 'editRequestsCm' },
    "observado": { 'icon': 'fas fa-pause', 'id': 'obsRequestsCm' },
    "atendido": { 'icon': 'fas fa-check', 'id': 'goodRequestsCm' }

    // Fields 
  };var _UBIGEO_FIELD = "UBIGEO";
  var _ID_LOTE_P_FIELD = "ID_LOTE_P";
  var _COD_MZN_FIELD = "COD_MZN";
  var _F_MZN_FIELD = "F_MZN";
  var _COD_SECT_FIELD = "COD_SECT";
  var _COD_PRE_FIELD = "COD_PRE";

  var samplePdf = "https://www.africau.edu/images/default/sample.pdf";

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

  var symbolPuntoLote = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 92, 230, 0.75]));

  var symbolFusionLote = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

  var symbolEliminarLote = new SimpleFillSymbol(SimpleFillSymbol.STYLE_DIAGONAL_CROSS, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([100, 100, 100]), 2), new Color([229, 229, 229, 0.9]));

  var symbolLoteSelected = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.75]), 4), new Color([0, 255, 0, 0]));

  var symbolDivisionLote = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2);

  var symbolPredio = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([235, 69, 95, 0.75]));

  var symbolPredioSelected = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 4), new Color([0, 255, 0, 0]));

  var symbolSnapPointCm = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));

  // Identificadores de graficos
  var idGraphicPredioCm = "graphicPredioCm2";
  var idGraphicPredioSelectedCm = "graphicPredioCm2";
  var idGraphicLoteCm = "graphicLoteCm";
  var idGraphicLoteSelectedCm = "graphicLoteSelectedCm";
  var idGraphicPuntoLote = "graphicPuntoLote";
  var idGraphicFrenteLote = "graphicFrenteLote";
  var idGraphicLineaDivision = "graphicLineaDivision";
  var idGraphicLoteDeleteCm = "graphicLoteDeleteCm";

  // symbol by case
  var symbolByCase = {
    "1": { "symbol": symbolPredio },
    "2": { "symbol": symbolPredio },
    "3": { "symbol": symbolPredio }

    // graphicsLayer main
  };var graphicLayerLineaDivision = new GraphicsLayer({
    id: idGraphicLineaDivision
  });

  // To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'carto-maintenance-wgt',
    codRequestsCm: null,
    layersMap: [],
    queryUbigeo: paramsApp['ubigeo'] ? _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\'' : "1=1",
    case: 0,
    lotesQuery: null,
    idlotes: null,
    arancel: null,
    codigosPredios: null,
    xy: [],

    postCreate: function postCreate() {
      this.inherited(arguments);
      console.log('CartoMaintenanceWgt::postCreate');
      this._getAllLayers();
      selfCm = this;
      this._filterByDistrictCm();
      this._startExtentByDistrictCm();
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
      selfCm.layersMap.getLayerInfoById(idLyrCfPredios).setFilter(selfCm.queryUbigeo);
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
      // crear el objeto LoadingShelter

      this.loading = new LoadingShelter({
        hidden: true, // Ocultar el widget cuando se crea
        message: "Cargando...", // Mensaje de carga personalizado
        useIcon: true // Mostrar un icono de carga en lugar del mensaje de carga
        // target: this.domNode.parentNode.parentNode.parentNode,
      });

      this.loading.placeAt(this.domNode.parentNode.parentNode.parentNode);
      this.loading.startup();
      // this.busyIndicator = BusyIndicator.create({
      //   target: this.domNode.parentNode.parentNode.parentNode,
      //   backgroundOpacity: 0
      // });
    },
    _getRequestsTrayDataCm: function _getRequestsTrayDataCm(state) {
      // Reemplazar todo el metodo para capturar datos de servicio
      var data = dataRequestsToAttendCm.filter(function (i) {
        return i.estado == state;
      });
      return data;
    },
    _loadIniRequestsCm: function _loadIniRequestsCm() {
      dojo.query('#' + requestToAttendState)[0].click();
    },
    _loadRequestsCm: function _loadRequestsCm(evt) {
      var data = selfCm._getRequestsTrayDataCm(evt.target.id);
      var dataHtml = data.map(function (i) {
        return '<tr>\n                                      <td>' + i.id_solicitud + '</td>\n                                      <td>' + i.case + '</td>\n                                      <td>' + i.cod_pre + '</td>\n                                      <td>' + i.fec_solicitud + '</td>\n                                      <td>\n                                        <button id="' + iconByState[i.estado].id + '" value="' + i.caseId + '" class="stateRequestClsCm">\n                                          <i class="' + iconByState[i.estado].icon + '"></i>\n                                        </button>\n                                      </td>\n                                    </tr>';
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

      dojo.query(".tablinksCm").removeClass("active");
      evt.target.classList.add("active");
    },
    _zoomToPredSelected: function _zoomToPredSelected(evt) {
      selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
      var cod_pred = evt.currentTarget.children[0].innerHTML.split(': ')[1];
      var prediosLayer = selfCm.layersMap.getLayerInfoById(idLyrCfPredios);
      var propertyLayer = new FeatureLayer(prediosLayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      // crear una consulta para seleccionar la fila deseada
      var query = new Query();
      query.where = _COD_PRE_FIELD + ' = \'' + cod_pred + '\'';
      // console.log(query.where)

      // propertyLayer.setSelectionSymbol(symbolPredioSelected);
      // seleccionar la fila
      propertyLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
        var featureSelected = new GraphicsLayer({
          id: idGraphicPredioSelectedCm
        });
        featureSelected.add(results[0]);
        selfCm.map.addLayer(featureSelected);
        // selfCm.map.centerAt(results[0].geometry);

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
    _openSupportingDocument: function _openSupportingDocument() {
      window.open(samplePdf, '_blank').focus();
    },
    _zoomExtentToLote: function _zoomExtentToLote(cod_pre) {
      var query = new Query();

      query.where = _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\' and ' + _COD_PRE_FIELD + ' in (\'' + cod_pre.split(',').join("', '") + '\')';
      console.log(query.where);
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
    _getDataPredioByRequests: function _getDataPredioByRequests(id_solicitud) {
      // get data predio by id_solicitud
      var data = dataByRequest[id_solicitud];
      console.log(data);
      return data;
    },
    _populateFormsByPredio: function _populateFormsByPredio(id_solicitud) {
      var rows = selfCm._getDataPredioByRequests(id_solicitud).map(function (i) {
        return '<div class="caseInfoClsCm">\n        <div class="headPredInfoClsCm">\n          <span class="alignVCenter">Predio: ' + i.cod_pre + '</span>\n        </div>\n        <div class="bodyPredInfoClsCm">\n          <label for="direccion">Direcci\xF3n:</label>\n          <input type="text" id="direccion" name="direccion" value="' + i.direccion + '" readonly>\n          <div class="coordsCtnClsCm">\n            <div class="coordClsCm">\n              <label for="latitud">Latitud:</label>\n              <input type="number" value=' + i.y + ' name="latitud" readonly>\n            </div>\n            <div class="coordClsCm">\n              <label for="longitud">Longitud:</label>\n              <input type="number" value=' + i.x + ' name="longitud" readonly>\n            </div>\n          </div>\n        </div>\n      </div>';
      });
      // console.log(rows.join(''))
      dojo.query('.CtnPredInfoClsCm')[0].innerHTML = rows.join('');
      dojo.query(".headPredInfoClsCm").on('click', selfCm._zoomToPredSelected);
    },
    _openFormCase: function _openFormCase(evt) {
      if (evt.currentTarget.id == "editRequestsCm") {
        var row = dojo.query(evt.currentTarget).closest("tr")[0];
        var rowList = dojo.query("td", row).map(function (td) {
          return td.innerHTML;
        });
        selfCm.codRequestsCm = rowList[0];
        dojo.query('#titleCaseCm')[0].innerHTML = '<span>' + rowList[1] + ' <span class="fa fa-search" style="font-size: 15px"></span></span>';
        selfCm._populateFormsByPredio(selfCm.codRequestsCm);
        // dojo.query('.codPredClsCm')[0].innerHTML = `<span class="alignVCenter">Predios: ${rowList[2]}</span>`
        // dojo.query('.headPredInfoClsCm')[0].innerHTML = `<span class="alignVCenter">Predio: ${rowList[2]}</span>`

        selfCm.codigosPredios = rowList[2];
        selfCm._zoomHomeRequests();
      } else if (evt.currentTarget.id == 'backTrayCm') {
        // desactivar el toolbarCm de edicion si esta activado
        // toolbarCm.deactivate()
        toolbarCm.deactivate();

        // deshabilitar snapping
        selfCm.map.enableSnapping({
          snapPoint: false,
          snapLine: false,
          snapPolygon: false
        });

        dojo.query(".caseClsCm").removeClass("active");
        // remove all graphics layer if exist
        selfCm._removeLayerGraphic(idGraphicPredioCm);
        selfCm._removeLayerGraphic(idGraphicLoteCm);
        selfCm._removeLayerGraphic(idGraphicPuntoLote);
        selfCm._removeLayerGraphic(idGraphicFrenteLote);
        selfCm._removeLayerGraphic(idGraphicPredioSelectedCm);
        // selfCm._removeLayerGraphic(idGraphicLineaDivision)
        graphicLayerLineaDivision.clear();
        selfCm.lotesQuery = null;
        selfCm.arancel = null;
        selfCm.xy = null;
      }

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
      selfCm.casesCtnApCm.classList.toggle('active');
      selfCm.requestTrayApCm.classList.toggle('active');
    },
    _openFormObs: function _openFormObs() {
      // console.log('aqui')
      dojo.query('#headeRequestsCtnCm')[0].innerHTML = '<span class="alignVCenter">Solicitud: ' + selfCm.codRequestsCm + '</span>';
      selfCm.casesCtnApCm.classList.toggle("active");
      selfCm.obsCtnApCm.classList.toggle('active');
    },
    _createToolbar: function _createToolbar() {
      toolbarCm = new Draw(selfCm.map);
      toolbarCm.on("draw-end", selfCm._addToMap);
    },
    _addToMap: function _addToMap(evt) {
      // let area;
      // console.log(evt.geometry)
      if (evt.geometry.type === "point") {
        var screenPoint = selfCm.map.toScreen(evt.geometry);
        var deferred = selfCm.map.snappingManager.getSnappingPoint(screenPoint);
        deferred.then(function (value) {
          if (value !== undefined) {
            var graphic = new Graphic(value, symbolByCase[selfCm.case].symbol);
            var graphicLayer = new GraphicsLayer({
              id: idGraphicPredioCm
            });
            graphicLayer.add(graphic);
            selfCm.map.addLayer(graphicLayer);
            selfCm.map.setInfoWindowOnClick(true);
            toolbarCm.deactivate();
            // si es el caso reasignacion de predio
            if (selfCm.case == 1 || selfCm.case == 2) {
              // obtener las coordenadas x, y del punto
              var p4326 = webMercatorUtils.webMercatorToGeographic(new Point(value));
              selfCm.xy = [p4326.x, p4326.y];
            }
          } else {
            alert(selfCm.nls.errorSnapingLocate);
          }
        }, function (error) {
          console.log(error);
        });
      } else if (evt.geometry.type === "polyline") {
        var graphic = new Graphic(evt.geometry, symbolDivisionLote);
        graphicLayerLineaDivision.add(graphic);
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
    _activateToolAcumulacion: function _activateToolAcumulacion() {
      selfCm.map.setInfoWindowOnClick(false);
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      toolbarCm.activate(Draw["POINT"]);
    },
    _activateToolLinesDivision: function _activateToolLinesDivision() {
      selfCm.map.setInfoWindowOnClick(false);
      // selfCm._removeLayerGraphic(idGraphicLineaDivision);
      selfCm._activateSnappingByDivision();
      toolbarCm.activate(Draw["POLYLINE"]);
    },
    _locateMarker: function _locateMarker(evt) {
      var x = document.getElementsByName("longitud")[0].value;
      var y = document.getElementsByName("latitud")[0].value;
      var geom = new Point(parseFloat(x), parseFloat(y));
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      var graphic = new Graphic(geom, symbolPuntoLote);
      var graphicLayer = new GraphicsLayer({
        id: idGraphicPredioCm
      });
      graphicLayer.add(graphic);
      selfCm.map.addLayer(graphicLayer);
      selfCm.map.centerAt(geom);
      selfCm.map.setInfoWindowOnClick(true);
      selfCm.xy = [parseFloat(x), parseFloat(y)];
    },
    _activateSnappingByReasignar: function _activateSnappingByReasignar() {
      var cflayer = selfCm.layersMap.getLayerInfoById(idLyrCfLotes_pun);
      var propertyLayer = new FeatureLayer(cflayer.getUrl(), {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      var snapManager = selfCm.map.enableSnapping({
        alwaysSnap: true,
        // snapKey: keys.CTRL,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 100
      });
      // get layerinfo by id of layer to snap
      var layerInfos = [{
        layer: propertyLayer
      }];

      snapManager.setLayerInfos(layerInfos);
    },
    _activateSnappingByAcumulacion: function _activateSnappingByAcumulacion(graphiclayer) {
      var graphicsLayerInfo = new esri.layers.LayerInfo({
        id: graphiclayer.id, // El id del `GraphicsLayer`
        name: graphiclayer.name, // El nombre del `GraphicsLayer`
        layer: graphiclayer // El `GraphicsLayer` a utilizar
      });

      // Agregar el `LayerInfo` al mapa y habilitar el snapping
      selfCm.map.enableSnapping({
        layerInfos: [graphicsLayerInfo], // Agregar el `LayerInfo` al mapa
        alwaysSnap: true,
        snapPointSymbol: symbolSnapPointCm,
        tolerance: 100
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
        alwaysSnap: true,
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
        selfCm.map.setExtent(graphic._extent, true);
      }).then(function () {
        var query = new Query();
        // query.where = `${_UBIGEO_FIELD} = '${paramsApp.ubigeo}' and ${_COD_MZN_FIELD} = '040' and ${_COD_SECT_FIELD} = '04'`
        // console.log(selfCm.arancel)
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
          selfCm._activateSnappingByAcumulacion(graphicLayerPuntoLote);
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
    _ApplyDivideLotes: function _ApplyDivideLotes() {
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);

      // Creamos grafico de lote fusionado
      var graphicLayerLoteDivision = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      // Union all graphics of grpahicslayer
      // let graphicLayerLineaDivision = selfCm.map.getLayer(idGraphicLineaDivision);
      var arr = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = graphicLayerLineaDivision.graphics[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var i = _step6.value;

          arr.push(i.geometry);
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
        // console.log(geomLoteDivided)
        // iterar sobre los graficos de la capa de division y agregar cada uno a graphicLayerLoteDivision
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = geomLoteDivided[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var i = _step7.value;

            var lote = new Graphic(i, symbolFusionLote);

            // agregar el grafico directo al mapa
            graphicLayerLoteDivision.add(lote);
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

        selfCm.map.addLayer(graphicLayerLoteDivision);
        // console.log(graphicLayerLoteDivision._extent)
        selfCm.map.setExtent(results.features[0].geometry.getExtent().expand(1.5), true);
      }).then(function () {
        var query = new Query();
        // query.where = `${_UBIGEO_FIELD} = '${paramsApp.ubigeo}' and ${_COD_MZN_FIELD} = '040' and ${_COD_SECT_FIELD} = '04'`
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
          var graphicLayerPredio = new GraphicsLayer({
            id: idGraphicPredioCm
          });
          var graphicLoteDivision = selfCm.map.getLayer(idGraphicLoteCm);
          var frentes = {};
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = results.features[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var row = _step8.value;
              var _iteratorNormalCompletion10 = true;
              var _didIteratorError10 = false;
              var _iteratorError10 = undefined;

              try {
                for (var _iterator10 = graphicLoteDivision.graphics[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                  var graphic = _step10.value;

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

          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = graphicLoteDivision.graphics[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var lote = _step9.value;

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

                var puntoPredio = new Graphic(puntoLote, symbolPredio);
                graphicLayerPredio.add(puntoPredio);
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

          selfCm.map.addLayer(graphicLayerFrenteLote);
          selfCm.map.addLayer(graphicLayerPuntoLote);
          selfCm.map.addLayer(graphicLayerPredio);
        });
      }, function (err) {
        console.log(err);
      });
    },
    _applyDeleteLote: function _applyDeleteLote() {
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      selfCm._removeLayerGraphic(idGraphicLoteDeleteCm);

      // Creamos grafico de lote fusionado
      var graphicLayerLoteDelete = new GraphicsLayer({
        id: idGraphicLoteDeleteCm
      });

      var query = new Query();
      // query.where = `(${_UBIGEO_FIELD} = '${paramsApp.ubigeo}') and (${_ID_LOTE_P_FIELD} in (3229))`
      query.where = selfCm.lotesQuery;
      query.outFields = ["*"];
      query.returnGeometry = true;
      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      qTask.execute(query, function (results) {
        var geomLote = results.features[0].geometry;
        var lote = new Graphic(geomLote, symbolEliminarLote);
        graphicLayerLoteDelete.add(lote);
        selfCm.map.addLayer(graphicLayerLoteDelete);
        selfCm.map.setExtent(geomLote.getExtent().expand(1.5), true);
      });
    },
    _executeReasignacionGpService: function _executeReasignacionGpService(evt) {
      selfCm._showMessageConfirm().then(function (result) {
        if (result) {
          var _params = {
            "cod_pred": selfCm.codigosPredios,
            "ubigeo": paramsApp['ubigeo'],
            "geometry": selfCm.xy,
            "user": paramsApp['username']
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
          var _params2 = {
            "lotes_orig": selfCm.idlotes,
            "ubigeo": paramsApp['ubigeo'],
            "lote_geom": JSON.stringify(selfCm.map.getLayer("graphicLoteCm").graphics[0].geometry.toJson()),
            "lote_pun_geon": JSON.stringify(selfCm.map.getLayer("graphicPuntoLote").graphics.map(function (i) {
              return [i.geometry.x, i.geometry.y];
            })),
            "predio_geom": selfCm.xy,
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
      // console.log(JSON.stringify(selfCm.idlotes))
      // console.log(paramsApp['ubigeo'])
      // console.log(JSON.stringify(selfCm.map.getLayer("graphicLoteCm").graphics[0].geometry.toJson()))
      // console.log(JSON.stringify(selfCm.map.getLayer("graphicPuntoLote").graphics.map((i) => {return [i.geometry.x, i.geometry.y]})))
      // console.log(JSON.stringify(selfCm.xy))
      // console.log(paramsApp['username'])
      // console.log(selfCm.codRequestsCm)

      // selfCm._showMessageConfirm().then(function (result) {
      //   if (result){
      //     let params = {
      //       "cod_pred": selfCm.codigosPredios,
      //       "ubigeo": paramsApp['ubigeo'],
      //       "geometry": selfCm.xy,
      //       "user": paramsApp['username']
      //     }
      //     console.log(params)

      //     // revisar si alguna propiedad tiene valor nulo o indefinido
      //     for (let key in params){
      //       if (params[key] == null || params[key] == undefined){
      //         selfCm._showMessage(`Debe especificar el valor de ${key}`, type="error");
      //         return
      //       }
      //     }
      //     // selfCm._executeGPService(selfCm.config.reasignacionUrl, params)
      //   }
      //   else {
      //     return
      //   }
      // })
    },
    _executeGPService: function _executeGPService(url, params) {
      selfCm.loading.show();

      selfCm.gp = new Geoprocessor(url);
      selfCm.gp.submitJob(params, selfCm._completeCallback, selfCm._statusCallback);
    },
    _statusCallback: function _statusCallback(JobInfo) {
      // console.log(JobInfo)
      selfCm.jobId = JobInfo.jobId;
      // get last item of JobInfo.messages
      console.log(JobInfo.jobStatus);
      var textMessage = JobInfo.messages.map(function (message) {
        return message.description;
      });
      selfCm.loading.textNode.style.textShadow = "2px 2px 0 #FFF, -2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF";
      selfCm.loading.textNode.innerHTML = textMessage.slice(-1)[0] ? textMessage.slice(-1)[0] : '';
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
              selfCm.loading.hide();
              selfCm._showMessage(result.value.message, type = "error");
              return;
            }
            switch (selfCm.case) {
              case "1":
                selfCm._removeLayerGraphic(idGraphicPredioCm);
                dojo.query("#titleCaseCm")[0].click();
                break;
              case "2":
                selfCm._removeLayerGraphic(idGraphicPredioCm);
                selfCm._removeLayerGraphic(idGraphicLoteCm);
                selfCm._removeLayerGraphic(idGraphicPuntoLote);
                selfCm._removeLayerGraphic(idGraphicFrenteLote);
                selfCm.map.getLayer("CARTO_FISCAL_6806").setVisibility(false);
                selfCm.map.getLayer("CARTO_FISCAL_6806").setVisibility(true);
              default:
                break;
            }
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
      selfCm.loading.hide();
    },
    _cancelProcess: function _cancelProcess(evt) {
      selfCm.gp.cancelJob(selfCm.jobId, function (info) {
        console.log(info.jobStatus);
      });
    },
    onOpen: function onOpen() {
      console.log('CartoMaintenanceWgt::onOpen');
      var panel = this.getPanel();
      // panel.position.width = 400;
      panel.position.height = 750;
      panel.setPosition(panel.position);
      panel.panelManager.normalizePanel(panel);

      this._createToolbar();
      // selfCm.map.addLayer(graphicLayerLineaDivision);
      // this._activateSnapping();

      dojo.query(".backTrayClsCm").on('click', this._openFormCase);
      dojo.query(".tablinksCm").on('click', this._loadRequestsCm);
      dojo.query("#btnObsCaseCm").on('click', this._openFormObs);
      dojo.query(".backRequestsClsCm").on('click', this._openFormObs);
      dojo.query("#showInfoDocCm").on('click', this._openSupportingDocument);

      dojo.query('#btnDrawMarkerFsCm').on('click', this._activateToolAcumulacion);

      // Reasignacion
      dojo.query("#btnAddMarkerCm").on('click', this._locateMarker);
      dojo.query("#btnDrawMarkerCm").on('click', this._activateTool);

      dojo.query("#btnFsCm").on('click', this._ApplyAcumulacionLotes);
      dojo.query("#btnDrawLinesDvCm").on('click', this._activateToolLinesDivision);
      dojo.query("#btnApplyDvCm").on('click', this._ApplyDivideLotes);
      dojo.query("#btnEliminarLoteCm").on('click', this._applyDeleteLote);
      dojo.query("#titleCaseCm").on('click', this._zoomHomeRequests);
      dojo.query("#sendDataRsCm").on('click', this._executeReasignacionGpService);
      dojo.query('#sendDataFsCm').on('click', this._executeAcumulacionGpService);
      this._loadIniRequestsCm();
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
