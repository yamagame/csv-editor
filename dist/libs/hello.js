"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorld = exports.Table = void 0;
var preact_1 = require("./preact");
function Table() {
    var a = 100;
    return (preact_1.factory(preact_1.Fragment, null,
        preact_1.factory("div", { className: "test", v: a }, "Hello World")));
}
exports.Table = Table;
var HelloWorld = function () { return preact_1.factory("div", null, "Hello"); };
exports.HelloWorld = HelloWorld;
//# sourceMappingURL=hello.js.map