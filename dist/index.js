"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var preact_1 = require("libs/preact");
var path = require("path");
var express_1 = __importDefault(require("express"));
var utils_1 = require("libs/utils");
var Container_1 = require("components/Container");
var env_router_1 = require("routers/env-router");
var csv_router_1 = require("routers/csv-router");
var TARGET_DIR = process.env.TARGET_DIR || "test-csv";
var app = express_1.default();
var port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use("/env/edit", env_router_1.EnvEditRouter({ search_dir: TARGET_DIR }));
app.use("/env/view", env_router_1.EnvViewRouter({ search_dir: TARGET_DIR }));
app.use("/csv", csv_router_1.CsvRouter({ search_dir: TARGET_DIR }));
app.use("/action", function (req, res) {
    console.log(req.body);
    res.sendStatus(200);
});
app.get("/", function (req, res) {
    var container = (preact_1.factory(Container_1.Container, { title: "Top" },
        preact_1.factory("section", null, utils_1.readDir(TARGET_DIR, function (filepath) {
            return path.extname(filepath) === ".csv";
        }).map(function (v) { return (preact_1.factory("div", null,
            preact_1.factory("a", { href: "/csv/view" + v }, v))); })),
        preact_1.factory("section", null, utils_1.readDir(TARGET_DIR, function (filepath) {
            return path.basename(filepath) === "sample-env";
        }).map(function (v) { return (preact_1.factory("div", null,
            preact_1.factory("a", { href: "/env/view" + v }, v))); })),
        preact_1.factory("section", null,
            preact_1.factory("div", null,
                preact_1.factory("a", { href: "/env/edit/sample-env" }, "sample-env")))));
    res.send(preact_1.render(container));
});
app.listen(port, function () {
    console.log("env-manager app listening at http://localhost:" + port);
});
//# sourceMappingURL=index.js.map