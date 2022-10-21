"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var preact_1 = require("libs/preact");
function Container(_a) {
    var title = _a.title, children = _a.children;
    return ((0, preact_1.factory)("html", { lang: "en" },
        (0, preact_1.factory)("head", null,
            (0, preact_1.factory)("meta", { charset: "UTF-8" }),
            (0, preact_1.factory)("meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge" }),
            (0, preact_1.factory)("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            (0, preact_1.factory)("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            (0, preact_1.factory)("link", { rel: "stylesheet", type: "text/css", href: "/index.css" }),
            (0, preact_1.factory)("title", null, title)),
        (0, preact_1.factory)("body", { onload: "main()" },
            (0, preact_1.factory)("script", { type: "text/javascript", src: "/csv-macro.js" }),
            (0, preact_1.factory)("script", { type: "text/javascript", src: "/csv-common.js" }),
            children)));
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map