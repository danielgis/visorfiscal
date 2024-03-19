define([], function () {
    /*
    * @description: Objeto que contiene los componentes html para ejecutar 
         el proceso de asignación de ubicacion de predios
    */

    var LandProcess = {
        title: null, // @params
        type: null, // @params
        id: 'SendData' + this.type + 'Cm', // @params

        stringToObjectHtml: function stringToObjectHtml(htmlString) {
            var htmlObject = dojo.create('div', { innerHTML: htmlString });
            return htmlObject.firstChild;
        },
        renderButtonProcess: function renderButtonProcess() {
            var renderString = '<div class="ctnSendDataClsCm">\n                        <button id="' + this.id + '" class="btnSendClsCm">\n                            ' + this.title + '\n                        </button>\n                    </div>';

            return this.stringToObjectHtml(renderString);
        }
    };
    return LandProcess;
});
//# sourceMappingURL=LandProcess.js.map
