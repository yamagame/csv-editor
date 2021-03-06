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
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.Fragment = exports.factory = void 0;
var join = function (children) {
    return children
        .map(function (v) {
        if (Array.isArray(v))
            return join(v);
        return v;
    })
        .join("");
};
function factory(tag, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    if (typeof tag === "function") {
        return tag(__assign(__assign({}, props), { children: children }));
    }
    var propStr = props
        ? "".concat(Object.entries(props)
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            if (k === "className")
                return ["class", v];
            if (k === "onClick")
                return ["onClick", v];
            var _k = k.replace(/([A-Z])/g, "-$&").toLocaleLowerCase();
            if (_k) {
                return [_k, v];
            }
            return [k, v];
        })
            .filter(function (_a) {
            var k = _a[0], v = _a[1];
            return v !== undefined && v !== null && v !== false;
        })
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            if (typeof v === "object") {
                var _v = Object.entries(v)
                    .map(function (_a) {
                    var k = _a[0], v = _a[1];
                    var _k = k.replace(/([A-Z])/g, "-$&").toLocaleLowerCase();
                    if (k === "zIndex")
                        return "".concat(_k, ": ").concat(v);
                    if (k === "opacity")
                        return "".concat(_k, ": ").concat(v);
                    return "".concat(_k, ": ").concat(typeof v === "number" ? "".concat(v, "px") : v);
                })
                    .join("; ");
                return "".concat(k, "=\"").concat(_v, "\"");
            }
            return "".concat(k, "=\"").concat(v, "\"");
        })
            .join(" ")).trim()
        : "";
    return "<".concat(tag).concat(propStr ? " ".concat(propStr) : "", ">").concat(join(children), "</").concat(tag, ">");
}
exports.factory = factory;
function Fragment(props) {
    var children = props.children;
    return join(children);
}
exports.Fragment = Fragment;
function render(content) {
    return "<!DOCTYPE html>".concat(content);
}
exports.render = render;
//# sourceMappingURL=preact.js.map