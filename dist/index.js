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
            cmd = spawn("node", [process.env.SCRIPT_CMD, req.params.groupId], {
                shell: true,
            });
            cmd.stdout.on("data", function (data) {
                console.error(data.toString());
            });
            cmd.stderr.on("data", function (data) {
                console.error(data.toString());
            });
            cmd.on("exit", function (code) {
                console.log("Child exited with code " + code);
            });
        }
        res.sendStatus(200);
        return [2 /*return*/];
    });
}); });
app.get("/readme/:groupId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cmd;
    return __generator(this, function (_a) {
        if (process.env.README_CMD) {
            cmd = spawn("node", [process.env.README_CMD, req.params.groupId], {
                shell: true,
            });
            cmd.stderr.on("data", function (data) {
                console.error(data.toString());
            });
            cmd.on("exit", function (code) {
                console.log("Child exited with code " + code);
            });
            cmd.stdout.pipe(res);
        }
        else {
            res.send("No Document");
        }
        return [2 /*return*/];
    });
}); });
app.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var directories, container;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, utils_1.loadConfig(CONFIG_PATH)];
            case 1:
                directories = (_a.sent()).directories;
                container = (preact_1.factory(Container_1.Container, { title: "CSV-Editor" },
                    preact_1.factory("div", { className: "csv-list-container" },
                        preact_1.factory("div", { className: "csv-row" }, directories.map(function (group, i) { return (preact_1.factory("section", null,
                            preact_1.factory("p", { className: "group-name", onClick: "loadReadme(this, " + i + ")" }, group.name),
                            utils_1.readDir(group.dir, function (filepath) {
                                if (group.files) {
                                    var basename = path.basename(filepath);
                                    return group.files.indexOf(basename) >= 0;
                                }
                                if (group.extension) {
                                    var ext = path.extname(filepath);
                                    return ext !== "" && group.extension.indexOf(ext) >= 0;
                                }
                            }).map(function (v) {
                                var file = encodeURI(path.join(group.dir, v));
                                return (preact_1.factory("div", { className: "group-item" },
                                    preact_1.factory("a", { href: group.viewer + "?file=" + file }, v)));
                            }))); })),
                        preact_1.factory("div", { className: "csv-row" },
                            preact_1.factory("section", { className: "csv-instruction" },
                                preact_1.factory("input", { className: "csv-button csv-script-button", type: "button", value: "\u30B9\u30AF\u30EA\u30D7\u30C8\u5B9F\u884C", disabled: true, onClick: "exec();" }),
                                preact_1.factory("pre", null,
                                    preact_1.factory("code", { className: "csv-instrcution-container" }))))),
                    preact_1.factory("script", { type: "text/javascript", src: "/index.js" })));
                res.send(preact_1.render(container));
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("CSV-Editor app listening at http://localhost:" + port);
});
//# sourceMappingURL=index.js.map