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
exports.EnvRouter = void 0;
var preact_1 = require("libs/preact");
var path = require("path");
var express_1 = __importDefault(require("express"));
var CsvTable_1 = require("components/CsvTable");
var utils_1 = require("libs/utils");
var Container_1 = require("components/Container");
function EnvRouter(_a) {
    var TARGET_DIR = _a.TARGET_DIR;
    var router = express_1.default.Router();
    router.get("/view/*", function (req, res) {
        var envParser = require("./libs/env-parser");
        var envArray = envParser.load(path.join(TARGET_DIR, req.params[0]));
        var csvArray = envArray
            .filter(function (v) { return v.key; })
            .map(function (v) { return [{ value: v.key }, { value: v.value }]; });
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var header = new Array(maxRow).fill(0).map(function (v, i) { return ({
            value: "" + (i + 1),
        }); });
        var csv = __spreadArray([header], csvArray).map(function (v, i) { return __spreadArray([{ value: "" + i }], v); });
        var container = (preact_1.factory(Container_1.Container, { title: "Top" },
            preact_1.factory("div", { className: "csv-control-panel" },
                preact_1.factory("input", { id: "csv-data-input", className: "", type: "text" })),
            preact_1.factory(CsvTable_1.CsvTable, { id: "csv-table", data: csv, left: 30, top: 30, fixedPoint: { x: 0, y: 0 }, rowSize: [0, 150, 400] })));
        res.send(preact_1.render(container));
    });
    function envParser(req, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: { width: 50, height: 18 },
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
        };
        var envParser = require("./libs/env-parser");
        var envFiles = utils_1.readDir(TARGET_DIR, function (filepath) {
            return path.basename(filepath) === req.params[0];
        });
        var envData = {};
        var envKeys = {};
        var envTemp = envFiles.map(function (filepath) {
            var data = envParser.load(path.join(TARGET_DIR, filepath));
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
        return __assign({ csv: csv }, __assign(__assign(__assign({}, defaultOptions), options), { dataname: req.params[0], maxRow: maxRow, maxCol: maxCol }));
    }
    router.post("/edit/*", function (req, res) {
        var env = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: [40, 130, 130, 130],
        });
        res.send(Object.entries(req.body).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a[k] = env[k];
            return a;
        }, {}));
    });
    router.get("/edit/*", function (req, res) {
        var env = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: [40, 130, 130, 130],
        });
        var container = (preact_1.factory(Container_1.Container, { title: "Top" },
            preact_1.factory("div", { className: "csv-control-panel" },
                preact_1.factory("input", { id: "csv-data-input", className: "", type: "text" })),
            preact_1.factory(CsvTable_1.CsvTable, { id: "csv-table", data: env.csv, left: 30, top: 30, dataname: env.dataname, defaultCellSize: env.defaultCellSize, fixedPoint: env.fixedPoint, rowSize: env.rowSize })));
        res.send(preact_1.render(container));
    });
    router.post("/edit/*", function (req, res) {
        var env = envParser(req, {
            fixedPoint: { x: 1, y: 1 },
            rowSize: [40, 130, 130, 130],
        });
        res.send(Object.entries(req.body).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a[k] = env[k];
            return a;
        }, {}));
    });
    return router;
}
exports.EnvRouter = EnvRouter;
//# sourceMappingURL=env-router.js.map