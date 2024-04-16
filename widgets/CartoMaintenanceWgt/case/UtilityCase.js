function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(["dojo/Deferred", "esri/tasks/QueryTask", "esri/tasks/query", "esri/tasks/StatisticDefinition", "esri/geometry/geometryEngine", "dojo/promise/all", "esri/request"], function (Deferred, QueryTask, Query, StatisticDefinition, geometryEngine, all, esriRequest) {
    /*
    * @description: Objeto que contiene las funciones para la subdivisión de lotes
    */
    var UtilityCase = {

        ubigeoFieldName: 'UBIGEO',
        platformUpdate: 'PCF',
        estadoInsValue: 1,
        estadoValue: 1,
        codUiValue: 1,

        Land: function Land() {
            this.ubigeo = 'UBIGEO';
            this.codPre = 'COD_PRE';
            this.codUi = 'COD_UI';
            this.estado = 'ESTADO';
            this.coordX = 'COORD_X';
            this.coordY = 'COORD_Y';
            this.codVer = 'COD_VER';
            this.codCpu = 'COD_CPU';
            this.dirMun = 'DIR_MUN';
            this.dirUrb = 'DIR_URB';
            this.ranCpu = 'RAN_CPU';
            this.tipVia = 'TIP_VIA';
            this.nomVia = 'NOM_VIA';
            this.numMun = 'NUM_MUN';
            this.idMznC = 'ID_MZN_C';
            this.idPred = 'ID_PRED';
            this.tipPred = 'TIP_PRED';
        },
        PointLot: function PointLot() {
            this.ubigeo = 'UBIGEO';
            this.idLote = 'ID_LOTE';
            this.secuen = 'SECUEN';
            this.coordX = 'COORD_X';
            this.coordY = 'COORD_Y';
            this.zonaUtm = 'ZONA_UTM';
            this.estadoIns = 'ESTADO_INS';
        },
        Lot: function Lot() {
            this.idLotP = 'ID_LOTE_P';
            this.ranCpu = 'RAN_CPU';
            this.anoCart = 'ANO_CART';
            this.fuente = 'FUENTE';
            this.nomPc = 'NOM_PC';
            this.nomUser = 'NOM_USER';
            this.codLot = 'COD_LOTE';
            this.lotUrb = 'LOT_URB';
            this.ubigeo = 'UBIGEO';
            this.tipLot = 'TIP_LOT';
            this.estadoIns = 'ESTADO_INS';
        },
        Arancel: function Arancel() {
            this.secEjec = 'SEC_EJEC';
        },
        receptionModelRequest: function receptionModelRequest() {
            return ["COD_PRE", "COD_CPU", "COD_SECT", "COD_MZN", "COD_LOTE", "COD_UU", "COD_VIA", "TIPO_UU", "NOM_UU", "NOM_REF", "MZN_URB", "LOT_URB", "TIP_VIA", "NOM_VIA", "CUADRA", "LADO", "DIR_MUN", "DIR_URB", "COORD_X", "COORD_Y", "RAN_CPU", "COD_UI", "COD_VER", "ID"];
        },
        matchWithReceptionModel: function matchWithReceptionModel(object) {
            var modelRequests = this.receptionModelRequest();
            var response = object.map(function (land) {
                var arrayMatch = {};
                modelRequests.forEach(function (field) {
                    arrayMatch[field] = land.attributes[field];
                });
                return arrayMatch;
            });
            return response;
        },
        getFeatureSchema: function getFeatureSchema(url) {
            var geometry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var blankFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var deferred = new Deferred();
            var queryTask = new QueryTask(url);
            var query = new Query();
            query.where = "1=1";
            query.returnGeometry = geometry;
            query.outFields = ["*"];
            query.num = 1;
            queryTask.execute(query).then(function (result) {
                var feature = result.features[0];
                if (blankFields) {
                    for (var prop in feature.attributes) {
                        feature.attributes[prop] = null;
                    }
                }
                return deferred.resolve(feature);
            }).catch(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        },
        attributeTransfer: function attributeTransfer(_ref) {
            var objTarget = _ref.objTarget,
                objBase = _ref.objBase,
                _ref$propsUse = _ref.propsUse,
                propsUse = _ref$propsUse === undefined ? [] : _ref$propsUse,
                _ref$propsOmit = _ref.propsOmit,
                propsOmit = _ref$propsOmit === undefined ? [] : _ref$propsOmit,
                _ref$updateOnlyNulls = _ref.updateOnlyNulls,
                updateOnlyNulls = _ref$updateOnlyNulls === undefined ? false : _ref$updateOnlyNulls,
                _ref$omitPropsDefault = _ref.omitPropsDefault,
                omitPropsDefault = _ref$omitPropsDefault === undefined ? true : _ref$omitPropsDefault,
                _ref$deletePropsDefau = _ref.deletePropsDefault,
                deletePropsDefault = _ref$deletePropsDefau === undefined ? true : _ref$deletePropsDefau;

            var fieldMatch = [];
            var propsOmitDefault = ['FUENTE', 'NOM_PC', 'NOM_USER', 'ANO_CART'];
            var propsDeleteDefault = ['OBJECTID', 'GlobalID', 'created_date', 'created_user', 'last_edited_date', 'last_edited_user', 'Shape.STArea()', 'Shape.STLength()'];

            if (deletePropsDefault) {
                for (var prop in objTarget) {
                    if (propsDeleteDefault.includes(prop)) {
                        delete objTarget[prop];
                    }
                }
            }

            if (propsUse.length > 0) {
                fieldMatch = propsUse;
            } else {
                var props1 = Object.keys(objTarget);
                var props2 = Object.keys(objBase);
                fieldMatch = props1.filter(function (prop) {
                    return props2.includes(prop);
                });
            }
            // retirar los campos omitidos
            if (propsOmit.length > 0) {
                fieldMatch = fieldMatch.filter(function (prop) {
                    return !propsOmit.includes(prop);
                });
            }

            // retirar los campos omitidos por defecto de objBase
            if (omitPropsDefault) {
                fieldMatch = fieldMatch.filter(function (prop) {
                    return !propsOmitDefault.includes(prop);
                });
            }

            fieldMatch.forEach(function (prop) {
                if (objBase.hasOwnProperty(prop)) {
                    if (updateOnlyNulls) {
                        if (objTarget[prop] === null) {
                            objTarget[prop] = objBase[prop];
                        }
                    } else {
                        objTarget[prop] = objBase[prop];
                    }
                }
            });

            return objTarget;
        },
        getValueCodVer: function getValueCodVer(ranCpu, codUi) {
            var factor = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
            // Obteniendo código concatenado
            var cod_ver_concatenate = ranCpu.toString() + ("0000" + codUi.toString()).slice(-4);

            // Reversa de código concatenado
            var cod_ver = cod_ver_concatenate.split('').reverse().join('');

            // Aplicando fórmula
            var response = 11 - cod_ver.split('').map(function (digit, index) {
                return parseInt(digit) * factor[index];
            }).reduce(function (a, b) {
                return a + b;
            }, 0) % 11;

            if (response > 9) {
                response = 11 - response;
            }

            return response;
        },
        getBlockFromLot: function getBlockFromLot(geometry, url) {
            var deferred = new Deferred();

            var queryBlock = new Query();
            queryBlock.geometry = geometry;
            queryBlock.outFields = ['*'];
            queryBlock.returnGeometry = true;
            var queryTaskBlock = new QueryTask(url);
            queryTaskBlock.execute(queryBlock).then(function (response) {
                if (response.features.length === 0) {
                    return deferred.reject("No se encontraron manzanas");
                }
                return deferred.resolve(response.features[0]);
            }).catch(function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        },
        checkExistLotUrban: function checkExistLotUrban(attributes, block, urlLots) {
            var deferred = new Deferred();
            var queryLot = new Query();
            queryLot.geometry = block.geometry;
            queryLot.spatialRel = "within";
            var LotCls = new this.Lot();
            queryLot.outFields = [LotCls.lotUrb];
            var queryTaskLot = new QueryTask(urlLots);
            var lotsUrban = attributes.map(function (attr) {
                return attr.lotUrb;
            });
            queryTaskLot.execute(queryLot).then(function (response) {
                var lots = response.features.map(function (lot) {
                    return lot.attributes[LotCls.lotUrb];
                });
                var exist = lotsUrban.some(function (lot) {
                    return lots.includes(lot);
                });
                if (exist) {
                    return deferred.reject("Los lotes urbanos registrados ya se encuentran en la manzana actual");
                }
                return deferred.resolve(block);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        translateFieldsBlockToLot: function translateFieldsBlockToLot(url, block, lotsResults) {
            var _this = this;

            var deferred = new Deferred();

            this.getFeatureSchema(url).then(function (lot) {
                var lots = lotsResults.map(function (graphic) {
                    var lotIdx = lot.clone();
                    lotIdx.attributes = _this.attributeTransfer({
                        objTarget: lotIdx.attributes,
                        objBase: block.attributes
                    });
                    lotIdx.geometry = graphic.geometry;
                    return lotIdx;
                });
                return deferred.resolve(lots);
            }).catch(function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        },
        calculateTipLot: function calculateTipLot(currentLotsRows) {
            var LotCls = new this.Lot();
            var tipLot = currentLotsRows.map(function (row) {
                return row.attributes[LotCls.tipLot];
            });
            tipLot = [].concat(_toConsumableArray(new Set(tipLot))) == [2] ? '2' : '1';
            return tipLot;
        },
        calculateFieldsOfLot: function calculateFieldsOfLot(lotUrl, lots, ubigeo, codRequests, user, attributes, tipLot) {
            var _this2 = this;

            var deferred = new Deferred();
            var LotCls = new this.Lot();

            var queryLotTask = new QueryTask(lotUrl);

            var queryLot = new Query();

            queryLot.where = this.ubigeoFieldName + " = '" + ubigeo + "'";

            var statDefIdLoteP = new StatisticDefinition();
            statDefIdLoteP.statisticType = "max";
            statDefIdLoteP.onStatisticField = LotCls.idLotP;
            statDefIdLoteP.outStatisticFieldName = LotCls.idLotP + "_MAX";

            var statDefRanCpu = new StatisticDefinition();
            statDefRanCpu.statisticType = "max";
            statDefRanCpu.onStatisticField = LotCls.ranCpu;
            statDefRanCpu.outStatisticFieldName = LotCls.ranCpu + "_MAX";

            queryLot.returnGeometry = false;
            queryLot.outStatistics = [statDefIdLoteP, statDefRanCpu];

            queryLotTask.execute(queryLot).then(function (response) {
                lots.forEach(function (lot, idx) {
                    lot.attributes[LotCls.idLotP] = response.features[0].attributes[statDefIdLoteP.outStatisticFieldName] + idx + 1;
                    lot.attributes[LotCls.ranCpu] = response.features[0].attributes[statDefRanCpu.outStatisticFieldName] + idx + 1;
                    lot.attributes[LotCls.anoCart] = new Date().getFullYear();
                    lot.attributes[LotCls.fuente] = codRequests;
                    lot.attributes[LotCls.nomPc] = _this2.platformUpdate;
                    lot.attributes[LotCls.nomUser] = user;
                    lot.attributes[LotCls.codLot] = attributes[idx].codLot;
                    lot.attributes[LotCls.lotUrb] = attributes[idx].lotUrb;
                    lot.attributes[LotCls.tipLot] = tipLot;
                    lot.attributes[LotCls.estadoIns] = _this2.estadoInsValue;
                });
                return deferred.resolve(lots);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        translateFieldsLotToPointLot: function translateFieldsLotToPointLot(lots, urlPointLots, newPointLotsGraphics) {
            var _this3 = this;

            var deferred = new Deferred();
            var pointLots = [];

            this.getFeatureSchema(urlPointLots).then(function (pointLot) {
                lots.forEach(function (lot) {
                    pointLot.attributes = _this3.attributeTransfer({
                        objTarget: pointLot.attributes,
                        objBase: lot.attributes,
                        omitPropsDefault: false,
                        deletePropsDefault: true
                    });

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = newPointLotsGraphics[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var graph = _step.value;

                            if (!geometryEngine.intersects(lot.geometry, graph.geometry)) {
                                continue;
                            }

                            var pointLotIdx = pointLot.clone();
                            pointLotIdx.geometry = graph.geometry;
                            pointLots.push(pointLotIdx);
                        }
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

                    ;
                });
                return deferred.resolve(pointLots);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        translateFieldsArancelToPointLot: function translateFieldsArancelToPointLot(pointLots, arancelUrl) {
            var _this4 = this;

            var deferred = new Deferred();
            var promises = pointLots.map(function (pointLot) {
                var queryArancelTask = new QueryTask(arancelUrl);
                var queryArancel = new Query();
                queryArancel.returnGeometry = true;
                queryArancel.outFields = ["*"];
                queryArancel.geometry = pointLot.geometry;
                queryArancel.geometryType = "esriGeometryPoint";
                return queryArancelTask.execute(queryArancel);
            });
            all(promises).then(function (arancels) {
                pointLots.forEach(function (element, index) {
                    var arancel = arancels[index].features[0].attributes;
                    pointLots[index].attributes = _this4.attributeTransfer({
                        objTarget: element.attributes,
                        objBase: arancel,
                        updateOnlyNulls: true
                    });
                    return deferred.resolve(pointLots);
                });
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        calculateFieldsOfPointLot: function calculateFieldsOfPointLot(pointLotUrl, ubigeo, pointLots) {
            var _this5 = this;

            var deferred = new Deferred();
            var PointLotCls = new this.PointLot();

            var queryPointLotTask = new QueryTask(pointLotUrl);

            var queryPointLot = new Query();
            queryPointLot.where = PointLotCls.ubigeo + " = '" + ubigeo + "'";
            var statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = PointLotCls.secuen;
            statDef.outStatisticFieldName = PointLotCls.secuen + "_MAX";

            queryPointLot.returnGeometry = false;
            queryPointLot.outStatistics = [statDef];

            queryPointLotTask.execute(queryPointLot).then(function (response) {
                var secuen = response.features[0].attributes[statDef.outStatisticFieldName] + 1;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = pointLots[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _i = _step2.value;

                        _i.attributes[PointLotCls.secuen] = secuen;
                        _i.attributes[PointLotCls.idLote] = "" + _i.attributes[PointLotCls.zonaUtm] + ubigeo + secuen;
                        _i.attributes[PointLotCls.estadoIns] = _this5.estadoInsValue;
                        secuen += 1;
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

                return deferred.resolve(pointLots);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        generateCodCpu: function generateCodCpu(ranCpu, codVer) {
            var codUi = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            codUi = ("0000" + codUi.toString()).slice(-4);
            return ranCpu + "-" + codUi + "-" + codVer;
        },
        generateDirMun: function generateDirMun(tipVia, nomVia, numMun) {
            return tipVia + " " + nomVia + " " + numMun;
        },
        generateDirUrb: function generateDirUrb(tipVia, nomVia, numMun) {
            return tipVia + " " + nomVia + " " + numMun;
        },
        translateFieldsPointLotToLand: function translateFieldsPointLotToLand(pointLots, landUrl, newLandsGraphics) {
            var _this6 = this;

            var deferred = new Deferred();
            var LandCls = new this.Land();
            var lands = [];

            this.getFeatureSchema(landUrl).then(function (land) {
                newLandsGraphics.forEach(function (landGraphic) {
                    for (i = 0; i < pointLots.length; i++) {
                        if (geometryEngine.intersects(landGraphic.geometry, pointLots[i].geometry)) {
                            var landProps = land.clone();
                            landProps.attributes = _this6.attributeTransfer({
                                objTarget: land.attributes,
                                objBase: pointLots[i].attributes,
                                omitPropsDefault: false
                            });
                            landProps.attributes[LandCls.codPre] = landGraphic.codPre;
                            landProps.attributes[LandCls.codUi] = _this6.codUiValue;
                            landProps.attributes[LandCls.estado] = _this6.estadoValue;
                            landProps.attributes[LandCls.coordX] = landGraphic.geometry.x;
                            landProps.attributes[LandCls.coordY] = landGraphic.geometry.y;
                            landProps.attributes[LandCls.codVer] = _this6.getValueCodVer(landProps.attributes[LandCls.ranCpu], _this6.codUiValue);
                            landProps.attributes[LandCls.codCpu] = _this6.generateCodCpu(landProps.attributes[LandCls.ranCpu], landProps.attributes[LandCls.codVer]);
                            landProps.attributes[LandCls.dirMun] = _this6.generateDirMun(landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia], landProps.attributes[LandCls.numMun]);
                            landProps.attributes[LandCls.dirUrb] = _this6.generateDirUrb(landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia], landProps.attributes[LandCls.numMun]);
                            landProps.geometry = landGraphic.geometry;
                            landProps.attributes['ID'] = parseInt(landGraphic.id);
                            lands.push(landProps.clone());
                            break;
                        }
                    }
                });
                return deferred.resolve(lands);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        calculateIdMznC: function calculateIdMznC(lands, cadastralBlockUrl, ubigeo) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryCadastralBlockTask = new QueryTask(cadastralBlockUrl);
            var queryCadastralBlock = new Query();
            queryCadastralBlock.where = LandCls.ubigeo + " = '" + ubigeo + "'";
            queryCadastralBlock.returnGeometry = true;
            queryCadastralBlock.outFields = [LandCls.idMznC];
            queryCadastralBlock.geometry = lands[0].geometry;

            queryCadastralBlockTask.execute(queryCadastralBlock).then(function (response) {
                lands.forEach(function (land) {
                    land.attributes[LandCls.idMznC] = response.features[0].attributes[LandCls.idMznC];
                });
                return deferred.resolve(lands);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        calculateIdPred: function calculateIdPred(lands, landUrl, ubigeo) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryLandTask = new QueryTask(landUrl);
            var queryLand = new Query();
            queryLand.returnGeometry = false;
            queryLand.where = LandCls.ubigeo + " = '" + ubigeo + "'";
            var statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = LandCls.idPred;
            statDef.outStatisticFieldName = LandCls.idPred + "_MAX";
            queryLand.outStatistics = [statDef];

            queryLandTask.execute(queryLand).then(function (response) {
                lands.forEach(function (land, idx) {
                    land.attributes[LandCls.idPred] = response.features[0].attributes[statDef.outStatisticFieldName] + idx + 1;
                });
                return deferred.resolve(lands);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getPointLotsOrigin: function getPointLotsOrigin(pointLotUrl, lots) {
            var queryPointLotsOriginTask = new QueryTask(pointLotUrl);
            var queryPointLotsOrigin = new Query();
            queryPointLotsOrigin.returnGeometry = true;
            queryPointLotsOrigin.outFields = ["*"];
            queryPointLotsOrigin.geometry = lots.geometry;
            queryPointLotsOrigin.geometryType = "esriGeometryPolygon";
            queryPointLotsOrigin.distance = 0.5;
            queryPointLotsOrigin.units = "meters";
            return queryPointLotsOriginTask.execute(queryPointLotsOrigin);
        },
        getLandsOrigin: function getLandsOrigin(landUrl, lots) {
            var queryLandsOriginTask = new QueryTask(landUrl);
            var queryLandsOrigin = new Query();
            queryLandsOrigin.returnGeometry = true;
            queryLandsOrigin.outFields = ["*"];
            queryLandsOrigin.geometry = lots.geometry;
            queryLandsOrigin.geometryType = "esriGeometryPolygon";
            queryLandsOrigin.distance = 0.5;
            queryLandsOrigin.units = "meters";
            return queryLandsOriginTask.execute(queryLandsOrigin);
        },
        getLandsOriginByQuery: function getLandsOriginByQuery(landUrl, cpu) {
            var deferred = new Deferred();
            var LandCls = new this.Land();

            var queryLandsOriginTask = new QueryTask(landUrl);
            var queryLandsOrigin = new Query();
            queryLandsOrigin.returnGeometry = true;
            queryLandsOrigin.outFields = ["*"];
            queryLandsOrigin.where = LandCls.codCpu + " = '" + cpu + "'";
            queryLandsOriginTask.execute(queryLandsOrigin).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateRowsGeneric: function updateRowsGeneric(features, codRequest, user) {
            var _this7 = this;

            var LandCls = new this.Land();
            var LotCls = new this.Lot();
            features.forEach(function (feature) {
                feature.attributes[LandCls.estado] = 0;
                feature.attributes[LotCls.fuente] = codRequest;
                feature.attributes[LotCls.nomUser] = user;
                feature.attributes[LotCls.nomPc] = _this7.platformUpdate;
                feature.attributes[LotCls.anoCart] = new Date().getFullYear();
            });
            return features;
        },
        getDataOrigin: function getDataOrigin(pointLotUrl, landUrl, lots) {
            // const self = this;
            var deferred = new Deferred();

            var promises = [this.getPointLotsOrigin(pointLotUrl, lots), this.getLandsOrigin(landUrl, lots)];

            all(promises).then(function (results) {
                // self.currentPoinLotsRows = results[0].features;
                // self.currentLandsRows = results[1].features;
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        setParametersToAddFeatures: function setParametersToAddFeatures(url, params) {
            return {
                url: url + "/addFeatures",
                content: {
                    features: JSON.stringify(params),
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        setParametersToUpdateFeatures: function setParametersToUpdateFeatures(url, params) {
            return {
                url: url + "/updateFeatures",
                content: {
                    features: JSON.stringify(params),
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        setParametersToDeleteFeatures: function setParametersToDeleteFeatures(url, params) {
            return {
                url: url + "/deleteFeatures",
                content: {
                    where: params,
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            };
        },
        sendDataOriginToHistoric: function sendDataOriginToHistoric(config, currentLotsRows, currentPoinLotsRows, currentLandsRows) {
            var deferred = new Deferred();
            var promises = [];

            if (currentLotsRows) {
                var lotsHistoricRequestOptions = this.setParametersToAddFeatures(config.lotHistoricUrl, currentLotsRows);
                promises.push(esriRequest(lotsHistoricRequestOptions, { usePost: true }));
            }

            if (currentPoinLotsRows) {
                var pointsLotsHistoricRequestOptions = this.setParametersToAddFeatures(config.pointLotHistoricUrl, currentPoinLotsRows);
                promises.push(esriRequest(pointsLotsHistoricRequestOptions, { usePost: true }));
            }

            if (currentLandsRows) {
                var landsHistoricRequestOptions = this.setParametersToAddFeatures(config.landHistoricUrl, currentLandsRows);
                promises.push(esriRequest(landsHistoricRequestOptions, { usePost: true }));
            }

            // const promises = [
            //     esriRequest(lotsHistoricRequestOptions, { usePost: true }),
            //     esriRequest(pointsLotsHistoricRequestOptions, { usePost: true }),
            //     esriRequest(landsHistoricRequestOptions, { usePost: true })
            // ]

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        deleteDataOrigin: function deleteDataOrigin(currentLotsRows, currentPoinLotsRows, currentLandsRows, config) {
            var deferred = new Deferred();

            var objetidLot = currentLotsRows.map(function (row) {
                return row.attributes.OBJECTID;
            });
            var objetidPointLot = currentPoinLotsRows.map(function (row) {
                return row.attributes.OBJECTID;
            });
            var objetidLand = currentLandsRows.map(function (row) {
                return row.attributes.OBJECTID;
            });

            var lotsDeleteRequestOptions = this.setParametersToDeleteFeatures(config.lotUrl, "OBJECTID IN (" + objetidLot.join(",") + ")");
            var pointsLotsDeleteRequestOptions = this.setParametersToDeleteFeatures(config.pointLotUrl, "OBJECTID IN (" + objetidPointLot.join(",") + ")");
            var landsDeleteRequestOptions = this.setParametersToDeleteFeatures(config.landUrl, "OBJECTID IN (" + objetidLand.join(",") + ")");

            var promises = [esriRequest(lotsDeleteRequestOptions, { usePost: true }), esriRequest(pointsLotsDeleteRequestOptions, { usePost: true }), esriRequest(landsDeleteRequestOptions, { usePost: true })];

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateDataDeactivate: function updateDataDeactivate(lands, config) {
            var deferred = new Deferred();
            var deactivateFeatures = this.setParametersToUpdateFeatures(config.landUrl, lands);

            esriRequest(deactivateFeatures, { usePost: true }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateDataLotsDeactivate: function updateDataLotsDeactivate(lots, config) {
            var deferred = new Deferred();
            var updateLotFeature = this.setParametersToUpdateFeatures(config.lotUrl, lots);

            esriRequest(updateLotFeature, { usePost: true }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        addDataNew: function addDataNew(lots, pointLots, lands, config) {
            var deferred = new Deferred();

            lots = Array.isArray(lots) ? lots : [lots];

            var lotNews = this.setParametersToAddFeatures(config.lotUrl, lots);

            pointLots = Array.isArray(pointLots) ? pointLots : [pointLots];

            var pointLotsNews = this.setParametersToAddFeatures(config.pointLotUrl, pointLots);

            lands = Array.isArray(lands) ? lands : [lands];

            var landsNews = this.setParametersToAddFeatures(config.landUrl, lands);

            var promises = [esriRequest(lotNews, { usePost: true }), esriRequest(pointLotsNews, { usePost: true }), esriRequest(landsNews, { usePost: true })];

            all(promises).then(function (results) {
                return deferred.resolve(results);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateStatusRequests: function updateStatusRequests(lands, codRequests, caseRequest, ubigeo, config) {
            var deferred = new Deferred();
            var responseLands = UtilityCase.matchWithReceptionModel(lands);

            var response = {
                id: codRequests,
                results: responseLands,
                idType: parseInt(caseRequest)
            };
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = response.results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var predio = _step3.value;

                    predio['ubigeo'] = ubigeo;
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

            fetch(config.updateStatusApplication, {
                method: 'POST',
                body: JSON.stringify(response),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                return deferred.resolve(data);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        checkLotsWithinLands: function checkLotsWithinLands(lots, lands) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = lots[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var lot = _step4.value;

                    var checkLands = [];
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = lands[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var land = _step5.value;

                            checkLands.push(geometryEngine.intersects(lot.geometry, land.geometry));
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

                    if (checkLands.every(function (i) {
                        return i === false;
                    })) {
                        return false;
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

            return true;
        },
        checkLandsWithinLot: function checkLandsWithinLot(lot, urlLands) {
            var deferred = new Deferred();
            var landCls = new this.Land();
            var queryLands = new Query();
            queryLands.geometry = lot.geometry;
            queryLands.distance = 0.5;
            queryLands.units = "meters";
            queryLands.where = landCls.estado + " = 1 ";
            var queryTaskLands = new QueryTask(urlLands);
            queryTaskLands.execute(queryLands).then(function (response) {
                var result = response.features.length > 0 ? 1 : 0;
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }
    };

    return UtilityCase;
});
//# sourceMappingURL=UtilityCase.js.map
