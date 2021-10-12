"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJson = exports.loadJson = exports.readDir = exports.removeQuote = exports.escapeHtml = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function escapeHtml(string) {
    if (typeof string !== "string") {
        return string;
    }
    return removeQuote(string).replace(/[&'`"<>]/g, function (match) {
        return {
            "&": "&amp;",
            "'": "&#x27;",
            "`": "&#x60;",
            '"': "&quot;",
            "<": "&lt;",
            ">": "&gt;",
        }[match];
    });
}
exports.escapeHtml = escapeHtml;
function removeQuote(value) {
    var ts = [/^"(.+)"$/, /^'(.+)'$/];
    for (var i = 0; i < ts.length; i++) {
        var m = value.trim().match(ts[i]);
        if (m) {
            return m[1].replace(/""/g, '"');
        }
    }
    return value;
}
exports.removeQuote = removeQuote;
var readDir = function (rootDir, callback) {
    var _readDir = function (dir) {
        var result = [];
        var files = fs_1.default.readdirSync(dir);
        files.forEach(function (file) {
            var filepath = path_1.default.join(dir, file);
            var stat = fs_1.default.statSync(filepath);
            if (stat.isDirectory()) {
                if (path_1.default.parse(filepath).name !== "node_modules") {
                    result = __spreadArray(__spreadArray([], result), _readDir(filepath));
                }
            }
            else if (stat.isFile()) {
                if (callback(filepath)) {
                    result.push(filepath.replace(rootDir, ""));
                }
            }
        });
        return result;
    };
    return _readDir(rootDir);
};
exports.readDir = readDir;
var loadJson = function (basepath) {
    var name = path_1.default.basename(basepath);
    var dir = path_1.default.dirname(basepath);
    var filepath = path_1.default.format({ dir: dir, name: name, ext: ".json" });
    try {
        return JSON.parse(fs_1.default.readFileSync(filepath, "utf-8"));
    }
    catch (_a) {
        return {};
    }
};
exports.loadJson = loadJson;
var saveJson = function (basepath, params) {
    var name = path_1.default.basename(basepath);
    var dir = path_1.default.dirname(basepath);
    var filepath = path_1.default.format({ dir: dir, name: name, ext: ".json" });
    try {
        var data_1 = JSON.parse(fs_1.default.readFileSync(filepath, "utf-8"));
        var updated_1 = false;
        Object.keys(params).forEach(function (key) {
            if (params[key]) {
                data_1[key] = params[key];
                updated_1 = true;
            }
        });
        if (updated_1) {
            fs_1.default.writeFileSync(filepath, JSON.stringify(data_1, null, "  "), "utf8");
        }
    }
    catch (_a) {
        return {};
    }
};
exports.saveJson = saveJson;
//# sourceMappingURL=utils.js.map