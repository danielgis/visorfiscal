define(['dojo/_base/declare', 'jimu/BaseWidget', 'dijit/_WidgetsInTemplateMixin', "esri/toolbars/draw", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 'dojo/_base/Color', "esri/layers/GraphicsLayer", "esri/geometry/Point", "jimu/LayerInfos/LayerInfos", "dojo/_base/lang", "esri/layers/FeatureLayer", "esri/tasks/QueryTask", "esri/tasks/query", "jimu/WidgetManager", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "turf"], function (declare, BaseWidget, _WidgetsInTemplateMixin, Draw, Graphic, SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol, Color, GraphicsLayer, Point, LayerInfos, lang, FeatureLayer, QueryTask, Query, WidgetManager, geometryEngine, Polyline, turf) {
  // import Polygon from "esri/geometry/Polygon";
  var dataRequestsToAttendCm = [{ "case": "Reasignar", "caseId": 1, "cod_preds": "673", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 1 }, { "case": "Acumulación", "caseId": 2, "cod_preds": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 2 }, { "case": "División", "caseId": 3, "cod_preds": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 3 }, { "case": "Act. geométrica", "caseId": 4, "cod_preds": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 4 }, { "case": "Eliminación", "caseId": 5, "cod_preds": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 5 }, { "case": "Reasignar", "caseId": 1, "cod_preds": "1376", "estado": "por_atender", "fec_solicitud": "10/11/2022", "id_solicitud": 6 }, { "case": "Fusión", "caseId": 2, "cod_preds": "1376", "estado": "obaservado", "fec_solicitud": "10/11/2022", "id_solicitud": 7 }, { "case": "División", "caseId": 3, "cod_preds": "1376", "estado": "observado", "fec_solicitud": "10/11/2022", "id_solicitud": 8 }, { "case": "Act. geométrica", "caseId": 4, "cod_preds": "1376", "estado": "atendido", "fec_solicitud": "10/11/2022", "id_solicitud": 9 }, { "case": "Eliminación", "caseId": 5, "cod_preds": "1376", "estado": "atendido", "fec_solicitud": "10/11/2022", "id_solicitud": 10 }];
  // import keys from 'dojo/keys';

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

  var symbolDivisionLote = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 2);

  // const symbolPuntoLote = new SimpleMarkerSymbol(
  //   SimpleMarkerSymbol.STYLE_CIRCLE,
  //   30,
  //   new SimpleLineSymbol(
  //     SimpleLineSymbol.STYLE_SOLID,
  //     new Color([0, 86, 211]),
  //     1
  //   ),
  //   new Color([0, 255, 0, 0.25])
  // )

  var symbolPredio = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([235, 69, 95, 0.75]));

  var symbolSnapPointCm = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 20, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));

  // Identificadores de graficos
  var idGraphicPredioCm = "graphicPredioCm2";
  var idGraphicLoteCm = "graphicLoteCm";
  var idGraphicPuntoLote = "graphicPuntoLote";
  var idGraphicFrenteLote = "graphicFrenteLote";
  var idGraphicLineaDivision = "graphicLineaDivision";

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
    queryUbigeo: _UBIGEO_FIELD + ' = \'' + paramsApp['ubigeo'] + '\'',
    case: 0,

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
          var nextScale = selfCm.map.getScale() * 1.5;
          // set the map scale to the next scale value
          selfCm.map.setScale(nextScale).then(function () {
            var homeWidget = WidgetManager.getInstance().getWidgetsByName("HomeButton");
            homeWidget[0].homeDijit.extent = selfCm.map.extent;
          });
        });
      }, function (error) {
        console.log(error);
      });
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
        return '<tr>\n                                      <td>' + i.id_solicitud + '</td>\n                                      <td>' + i.case + '</td>\n                                      <td>' + i.cod_preds + '</td>\n                                      <td>' + i.fec_solicitud + '</td>\n                                      <td>\n                                        <button id="' + iconByState[i.estado].id + '" value="' + i.caseId + '" class="stateRequestClsCm">\n                                          <i class="' + iconByState[i.estado].icon + '"></i>\n                                        </button>\n                                      </td>\n                                    </tr>';
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
      var idPred = evt.currentTarget.childNodes[1].childNodes[0].innerHTML.split(": ")[1];
    },
    _openSupportingDocument: function _openSupportingDocument() {
      window.open(samplePdf, '_blank').focus();
    },
    _openFormCase: function _openFormCase(evt) {
      var row = dojo.query(evt.currentTarget).closest("tr")[0];
      var rowList = dojo.query("td", row).map(function (td) {
        return td.innerHTML;
      });
      selfCm.codRequestsCm = rowList[0];
      dojo.query('#titleCaseCm')[0].innerHTML = '<span>' + rowList[1] + '</span>';

      dojo.query('.codPredClsCm')[0].innerHTML = '<span class="alignVCenter">Predios: ' + rowList[2] + '</span>';

      // console.log(evt.target)

      dojo.query(".caseClsCm").removeClass("active");
      selfCm.case = evt.currentTarget.value;
      switch (evt.currentTarget.value) {
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

      // desactivar el toolbarCm de edicion si esta activado
      // toolbarCm.deactivate()
      toolbarCm.deactivate();

      // deshabilitar snapping
      selfCm.map.enableSnapping({
        snapPoint: false,
        snapLine: false,
        snapPolygon: false
      });

      // remove all graphics layer if exist
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);
      // selfCm._removeLayerGraphic(idGraphicLineaDivision)
      graphicLayerLineaDivision.clear();

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
          } else {
            alert('La ubicación donde desea registrar el predio no es valida, este se debe ubicar sobre un punto lote.');
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
      var x = selfCm.lngApCm.value;
      var y = selfCm.latApCm.value;
      var geom = new Point(parseFloat(x), parseFloat(y));
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      var graphic = new Graphic(geom, symbolPuntoLote);
      var graphicLayer = new GraphicsLayer({
        id: idGraphicPredioCm
      });
      graphicLayer.add(graphic);
      selfCm.map.addLayer(graphicLayer);
      selfCm.map.setInfoWindowOnClick(true);
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
        tolerance: 20
      });
    },
    _unionFeatures: function _unionFeatures(arr) {
      var union = geometryEngine.union(arr);
      return union;
    },
    _generateGraphicByQueryPolygon: function _generateGraphicByQueryPolygon() {
      selfCm._removeLayerGraphic(idGraphicPredioCm);
      selfCm._removeLayerGraphic(idGraphicLoteCm);
      selfCm._removeLayerGraphic(idGraphicPuntoLote);
      selfCm._removeLayerGraphic(idGraphicFrenteLote);

      // Creamos grafico de lote fusionado
      var graphicLayerLoteFusion = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      var query = new Query();
      query.where = '(' + _UBIGEO_FIELD + ' = \'' + paramsApp.ubigeo + '\') and (' + _ID_LOTE_P_FIELD + ' in (30, 36))';
      query.outFields = ["*"];
      query.returnGeometry = true;
      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      qTask.execute(query, function (results) {
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
        var graphic = new Graphic(response, symbolFusionLote);

        graphicLayerLoteFusion.add(graphic);
        selfCm.map.addLayer(graphicLayerLoteFusion);
        selfCm.map.setExtent(graphic._extent, true);
      }).then(function () {
        var query = new Query();
        query.where = _UBIGEO_FIELD + ' = \'' + paramsApp.ubigeo + '\' and ' + _COD_MZN_FIELD + ' = \'040\' and ' + _COD_SECT_FIELD + ' = \'04\'';
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
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = results.features[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var row = _step3.value;

              var isItc = geometryEngine.intersects(row.geometry, graphicFusion.graphics[0].geometry);
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
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = paths[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var path = _step4.value;

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

      // Creamos grafico de lote fusionado
      var graphicLayerLoteDivision = new GraphicsLayer({
        id: idGraphicLoteCm
      });

      // Union all graphics of grpahicslayer
      // let graphicLayerLineaDivision = selfCm.map.getLayer(idGraphicLineaDivision);
      var arr = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = graphicLayerLineaDivision.graphics[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var i = _step5.value;

          arr.push(i.geometry);
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

      var unionGraphicLayerLineaDivision = selfCm._unionFeatures(arr);

      var lineGeometry = new Polyline({
        paths: unionGraphicLayerLineaDivision.paths,
        spatialReference: { wkid: 102100 }
      });
      lineGeometry = esri.geometry.webMercatorToGeographic(lineGeometry);

      var query = new Query();
      query.where = '(' + _UBIGEO_FIELD + ' = \'' + paramsApp.ubigeo + '\') and (' + _ID_LOTE_P_FIELD + ' in (49))';
      query.outFields = ["*"];
      query.returnGeometry = true;
      var qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfLotes).getUrl());
      qTask.execute(query, function (results) {
        var geomLote = results.features[0].geometry;
        var geomLoteDivided = selfCm._dividePolygon(geomLote, lineGeometry);
        // console.log(geomLoteDivided)
        // iterar sobre los graficos de la capa de division y agregar cada uno a graphicLayerLoteDivision
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = geomLoteDivided[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var i = _step6.value;

            var lote = new Graphic(i, symbolFusionLote);
            // agregar el grafico directo al mapa
            graphicLayerLoteDivision.add(lote);
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

        selfCm.map.addLayer(graphicLayerLoteDivision);
        // console.log(graphicLayerLoteDivision._extent)
        selfCm.map.setExtent(graphicLayerLoteDivision._extent, true);

        // let lote = new Graphic(geomLote, symbolFusionLote)
        // agregar el grafico directo al mapa
        // selfCm.map.graphics.add(lote);
        // let arr = []
        // for (let i of results.features) {
        //   arr.push(i.geometry)
        // }
        // let response = selfCm._unionFeatures(arr)
        // let graphic = new Graphic(response, symbolFusionLote);

        // graphicLayerLoteFusion.add(graphic);
        // selfCm.map.addLayer(graphicLayerLoteFusion);
        // selfCm.map.setExtent(graphic._extent, true);
      }).then(function () {
        // let query = new Query();
        // query.where = `${_UBIGEO_FIELD} = '${paramsApp.ubigeo}' and ${_COD_MZN_FIELD} = '040' and ${_COD_SECT_FIELD} = '04'`
        // // especificar los campos devueltos
        // query.outFields = [_UBIGEO_FIELD, _F_MZN_FIELD];
        // query.returnGeometry = true
        // // query with order by fields
        // query.orderByFields = [_F_MZN_FIELD];
        // let qTask = new QueryTask(selfCm.layersMap.getLayerInfoById(idLyrCfArancel).getUrl());
        // qTask.execute(query, function (results) {
        //   // Creamos grafico de punto lote
        //   let graphicLayerPuntoLote = new GraphicsLayer({
        //     id: idGraphicPuntoLote
        //   });
        //   // creamos grafico de frente de lote
        //   let graphicLayerFrenteLote = new GraphicsLayer({
        //     id: idGraphicFrenteLote
        //   });
        //   let graphicFusion = selfCm.map.getLayer(idGraphicLoteCm)
        //   let frentes = {}
        //   for (let row of results.features){
        //     let isItc = geometryEngine.intersects(row.geometry, graphicFusion.graphics[0].geometry)
        //     if (!isItc){
        //       continue
        //     }
        //     // saber si un key esta dentro del objeot frentes
        //     if (!frentes.hasOwnProperty(row.attributes[_F_MZN_FIELD])){
        //       frentes[row.attributes[_F_MZN_FIELD]] = row.geometry;
        //     }
        //     else{
        //       let unionFrentes = geometryEngine.union([frentes[row.attributes[_F_MZN_FIELD]], row.geometry])
        //       frentes[row.attributes[_F_MZN_FIELD]] = unionFrentes;
        //     }
        //   }
        //   for (let idx in frentes){
        //     // interseccion entre frentes y lote
        //     let itcFrentesByLotes = geometryEngine.intersect(frentes[idx], graphicFusion.graphics[0].geometry)
        //     // Generate symbol by line with random colors

        //     // polilinea de frentes resultantes
        //     let polyline = new Polyline({
        //       paths: itcFrentesByLotes.paths,
        //       spatialReference: {wkid: 4326}
        //     });

        //     let polylineOne = null;
        //     if (polyline.paths.length > 1){
        //       polylineOne = selfCm._getLongestPolyline(polyline)

        //     }else{
        //       polylineOne = polyline
        //     }

        //     // calculamos el punto medio de la polilinea
        //     let puntoLoteTurf = selfCm._findMidpoint(polylineOne)

        //     // crear un punto en el mapa
        //     let puntoLote = new Point({
        //       x: puntoLoteTurf.geometry.coordinates[0],
        //       y: puntoLoteTurf.geometry.coordinates[1],
        //       spatialReference: {wkid: 4326}
        //     })

        //     // Agregar el punto p al mapa          
        //     let puntoLoteGraphic = new Graphic(puntoLote, symbolPuntoLote)
        //     graphicLayerPuntoLote.add(puntoLoteGraphic)

        //     // console.log(point)
        //     const symbolFrenteLote = new SimpleLineSymbol(
        //       SimpleLineSymbol.STYLE_SOLID,
        //       new Color(
        //         [
        //           Math.floor(Math.random() * 255), 
        //           Math.floor(Math.random() * 255), 
        //           Math.floor(Math.random() * 255)]),
        //       5
        //     )
        //     let frente = new Graphic(polyline, symbolFrenteLote);
        //     graphicLayerFrenteLote.add(frente);
        //   }

        //   selfCm.map.addLayer(graphicLayerFrenteLote);
        //   selfCm.map.addLayer(graphicLayerPuntoLote);
        //   selfCm._activateSnappingByAcumulacion(graphicLayerPuntoLote)
        // })
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
      dojo.query(".headPredInfoClsCm").on('click', this._zoomToPredSelected);
      dojo.query("#showInfoDocCm").on('click', this._openSupportingDocument);
      dojo.query("#btnDrawMarkerCm").on('click', this._activateTool);
      dojo.query('#btnDrawMarkerFsCm').on('click', this._activateToolAcumulacion);
      dojo.query("#btnAddMarkerCm").on('click', this._locateMarker);
      dojo.query("#btnFsCm").on('click', this._generateGraphicByQueryPolygon);
      dojo.query("#btnDrawLinesDvCm").on('click', this._activateToolLinesDivision);
      dojo.query("#btnApplyDvCm").on('click', this._ApplyDivideLotes);
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
