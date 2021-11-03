"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvRouter = void 0;
var preact_1 = require("libs/preact");
var utils_1 = require("libs/utils");
var fs = require("fs");
var path = require("path");
var express_1 = __importDefault(require("express"));
var CsvTable_1 = require("components/CsvTable");
var Container_1 = require("components/Container");
function CsvRouter(options, optionReader) {
    if (options === void 0) { options = {}; }
    var router = express_1.default.Router();
    var rowSize = options.cellWidth || [40, 40];
    var colSize = options.cellHeight || [0];
    function csvParser(filename, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: { width: 130, height: 18 },
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
        };
        var csvParser = require("libs/csv-parser");
        var csvFilePath = path.join(filename);
        var csvArray = csvParser.load(csvFilePath);
        var csvJson = utils_1.loadJson(csvFilePath);
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var maxCol = csvArray.length;
        var header = new Array(maxRow).fill(0).map(function (v, i) { return ({
            value: "" + (i + 1),
            color: "white",
            backgroundColor: "gray",
        }); });
        var csv = __spreadArray([header], csvArray).map(function (v, i) { return __spreadArray([
            { value: "" + i, color: "white", backgroundColor: "gray" }
        ], v); });
        return __assign({ csv: csv }, __assign(__assign(__assign(__assign({}, defaultOptions), options), { dataname: filename, maxRow: maxRow + 1, maxCol: maxCol + 1 }), csvJson));
    }
    router.post("/save/*", function (req, res) {
        var data = csvParser(req.params[0], {
            fixedPoint: { x: 0, y: 0 },
            rowSize: rowSize,
        });
        var _a = req.body, maxRow = _a.maxRow, maxCol = _a.maxCol;
        req.body.csv.forEach(function (cell) {
            if (data.csv.length <= cell.y) {
                data.csv = __spreadArray(__spreadArray([], data.csv), new Array(cell.y - data.csv.length + 1).fill([]));
            }
            if (data.csv[cell.y].length <= cell.x) {
                data.csv[cell.y] = __spreadArray(__spreadArray([], data.csv[cell.y]), new Array(cell.x - data.csv[cell.y].length + 1).fill({
                    value: "",
                }));
            }
            try {
                data.csv[cell.y][cell.x] = { value: cell.value };
            }
            catch (_a) { }
        });
        {
            var csvParser_1 = require("libs/csv-parser");
            var csvData = __spreadArray([], data.csv).slice(1).map(function (col) { return col.slice(1); });
            var csvString = csvParser_1.stringify(csvData.map(function (v) { return v.slice(0, maxRow - 1); }).slice(0, maxCol - 1));
            var csvPath = req.params[0];
            fs.writeFileSync(csvPath, csvString);
        }
        {
            var _b = req.body, rowSize_1 = _b.rowSize, colSize_1 = _b.colSize;
            var csvFilePath = req.params[0];
            utils_1.saveJson(csvFilePath, { rowSize: rowSize_1, colSize: colSize_1, maxCol: maxCol, maxRow: maxRow });
        }
        res.send({ result: "OK" });
    });
    router.post("/view/*", function (req, res) {
        var data = csvParser(req.params[0], {
            fixedPoint: { x: 0, y: 0 },
            rowSize: rowSize,
            colSize: colSize,
        });
        var form = [
            {
                expression: "A0 == 'NG'",
                style: {
                    color: "red",
                    fontWeight: "bold",
                },
            },
            {
                range: "B2",
                expression: "$B0 != ''",
                style: {
                    backgroundColor: "yellow",
                },
            },
        ];
        data.form = form;
        res.send(Object.entries(req.body).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a[k] = data[k];
            return a;
        }, {}));
    });
    router.get("/view", function (req, res) {
        var data = csvParser(req.query.file, {
            fixedPoint: { x: 0, y: 0 },
            rowSize: rowSize,
        });
        var form = [
            {
                expression: "A0 == 'NG'",
                style: {
                    color: "red",
                    fontWeight: "bold",
                },
            },
            {
                range: "B2",
                expression: "$B0 != ''",
                style: {
                    backgroundColor: "yellow",
                },
            },
        ];
        var container = (preact_1.factory(Container_1.Container, { title: "Top" },
            preact_1.factory("div", { className: "csv-control-panel" },
                preact_1.factory("input", { className: "csv-save-button", type: "button", value: "\u30BB\u30FC\u30D6", onClick: "save();" }),
                preact_1.factory("input", { className: "csv-data-input", type: "text" })),
            preact_1.factory(CsvTable_1.CsvTable, { id: "csv-table", data: data.csv, left: 0, top: 30, dataname: data.dataname, defaultCellSize: data.defaultCellSize, fixedPoint: data.fixedPoint, rowSize: data.rowSize, colSize: data.colSize, form: form }),
            preact_1.factory("script", { type: "text/javascript", src: "/csv-index.js" })));
        res.send(preact_1.render(container));
    });
    return router;
}
exports.CsvRouter = CsvRouter;
//# sourceMappingURL=csv-router.js.map