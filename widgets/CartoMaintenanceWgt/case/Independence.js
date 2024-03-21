define(["dojo/Deferred", "esri/tasks/QueryTask", "esri/tasks/query", "esri/request", "esri/tasks/StatisticDefinition", "./UtilityCase"], function (Deferred, QueryTask, Query, esriRequest, StatisticDefinition, UtilityCase) {
    /*
    * @description: Objeto que contiene las funciones para la subdivisión de lotes
    */
    var Independence = {
        codRequest: null, // @params: Código de la solicitud
        user: null, // @params
        ubigeo: null, // @params
        cadastralBlockUrl: null, // @params
        matrixLand: null, // @params
        newLands: null, // @param: nuevos predios
        urlLands: null, // @param
        lands: null, // @calculate
        config: null, // @calculate
        matrixLandDomain: '2',
        caseRequest: null, // @param
        currentLotsRows: null, //@param


        getMatrixLand: function getMatrixLand() {
            var _this = this;

            var deferred = new Deferred();
            var LandCls = new UtilityCase.Land();
            var queryTask = new QueryTask(this.urlLands);
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = ["OBJECTID", "GLOBALID", LandCls.tipPred];
            query.where = LandCls.codPre + " = '" + this.matrixLand[0].cpm + "' and " + LandCls.ubigeo + " = '" + this.ubigeo + "'";
            queryTask.execute(query).then(function (result) {
                var matrixLand = result.features;
                matrixLand[0].attributes[LandCls.tipPred] = _this.matrixLandDomain;
                return deferred.resolve(matrixLand);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        getUiOfLot: function getUiOfLot() {
            var LotCls = new UtilityCase.Lot();
            var deferred = new Deferred();
            var LandCls = new UtilityCase.Land();
            var queryTask = new QueryTask(this.urlLands);
            var query = new Query();

            var statDefCodUi = new StatisticDefinition();
            statDefCodUi.statisticType = "max";
            statDefCodUi.onStatisticField = LandCls.codUi;
            statDefCodUi.outStatisticFieldName = LandCls.codUi + "_MAX";
            query.outStatistics = [statDefCodUi];

            query.where = LotCls.idLotP + " = '" + this.currentLotsRows[0].attributes[LotCls.idLotP] + "' and " + LotCls.ubigeo + " = '" + this.ubigeo + "'";

            queryTask.execute(query).then(function (result) {
                var uiValue = result.features[0].attributes[LandCls.codUi + "_MAX"] + 1;
                return deferred.resolve(uiValue);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        updateMatrixLand: function updateMatrixLand(matrixLand) {
            // this.lands = JSON.stringify(matrixLand);
            var deferred = new Deferred();
            var updateTipPredLand = UtilityCase.setParametersToUpdateFeatures(this.config.landUrl, matrixLand);

            esriRequest(updateTipPredLand, { usePost: true }).then(function (result) {
                return deferred.resolve(result);
            }).catch(function (err) {
                return deferred.reject(err);
            });

            return deferred.promise;
        },
        calculateLandFields: function calculateLandFields(uiValue) {
            var _this2 = this;

            var deferred = new Deferred();
            var LandCls = new UtilityCase.Land();
            var LotCls = new UtilityCase.Lot();
            var lands = [];
            // let uiValue = UtilityCase.codUiValue

            UtilityCase.getFeatureSchema(this.urlLands).then(function (landSchema) {
                _this2.newLands.forEach(function (land) {
                    var landProps = landSchema.clone();
                    landProps.attributes = UtilityCase.attributeTransfer({
                        objTarget: landSchema.attributes,
                        objBase: land.pointLot.attributes,
                        omitPropsDefault: false
                    });
                    landProps.attributes[LandCls.codPre] = land.cpm;
                    landProps.attributes[LandCls.codUi] = uiValue;
                    landProps.attributes[LandCls.estado] = UtilityCase.estadoValue;
                    landProps.attributes[LandCls.coordX] = land.pointLot.geometry.x;
                    landProps.attributes[LandCls.coordY] = land.pointLot.geometry.y;
                    landProps.attributes[LotCls.fuente] = _this2.codRequest;
                    landProps.attributes[LotCls.nomPc] = UtilityCase.platformUpdate;
                    landProps.attributes[LotCls.nomUser] = _this2.user;
                    landProps.attributes[LandCls.tipPred] = land.tipPred;
                    landProps.attributes[LandCls.codVer] = UtilityCase.getValueCodVer(landProps.attributes[LandCls.ranCpu], uiValue);
                    landProps.attributes[LandCls.codCpu] = UtilityCase.generateCodCpu(landProps.attributes[LandCls.ranCpu], landProps.attributes[LandCls.codVer], codUi = uiValue);

                    landProps.attributes[LandCls.dirMun] = UtilityCase.generateDirMun(landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia], landProps.attributes[LandCls.numMun]);
                    landProps.attributes[LandCls.dirUrb] = UtilityCase.generateDirUrb(landProps.attributes[LandCls.tipVia], landProps.attributes[LandCls.nomVia], landProps.attributes[LandCls.numMun]);
                    landProps.geometry = land.pointLot.geometry;
                    uiValue = uiValue + 1;
                    lands.push(landProps.clone());
                });
                return deferred.resolve(lands);
            }).catch(function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        },
        executeIndependence: function executeIndependence() {
            var _this3 = this;

            return this.getUiOfLot().then(function (uiValue) {
                return _this3.calculateLandFields(uiValue);
            }).then(function (lands) {
                return UtilityCase.calculateIdMznC(lands, _this3.cadastralBlockUrl, _this3.ubigeo);
            }).then(function (lands) {
                return UtilityCase.calculateIdPred(lands, _this3.urlLands, _this3.ubigeo);
            }).then(function (lands) {
                _this3.lands = lands;
                return UtilityCase.addDataNew([], [], lands, _this3.config);
            }).then(function (lands) {
                return _this3.getMatrixLand();
            }).then(function (matrixLand) {
                return _this3.updateMatrixLand(matrixLand);
            }).then(function (results) {
                return UtilityCase.updateStatusRequests(_this3.lands, _this3.codRequest, _this3.caseRequest, _this3.ubigeo, _this3.config);
            }).then(function (result) {
                return console.log(result);
            }).catch(function (err) {
                return err;
            });
        }
    };
    return Independence;
});
//# sourceMappingURL=Independence.js.map
