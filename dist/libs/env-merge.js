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
Object.defineProperty(exports, "__esModule", { value: true });
exports.envParser = void 0;
var utils_1 = require("libs/utils");
var rowSize = [40, 130, 130, 130, 130];
var colSize = [0, 0];
function envParser(search_dir, filename, options) {
    if (options === void 0) { options = {}; }
    var defaultOptions = __assign({ defaultCellSize: { width: 50, height: 18 }, fixedPoint: { x: 0, y: 0 }, rowSize: rowSize, colSize: colSize }, options);
    var envParser = require("libs/env-parser");
    var envFiles = utils_1.readDir(search_dir, function (filepath) {
        return path.basename(filepath) === filename;
    });
    var envData = {};
    var envKeys = {};
    var envTemp = envFiles.map(function (filepath) {
        var envFilePath = path.join(search_dir, filepath);
        var data = envParser.load(envFilePath);
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
        ], envFiles.map(function (v) {
            return ({
                value: v,
            });
        }))
    ], Object.entries(envData).map(function (env) {
        return __spreadArray([{ value: env[0] }], env[1]);
    }));
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
    csv.forEach(function (col, y) {
        if (y <= 0)
            return;
        if (y <= 1) {
            col.forEach(function (cell, x) {
                if (x > 0) {
                    cell.backgroundColor = "lightgray";
                }
            });
        }
        else {
            col.forEach(function (cell, x) {
                if (x > 0 && x <= 1) {
                    cell.backgroundColor = "lightgray";
                }
            });
        }
    });
    return __assign({ csv: csv }, __assign(__assign(__assign({}, defaultOptions), options), { dataname: filename, maxRow: maxRow + 1, maxCol: maxCol + 1 }));
}
exports.envParser = envParser;
//# sourceMappingURL=env-merge.js.map