define([], function () {
    /*
    * @description: Objeto que contiene los componentes para la 
       asignación de ubicacion de predios
    */
    var LandMatrix = {
        matrixLand: null, // @params

        stringToObjectHtml: function stringToObjectHtml(htmlString) {
            var htmlObject = dojo.create('div', { innerHTML: htmlString });
            return htmlObject;
        },
        renderTableMatrixLand: function renderTableMatrixLand() {
            var renderString = '<div class="ctnParamsCm">\n                        <div class="lblParamCm">\n                            <span class="alignVCenter">\n                                Predio matriz\n                            </span>\n                        </div>\n                    </div>\n                    <div class="ctnParamsCm ctnTablesClsCm">\n                        <table class="tableClsCm">\n                            <thead>\n                                <tr>\n                                    <th class="center-aligned">Nro</th>\n                                    <th>Cod. Predio<br>Municipal</th>\n                                    <th>Direcci\xF3n</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                <tr data-id=' + this.matrixLand[0].cpm + '>\n                                    <td>1</td>\n                                    <td>' + this.matrixLand[0].cpm + '</td>\n                                    <td>' + this.matrixLand[0].address + '</td>\n                                </tr>\n                            </tbody>\n                        </table>\n                    </div>';
            return this.stringToObjectHtml(renderString);
        }
    };
    return LandMatrix;
});
//# sourceMappingURL=LandMatrix.js.map
