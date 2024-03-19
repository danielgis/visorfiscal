define(["./UtilityCase"], function (UtilityCase) {
    /*
    * @description: Objeto que contiene las funciones para la acumulación de lotes
    */
    var Acumulation = {

        codRequests: null, // @param
        // currentLots: null, // @param
        currentLotsRows: null,
        currentPoinLotsRows: null,
        currentLandsRows: null,
        // newPointLots: null, // @param
        newPointLotsGraphics: null, // @param
        newLandsGraphics: null, // @params: nuevos predios como graficos
        attributes: null, // @param
        pointLotUrl: null, // @param
        landUrl: null, // @param
        lotUrl: null, // @param
        arancelUrl: null, // @param
        blockUrl: null, // @param
        lotGraphic: null, // @param []: lotes resultantes
        cadastralBlockUrl: null, // @param
        ubigeo: null, // @param
        user: null, // @param
        // geometryLand: null, // @param []: coodernadas x,y de los predios resultantes
        config: null, // @param
        caseRequest: null, // @param

        lands: [], // @calculate
        pointLots: [], // @calculate array
        lots: null, // @calculate
        // block: null, // @calculate
        // LandCls: new UtilityCase.Land(),
        // LotCls: new UtilityCase.Lot(),
        // PointLotCls: new UtilityCase.PointLot(),

        // codUiValue: 1,

        executeAcumulation: function executeAcumulation() {
            var _this = this;

            return UtilityCase.getBlockFromLot(this.lotGraphic[0].geometry, this.blockUrl).then(function (block) {
                return UtilityCase.translateFieldsBlockToLot(_this.lotUrl, block, _this.lotGraphic);
            }).then(function (lots) {
                var tipLot = UtilityCase.calculateTipLot(_this.currentLotsRows);
                return UtilityCase.calculateFieldsOfLot(_this.lotUrl, lots, _this.ubigeo, _this.codRequest, _this.user, _this.attributes, tipLot);
            }).then(function (lots) {
                _this.lots = lots;
                return UtilityCase.translateFieldsLotToPointLot(lots, _this.pointLotUrl, _this.newPointLotsGraphics);
            }).then(function (pointLots) {
                return UtilityCase.translateFieldsArancelToPointLot(pointLots, _this.arancelUrl);
            }).then(function (pointLots) {
                return UtilityCase.calculateFieldsOfPointLot(_this.pointLotUrl, _this.ubigeo, pointLots);
            }).then(function (pointLots) {
                _this.pointLots = pointLots;
                return UtilityCase.translateFieldsPointLotToLand(pointLots, _this.landUrl, _this.newLandsGraphics);
            }).then(function (lands) {
                return UtilityCase.calculateIdMznC(lands, _this.cadastralBlockUrl, _this.ubigeo);
            }).then(function (lands) {
                return UtilityCase.calculateIdPred(lands, _this.landUrl, _this.ubigeo);
            }).then(function (lands) {
                _this.lands = lands;
                return UtilityCase.getDataOrigin(_this.pointLotUrl, _this.landUrl, _this.lots[0]);
            }).then(function (results) {
                _this.currentPoinLotsRows = results[0].features;
                _this.currentLandsRows = results[1].features;
                return UtilityCase.sendDataOriginToHistoric(_this.config, _this.currentLotsRows, _this.currentPoinLotsRows, _this.currentLandsRows);
            }).then(function (results) {
                return UtilityCase.deleteDataOrigin(_this.currentLotsRows, _this.currentPoinLotsRows, _this.currentLandsRows, _this.config);
            }).then(function (results) {
                return UtilityCase.addDataNew(_this.lots, _this.pointLots, _this.lands, _this.config);
            }).then(function (results) {
                return UtilityCase.updateStatusRequests(_this.lands, _this.codRequests, _this.caseRequest, _this.ubigeo, _this.config);
            }).then(function (results) {
                return console.log(results);
            }).catch(function (err) {
                return console.log(err);
            });
        }
    };

    return Acumulation;
});
//# sourceMappingURL=Acumulation.js.map
