define([], function () {

    var CaseInfo = {
        contentCard: function contentCard(data, type) {
            var active = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var cardHtml = '<div class="caseInfoClsCm">\n                                <div class="headPredInfoClsCm ' + (type === 'original' ? 'headPredInfoOriginalClsCm' : 'headPredInfoResultClsCm') + '">\n                                    <span class="alignVCenter">Predio: ' + data.cpm + '</span>\n                                    <button class="zoomPredInfoClsCm ' + (type === 'original' ? 'active' : null) + ' toolsPredInfoClsCm" data-codpre=' + data.cpm + '>\n                                        <i class="fa fa-search" style="width: 16px; height: 16px"></i>\n                                    </button>\n                                    <button class="colapsePredInfoClsCm toolsPredInfoClsCm">\n                                        <i class=\'fas fa-angle-down\' style="width: 16px; height: 16px"></i>\n                                    </button>\n                                </div>\n                                <div class="bodyPredInfoClsCm ' + (active ? 'active' : null) + '">\n                                    <label for="direccion">Direcci\xF3n:</label>\n                                    <input type="text" id="direccion" name="direccion" value="' + data.address.replace("None", '') + '" readonly>\n                                </div>\n                            </div>';
            return cardHtml;
        }
        // Otras funciones o propiedades
    };

    return CaseInfo;
});
//# sourceMappingURL=CaseInfo.js.map
