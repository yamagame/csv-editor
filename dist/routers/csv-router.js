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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.CsvRouter = void 0;
var fs = require("fs");
var path = require("path");
var spawn = require("child_process").spawn;
var preact_1 = require("libs/preact");
var utils_1 = require("libs/utils");
var express_1 = __importDefault(require("express"));
var CsvTable_1 = require("components/CsvTable");
var Container_1 = require("components/Container");
function CsvRouter(config) {
    var _this = this;
    if (config === void 0) { config = {}; }
    var router = express_1.default.Router();
    var rowSize = config.cellWidth || [40, 0];
    var colSize = config.cellHeight || [0];
    var defaultCellSize = { width: 130, height: 18 };
    var alphabetNumber = function (index) {
        var char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var length = char.length;
        var ret = "";
        ret = char[index % length] + ret;
        index = Math.floor(index / length);
        while (index > 0) {
            ret = char[((index - 1) % length) % length] + ret;
            index = Math.floor((index - 1) / length);
        }
        return ret;
    };
    function csvParser(filename, options) {
        if (options === void 0) { options = {}; }
        var defaultOptions = {
            defaultCellSize: defaultCellSize,
            fixedPoint: { x: 0, y: 0 },
            rowSize: [],
            colSize: [],
        };
        var csvParser = require("libs/csv-parser");
        var csvFilePath = path.join(filename);
        var csvArray = csvParser.load(csvFilePath);
        var csvJson = (0, utils_1.loadJson)(csvFilePath);
        var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
        var maxCol = csvArray.length;
        var header = new Array(maxRow + 1).fill(0).map(function (v, i) { return ({
            value: "".concat(alphabetNumber(i)),
            color: "white",
            backgroundColor: "gray",
        }); });
        var csv = __spreadArray([
            header
        ], csvArray.map(function (v, i) { return __spreadArray([
            { value: "".concat(i + 1), color: "white", backgroundColor: "gray" }
        ], v, true); }), true);
        return __assign({ csv: csv }, __assign(__assign(__assign(__assign(__assign({}, defaultOptions), options), { dataname: filename, maxRow: maxRow + 1, maxCol: maxCol + 1 }), csvJson), { defaultCellSize: __assign(__assign({}, defaultCellSize), options.defaultCellSize) }));
    }
    router.post("/command", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, file, text, configData, cmd;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, file = _a.file, text = _a.text;
                    return [4 /*yield*/, (0, utils_1.findConfig)(config.path, file, utils_1.defaultConfig)];
                case 1:
                    configData = _b.sent();
                    if (configData.command) {
                        try {
                            console.log(configData.command, file, text);
                            cmd = spawn("".concat(configData.command), [file, text], {
                                shell: true,
                            });
                            cmd.stdout.on("data", function (data) {
                                console.log(data.toString());
                            });
                            cmd.stderr.on("data", function (data) {
                                console.error(data.toString());
                            });
                            cmd.on("exit", function (code) {
                                console.log("Child exited with code ".concat(code));
                            });
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    res.sendStatus(200);
                    return [2 /*return*/];
            }
        });
    }); });
    router.get("/download/*", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var file, data;
        return __generator(this, function (_a) {
            file = req.query.file;
            try {
                if (!fs.existsSync(file)) {
                    return [2 /*return*/, res.sendStatus(404)];
                }
                data = fs.readFileSync(file, { encoding: "utf-8" });
                res.setHeader("content-disposition", "attachment; filename=".concat(path.basename(file)));
                res.setHeader("content-type", "text/csv; charset=UTF-8");
                res.send(data);
            }
            catch (err) {
                res.sendStatus(404);
            }
            return [2 /*return*/];
        });
    }); });
    router.post("/save/*", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var file, configData, data, _a, maxRow, maxCol, csvParser_1, csvData, csvString, csvPath, _b, rowSize_1, colSize_1, csvFilePath, cmd;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    file = req.query.file;
                    return [4 /*yield*/, (0, utils_1.findConfig)(config.path, file, utils_1.defaultConfig)];
                case 1:
                    configData = _c.sent();
                    data = csvParser(file, {
                        fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
                        rowSize: configData.rowSize || rowSize,
                        colSize: configData.colSize || colSize,
                        defaultCellSize: configData.defaultCellSize || defaultCellSize,
                    });
                    _a = req.body, maxRow = _a.maxRow, maxCol = _a.maxCol;
                    req.body.csv.forEach(function (cell) {
                        if (data.csv.length <= cell.y) {
                            data.csv = __spreadArray(__spreadArray([], data.csv, true), new Array(cell.y - data.csv.length + 1).fill([]), true);
                        }
                        if (data.csv[cell.y].length <= cell.x) {
                            data.csv[cell.y] = __spreadArray(__spreadArray([], data.csv[cell.y], true), new Array(cell.x - data.csv[cell.y].length + 1).fill({
                                value: "",
                            }), true);
                        }
                        try {
                            data.csv[cell.y][cell.x] = { value: cell.value };
                        }
                        catch (_a) { }
                    });
                    {
                        csvParser_1 = require("libs/csv-parser");
                        csvData = __spreadArray([], data.csv, true).slice(1).map(function (col) { return col.slice(1); });
                        csvString = csvParser_1.stringify(csvData.map(function (v) { return v.slice(0, maxRow - 1); }).slice(0, maxCol - 1));
                        csvPath = req.query.file;
                        fs.writeFileSync(csvPath, csvString);
                    }
                    {
                        _b = req.body, rowSize_1 = _b.rowSize, colSize_1 = _b.colSize;
                        csvFilePath = req.query.file.toString();
                        (0, utils_1.saveJson)(csvFilePath, { rowSize: rowSize_1, colSize: colSize_1, maxCol: maxCol, maxRow: maxRow });
                    }
                    if (configData.execute) {
                        try {
                            console.log(configData.execute, file);
                            cmd = spawn("".concat(configData.execute), [file], {
                                shell: true,
                            });
                            cmd.stdout.on("data", function (data) {
                                console.log(data.toString());
                            });
                            cmd.stderr.on("data", function (data) {
                                console.error(data.toString());
                            });
                            cmd.on("exit", function (code) {
                                console.log("Child exited with code ".concat(code));
                            });
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    res.send({ result: "OK" });
                    return [2 /*return*/];
            }
        });
    }); });
    router.post("/view/*", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var configData, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.findConfig)(config.path, req.query.file, utils_1.defaultConfig)];
                case 1:
                    configData = _a.sent();
                    data = csvParser(req.query.file, {
                        fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
                        rowSize: configData.rowSize || rowSize,
                        colSize: configData.colSize || colSize,
                        defaultCellSize: configData.defaultCellSize || defaultCellSize,
                    });
                    data.form = configData.form;
                    data.edit = configData.edit;
                    res.send(Object.entries(req.body).reduce(function (a, _a) {
                        var k = _a[0], v = _a[1];
                        a[k] = data[k];
                        return a;
                    }, {}));
                    return [2 /*return*/];
            }
        });
    }); });
    router.get("/view", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var configData, data, container;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.findConfig)(config.path, req.query.file, utils_1.defaultConfig)];
                case 1:
                    configData = _a.sent();
                    data = csvParser(req.query.file, {
                        fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
                        rowSize: configData.rowSize || rowSize,
                        colSize: configData.colSize || colSize,
                        defaultCellSize: configData.defaultCellSize || defaultCellSize,
                    });
                    container = ((0, preact_1.factory)(Container_1.Container, { title: "CSV-Editor" },
                        (0, preact_1.factory)("div", { className: "csv-control-panel" },
                            (0, preact_1.factory)("a", { href: "/list/".concat(configData.groupIndex) },
                                (0, preact_1.factory)("span", { className: "csv-data-name" }, configData.name)),
                            ":",
                            (0, preact_1.factory)("span", { className: "csv-data-name" }, data.dataname),
                            (0, preact_1.factory)("input", { className: "csv-data-input", type: "text" }),
                            (0, preact_1.factory)("input", { className: "csv-button", type: "button", value: "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9", onClick: "download();" }),
                            configData.edit !== false ? ((0, preact_1.factory)("input", { className: "csv-button", type: "button", value: "\u30BB\u30FC\u30D6", onClick: "save();" })) : null),
                        (0, preact_1.factory)(CsvTable_1.CsvTable, { id: "csv-table", data: data.csv, left: 0, top: 30, dataname: data.dataname, defaultCellSize: data.defaultCellSize, fixedPoint: data.fixedPoint, rowSize: data.rowSize, colSize: data.colSize, form: configData.form }),
                        (0, preact_1.factory)("script", { type: "text/javascript", src: "/csv-index.js" })));
                    res.send((0, preact_1.render)(container));
                    return [2 /*return*/];
            }
        });
    }); });
    return router;
}
exports.CsvRouter = CsvRouter;
//# sourceMappingURL=csv-router.js.map