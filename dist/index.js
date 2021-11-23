"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = require("libs/preact");
var spawn = require("child_process").spawn;
var path = require("path");
var express_1 = __importDefault(require("express"));
var utils_1 = require("libs/utils");
var Container_1 = require("components/Container");
var env_router_1 = require("routers/env-router");
var csv_router_1 = require("routers/csv-router");
var CONFIG_PATH = process.env.CONFIG_PATH || "./config.json";
var app = express_1.default();
var port = process.env.PORT || 3000;
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use(express_1.default.static("public"));
app.use("/csv", csv_router_1.CsvRouter({
    path: CONFIG_PATH,
    id: "csv-viewer",
}));
app.use("/env", env_router_1.EnvViewRouter({
    path: CONFIG_PATH,
    id: "env-viewer",
}));
app.post("/exec/:groupId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cmd;
    return __generator(this, function (_a) {
        if (process.env.SCRIPT_CMD) {
            cmd = spawn("node", [
                process.env.SCRIPT_CMD,
                req.params.groupId,
                "\"" + JSON.stringify(req.body) + "\"",
            ], {
                shell: true,
            });
            cmd.stdout.on("data", function (data) {
                process.stdout.write(data.toString());
            });
            cmd.stderr.on("data", function (data) {
                process.stderr.write(data.toString());
            });
            cmd.on("exit", function (code) {
                console.log("Child exited with code " + code);
            });
        }
        res.sendStatus(200);
        return [2 /*return*/];
    });
}); });
var readReademe = function (groupId) {
    if (process.env.README_CMD) {
        return new Promise(function (resolve) {
            var readme = "";
            var cmd = spawn("node", [process.env.README_CMD, groupId], {
                shell: true,
            });
            cmd.stdout.on("data", function (data) {
                console.error(data.toString());
                readme += data.toString();
            });
            cmd.stderr.on("data", function (data) {
                console.error(data.toString());
            });
            cmd.on("exit", function (code) {
                console.log("Child exited with code " + code);
                resolve(readme);
            });
        });
    }
    else {
        return "";
    }
};
var renderContainer = function (groupId) {
    if (groupId === void 0) { groupId = -1; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, directories, options, group, container, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0: return [4 /*yield*/, utils_1.loadConfig(CONFIG_PATH)];
                case 1:
                    _a = _m.sent(), directories = _a.directories, options = _a.options;
                    group = directories.find(function (g, i) { return i === groupId; });
                    _b = preact_1.factory;
                    _c = [Container_1.Container, { title: "CSV-Editor" }, preact_1.factory("div", { className: "csv-control-panel" },
                            preact_1.factory("div", { className: "csv-control-panel-grow" }),
                            preact_1.factory("form", null,
                                group.password ? (preact_1.factory("input", { className: "csv-option-input", type: "text", name: "id", placeholder: "ID" })) : null,
                                group.password ? (preact_1.factory("input", { className: "csv-option-input", type: "password", name: "password", placeholder: "PASS", autocomplete: "off" })) : null),
                            Object.entries(options)
                                .filter(function (_a) {
                                var key = _a[0], v = _a[1];
                                return key !== "id" && key !== "password";
                            })
                                .map(function (_a) {
                                var key = _a[0], option = _a[1];
                                return (preact_1.factory("select", { name: key, className: "csv-option-selector csv-script-button" }, option.map(function (value) { return (preact_1.factory("option", { value: value }, value)); })));
                            }),
                            preact_1.factory("input", { className: "csv-button csv-script-button", type: "button", value: "\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C", disabled: groupId >= 0 && group.script ? false : true, onClick: "exec(" + groupId + ");" }))];
                    _d = preact_1.factory;
                    _e = ["div", { className: "csv-list-container" }, preact_1.factory("div", { className: "csv-row-1" },
                            preact_1.factory("div", { className: "csv-list-item csv-list-title" }, "\u30B0\u30EB\u30FC\u30D7\u540D"),
                            directories.map(function (group, i) { return (preact_1.factory("div", { className: "csv-list-item csv-list-hover " + (i === groupId ? "csv-group-active-cell" : ""), onclick: "window.location.href='/list/" + i + "';" },
                                preact_1.factory("a", { className: "group-name " + (i === groupId ? "csv-group-active" : ""), href: "/list/" + i }, group.name))); })), preact_1.factory("div", { className: "csv-row-2" },
                            preact_1.factory("div", { className: "csv-list-item csv-list-title" }, "\u30D5\u30A1\u30A4\u30EB\u540D"),
                            group &&
                                utils_1.readDir(group.path, function (filepath) {
                                    if (group.files) {
                                        var basename = path.basename(filepath);
                                        return group.files.indexOf(basename) >= 0;
                                    }
                                    if (group.extension) {
                                        var ext = path.extname(filepath);
                                        return ext !== "" && group.extension.indexOf(ext) >= 0;
                                    }
                                }).map(function (v) {
                                    var file = encodeURI(path.join(group.path, v));
                                    return (preact_1.factory("div", { className: "csv-list-item csv-list-hover", onclick: "window.location.href='/" + group.viewer + "?file=" + file + "';" },
                                        preact_1.factory("a", { href: "/" + group.viewer + "?file=" + file }, v)));
                                }))];
                    _f = preact_1.factory;
                    _g = ["div", { className: "csv-row-3" }];
                    _h = preact_1.factory;
                    _j = ["pre", { className: "csv-instrcution-container" }];
                    _k = preact_1.factory;
                    _l = ["code", null];
                    return [4 /*yield*/, readReademe(groupId)];
                case 2:
                    container = (_b.apply(void 0, _c.concat([_d.apply(void 0, _e.concat([_f.apply(void 0, _g.concat([_h.apply(void 0, _j.concat([_k.apply(void 0, _l.concat([_m.sent()]))]))]))])), preact_1.factory("script", { type: "text/javascript", src: "/index.js" })])));
                    return [2 /*return*/, preact_1.render(container)];
            }
        });
    });
};
app.get("/list/:groupId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).send;
                return [4 /*yield*/, renderContainer(parseInt(req.params.groupId))];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).send;
                return [4 /*yield*/, renderContainer()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("CSV-Editor app listening at http://localhost:" + port);
});
//# sourceMappingURL=index.js.map