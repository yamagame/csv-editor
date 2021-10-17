"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var preact_1 = require("libs/preact");
function Container(_a) {
    var title = _a.title, children = _a.children;
    return (preact_1.factory("html", { lang: "en" },
        preact_1.factory("head", null,
            preact_1.factory("meta", { charset: "UTF-8" }),
            preact_1.factory("meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge" }),
            preact_1.factory("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            preact_1.factory("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            preact_1.factory("link", { rel: "stylesheet", type: "text/css", href: "/index.css" }),
            preact_1.factory("title", null, title)),
        preact_1.factory("body", { onload: "main()" },
            preact_1.factory("script", { type: "text/javascript", src: "/index.js" }),
            children)));
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map