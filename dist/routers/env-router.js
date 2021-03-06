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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvViewRouter = void 0;
var preact_1 = require("libs/preact");
var express_1 = __importDefault(require("express"));
var CsvTable_1 = require("components/CsvTable");
var Container_1 = require("components/Container");
function EnvViewRouter(config) {
    if (config === void 0) { config = {}; }
    var router = express_1.default.Router();
    var rowSize = [0, 150, 400];
    var colSize = [0, 0];
    function envParser(filename, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: { width: 50, height: 18 },
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
        };
        var envParser = require("libs/env-parser");
        var envArray = envParser.load(filename);
        var csvArray = envArray
            .filter(function (v) { return v.key; })
            .map(function (v) { return [{ value: v.key }, { value: v.value }]; });
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var maxCol = csvArray.length;
        var header = new Array(maxRow).fill(0).map(function (v, i) { return ({
            value: "".concat(i + 1),
            color: "white",
            backgroundColor: "gray",
        }); });
        var csv = __spreadArray([header], csvArray, true).map(function (v, i) { return __spreadArray([
            { value: "".concat(i), color: "white", backgroundColor: "gray" },
            ,
        ], v, true); });
        return __assign({ csv: csv }, __assign(__assign(__assign({}, defaultOptions), options), { dataname: filename, maxRow: maxRow + 1, maxCol: maxCol + 1, rowSize: rowSize, colSize: colSize }));
    }
    router.get("/view", function (req, res) {
        var data = envParser(req.query.file, {
            rowSize: rowSize,
        });
        var container = ((0, preact_1.factory)(Container_1.Container, { title: "ENV-Viewer" },
            (0, preact_1.factory)("div", { className: "csv-control-panel" },
                (0, preact_1.factory)("input", { className: "csv-data-input", type: "text" })),
            (0, preact_1.factory)(CsvTable_1.CsvTable, { id: "csv-table", data: data.csv, left: 0, top: 30, dataname: data.dataname, defaultCellSize: data.defaultCellSize, fixedPoint: data.fixedPoint, rowSize: data.rowSize }),
            (0, preact_1.factory)("script", { type: "text/javascript", src: "/env-index.js" })));
        res.send((0, preact_1.render)(container));
    });
    router.post("/view/*", function (req, res) {
        var data = envParser(req.params[0], {
            rowSize: rowSize,
        });
        res.send(Object.entries(req.body).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a[k] = data[k];
            return a;
        }, {}));
    });
    return router;
}
exports.EnvViewRouter = EnvViewRouter;
//# sourceMappingURL=env-router.js.map