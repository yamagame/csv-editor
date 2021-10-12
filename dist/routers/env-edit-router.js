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
exports.EnvViewRouter = exports.EnvEditRouter = void 0;
var preact_1 = require("libs/preact");
var path = require("path");
var express_1 = __importDefault(require("express"));
var CsvTable_1 = require("components/CsvTable");
var utils_1 = require("libs/utils");
var Container_1 = require("components/Container");
function EnvEditRouter(_a) {
    var search_dir = _a.search_dir;
    var router = express_1.default.Router();
    var rowSize = [40, 130, 130, 130, 130];
    function envParser(req, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: { width: 50, height: 18 },
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
        };
        var envParser = require("libs/env-parser");
        var envFiles = utils_1.readDir(search_dir, function (filepath) {
            return path.basename(filepath) === req.params[0];
        });
        var envData = {};
        var envKeys = {};
        var envTemp = envFiles.map(function (filepath) {
            var data = envParser.load(path.join(search_dir, filepath));
            return data;
        });
        envTemp.forEach(function (env) {
            env.reduce(function (a, v) {
                if (!a[v.key])
                    a[v.key] = true;
                return a;
            }, envKeys);
        });
        Object.keys(envKeys).forEach(function (key) {
            if (!envData[key])
                envData[key] = [];
            envTemp.forEach(function (env) {
                var v = env.find(function (data) { return data.key === key; });
                if (v !== undefined) {
                    envData[key].push(v);
                }
                else {
                    envData[key].push({ value: "" });
                }
            });
        });
        var csvArray = __spreadArray([
            __spreadArray([
                { value: "" }
            ], envFiles.map(function (v) { return ({
                value: v,
            }); }))
        ], Object.entries(envData).map(function (env) {
            return __spreadArray([{ value: env[0] }], env[1]);
        }));
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var maxCol = csvArray.length;
        var header = new Array(maxRow).fill(0).map(function (v, i) { return ({
            value: "" + (i + 1),
        }); });
        var csv = __spreadArray([header], csvArray).map(function (v, i) { return __spreadArray([{ value: "" + i }], v); });
        return __assign({ csv: csv }, __assign(__assign(__assign({}, defaultOptions), options), { dataname: req.params[0], maxRow: maxRow + 1, maxCol: maxCol + 1 }));
    }
    router.post("/*", function (req, res) {
        var data = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: rowSize,
        });
        res.send(Object.entries(req.body).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a[k] = data[k];
            return a;
        }, {}));
    });
    router.get("/*", function (req, res) {
        var data = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: rowSize,
        });
        var container = (preact_1.factory(Container_1.Container, { title: "Top" },
            preact_1.factory("div", { className: "csv-control-panel" },
                preact_1.factory("input", { id: "csv-data-input", className: "", type: "text" })),
            preact_1.factory(CsvTable_1.CsvTable, { id: "csv-table", data: data.csv, left: 30, top: 30, dataname: data.dataname, defaultCellSize: data.defaultCellSize, fixedPoint: data.fixedPoint, rowSize: data.rowSize }),
            preact_1.factory("script", { type: "text/javascript", src: "/env-edit-index.js" })));
        res.send(preact_1.render(container));
    });
    router.post("/*", function (req, res) {
        var data = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
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
exports.EnvEditRouter = EnvEditRouter;
function EnvViewRouter(_a) {
    var search_dir = _a.search_dir;
    var router = express_1.default.Router();
    var rowSize = [0, 150, 400];
    function envParser(req, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: { width: 50, height: 18 },
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
        };
        var envParser = require("libs/env-parser");
        var envArray = envParser.load(path.join(search_dir, req.params[0]));
        var csvArray = envArray
            .filter(function (v) { return v.key; })
            .map(function (v) { return [{ value: v.key }, { value: v.value }]; });
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var maxCol = csvArray.length;
        var header = new Array(maxRow).fill(0).map(function (v, i) { return ({
            value: "" + (i + 1),
        }); });
        var csv = __spreadArray([header], csvArray).map(function (v, i) { return __spreadArray([{ value: "" + i }], v); });
        return __assign({ csv: csv }, __assign(__assign(__assign({}, defaultOptions), options), { dataname: req.params[0], maxRow: maxRow + 1, maxCol: maxCol + 1 }));
    }
    router.get("/*", function (req, res) {
        var data = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: rowSize,
        });
        var container = (preact_1.factory(Container_1.Container, { title: "Top" },
            preact_1.factory("div", { className: "csv-control-panel" },
                preact_1.factory("input", { id: "csv-data-input", className: "", type: "text" })),
            preact_1.factory(CsvTable_1.CsvTable, { id: "csv-table", data: data.csv, left: 30, top: 30, dataname: data.dataname, defaultCellSize: data.defaultCellSize, fixedPoint: data.fixedPoint, rowSize: data.rowSize }),
            preact_1.factory("script", { type: "text/javascript", src: "/env-view-index.js" })));
        res.send(preact_1.render(container));
    });
    router.post("/*", function (req, res) {
        var data = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
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
//# sourceMappingURL=env-edit-router.js.map