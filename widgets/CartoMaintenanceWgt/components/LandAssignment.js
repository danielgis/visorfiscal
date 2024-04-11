function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(["esri/graphic", "esri/geometry/Circle", "esri/geometry/Point"], function (Graphic, Circle, Point) {
    /*
    * @description: Objeto que contiene los componentes para la 
       asignación de ubicacion de predios
    */
    var LandAssignment = {
        title: null, // @params
        lands: null, // @params
        pointLots: null, // @params
        landsSymbol: null, // @params
        landsSymbolSelected: null, // @params
        map: null, // @params
        graphicLayer: null, // @params


        removeGraphic: function removeGraphic(id) {
            var graphic = this.map.graphics.graphics.find(function (graphic) {
                return graphic.attributes && graphic.attributes.id === id && graphic.attributes.type === 'land';
            });
            this.map.graphics.remove(graphic);
        },
        removeAllGraphics: function removeAllGraphics() {
            var listGraphics = [].concat(_toConsumableArray(this.map.graphics.graphics));
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = listGraphics[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var graphic = _step.value;

                    if (graphic.attributes && graphic.attributes.type === 'land') {
                        this.map.graphics.remove(graphic);
                    }
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
        },
        checkPointLotsSelected: function checkPointLotsSelected() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.lands[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var land = _step2.value;

                    if (!land.pointLot) {
                        return false;
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

            return true;
        },
        selectedPointLots: function selectedPointLots(evt) {
            var pointLotSelection = evt.target;
            var pointLotSelectionRow = pointLotSelection.parentNode.parentNode;
            // id of land selected
            var landId = pointLotSelectionRow.dataset.id;
            var landCpm = pointLotSelectionRow.dataset.cpm;
            this.removeGraphic(landId);
            // id of point lot selected
            var pointLotId = pointLotSelection.selectedOptions[0].dataset.id;
            // search point lot selected
            var pointLot = this.pointLots.find(function (pointLot) {
                return pointLot.attributes.ID_LOTE === pointLotId;
            });
            // add point lot to land
            this.lands.forEach(function (land) {
                if (land.id === parseInt(landId)) {
                    land.pointLot = pointLot;
                }
            });

            var buffer = new Circle({
                center: pointLot.geometry,
                radius: 0.5,
                geodesic: true,
                radiusUnit: esri.Units.METERS
            });
            var xmin = buffer.getExtent().xmin;
            var xmax = buffer.getExtent().xmax;
            var ymin = buffer.getExtent().ymin;
            var ymax = buffer.getExtent().ymax;

            var x = Math.random() * (xmax - xmin) + xmin;
            var y = Math.random() * (ymax - ymin) + ymin;

            var landPoint = new Point(x, y, buffer.spatialReference);
            var graphic = new Graphic(landPoint, this.landsSymbol, { id: landId, type: 'land' });
            this.map.graphics.add(graphic);
        },
        highlightLand: function highlightLand(evt) {
            var _this = this;

            var graphicId = evt.currentTarget.dataset.id;
            this.map.graphics.graphics.forEach(function (g) {
                if (g.attributes && g.attributes.type === 'land') {
                    g.setSymbol(_this.landsSymbol);
                }
            });

            var graphic = this.map.graphics.graphics.find(function (g) {
                return g.attributes && g.attributes.id === graphicId;
            });

            if (graphic) {
                graphic.setSymbol(this.landsSymbolSelected);
            }
        },
        reestartSymbolLand: function reestartSymbolLand(evt) {
            var _this2 = this;

            // const graphicId = evt.currentTarget.dataset.id;
            this.map.graphics.graphics.forEach(function (g) {
                if (g.attributes && g.attributes.type === 'land') {
                    g.setSymbol(_this2.landsSymbol);
                }
            });
        },
        stringToObjectHtml: function stringToObjectHtml(htmlString) {
            var htmlObject = dojo.create('div', { innerHTML: htmlString });
            return htmlObject;
        },
        renderTableLandAssignment: function renderTableLandAssignment() {
            var pointLotsHtml = this.pointLots.map(function (pointLot, idx) {
                return "<option data-id=" + pointLot.attributes.ID_LOTE + ">\n                            " + pointLot.attributes.NOM_VIA + "\n                        </option>";
            });

            var landsHtml = this.lands.map(function (land, idx) {
                return "<tr data-id=" + land.id + " data-cpm=" + land.cpm + ">\n                            <td>" + (idx + 1) + "</td>\n                            <td>" + land.address + "</td>\n                            <td>\n                                <select class=\"pointLotSelectionCm\">\n                                    <option value=\"\" disabled selected>\n                                        ---\n                                    </option>\n                                    " + pointLotsHtml.join('') + "\n                                </select>\n                            </td>\n                        </tr>";
            });

            var renderString = "<div class=\"ctnParamsCm\">\n                        <div class=\"lblParamCm\">\n                            <span class=\"alignVCenter\">\n                                Graficar predios resultantes de la " + this.title + "\n                            </span>\n                        </div>\n                    </div>\n                    <div class=\"ctnParamsCm ctnTablesClsCm\">\n                        <table id=\"tableLandsResults\" class=\"tableClsCm\">\n                            <thead>\n                                <tr>\n                                    <th class=\"center-aligned\">Nro</th>\n                                    <th>Direcci\xF3n</th>\n                                    <th class=\"center-aligned\">V\xEDa</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                " + landsHtml.join('') + "\n                            </tbody>\n                        </table>\n                    </div>";

            return this.stringToObjectHtml(renderString);
        },
        addRowToTableLandAssignment: function addRowToTableLandAssignment() {
            var tableBody = document.querySelector('#tableLandsResults tbody');
            var pointLotsHtml = this.pointLots.map(function (pointLot, idx) {
                return "<option data-id=" + pointLot.attributes.ID_LOTE + ">\n                            " + pointLot.attributes.NOM_VIA + "\n                        </option>";
            });
            this.lands.forEach(function (land) {
                var rowHtml = "\n                    <tr data-id=" + land.cpm + ">\n                        <td>" + (tableBody.children.length + 1) + "</td>\n                        <td>" + land.cpm + "</td>\n                        <td>" + land.address + "</td>\n                        <td>\n                            <select class=\"pointLotSelectionCm\">\n                                <option value=\"\" disabled selected>\n                                    ---\n                                </option>\n                                " + pointLotsHtml.join('') + "\n                            </select>\n                        </td>\n                    </tr>";
                tableBody.insertAdjacentHTML('beforeend', rowHtml);
            });
        }
    };
    return LandAssignment;
});
//# sourceMappingURL=LandAssignment.js.map
