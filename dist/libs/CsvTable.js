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
exports.CsvTable = exports.TableCell = void 0;
var preact_1 = require("libs/preact");
var utils_1 = require("libs/utils");
var TableCell = function (props) {
    var children = props.children, className = props.className, data = props.data;
    delete props.children;
    delete props.className;
    delete props.data;
    var deleteUndef = function (style) {
        var r = __assign({}, style);
        Object.entries(style).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            return v === undefined && delete r[k];
        });
        return r;
    };
    var dataProps = data
        ? Object.entries(data).reduce(function (a, _a) {
            var k = _a[0], v = _a[1];
            a["data-" + k] = v;
            return a;
        }, {})
        : {};
    return (preact_1.factory("div", __assign({ className: className, style: deleteUndef(__assign({ position: "absolute" }, props)) }, dataProps), children));
};
exports.TableCell = TableCell;
var CsvTable = function (_a) {
    var _b = _a.data, data = _b === void 0 ? [] : _b, _c = _a.id, id = _c === void 0 ? "csv-table" : _c, _d = _a.browser, browser = _d === void 0 ? "chrome" : _d;
    var csvArray = data;
    var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
    var maxCol = csvArray.length;
    var rowArray = new Array(maxRow).fill(0);
    var colArray = new Array(maxCol).fill(0);
    var rowWidth = rowArray.map(function (v) { return 100; });
    var colHeight = colArray.map(function (v) { return 24; });
    rowWidth[0] = 50;
    rowWidth[1] = 50;
    var fixedPoint = { x: 1, y: 1 };
    var count = maxRow * maxCol;
    var sumTop = function (y) {
        return colHeight.reduce(function (a, v, i) {
            if (i < y)
                a += v;
            return a;
        }, 0);
    };
    var sumLeft = function (x) {
        return rowWidth.reduce(function (a, v, i) {
            if (i < x)
                a += v;
            return a;
        }, 0);
    };
    var DataCell = function (cell, props) {
        var top = sumTop(cell.y);
        var left = sumLeft(cell.x);
        return (preact_1.factory(exports.TableCell, __assign({ className: "table-cell", data: {
                x: cell.x,
                y: cell.y,
                top: top,
                left: left,
            }, zIndex: count--, left: left + cell.ox, top: top + cell.oy, width: rowWidth[cell.x], height: colHeight[cell.y], borderRight: "solid 1px", borderBottom: "solid 1px" }, props),
            preact_1.factory("div", { style: { marginLeft: 10 } }, utils_1.escapeHtml(cell.value))));
    };
    var leftOffset = rowWidth.reduce(function (a, v, i) { return (i <= fixedPoint.x ? a + v : a); }, 0) * 2;
    var topOffset = colHeight.reduce(function (a, v, i) { return (i <= fixedPoint.y ? a + v : a); }, 0) * 2;
    var p = (function () {
        switch (browser) {
            case "safari":
                return { x: 1, y: 1 };
            case "chrome":
            default:
                return { x: 0, y: 0 };
        }
    })();
    return (preact_1.factory("div", { id: id, className: "scroll-table", style: {
            left: 0,
            top: 50,
            height: sumTop(maxCol),
            width: sumLeft(maxRow),
        } },
        preact_1.factory(exports.TableCell, { className: "table-top-left", position: "sticky", zIndex: count + 300, width: sumLeft(fixedPoint.x + 1), height: sumTop(fixedPoint.y + 1), left: 0, top: 0 }, csvArray.map(function (v, y) {
            return rowArray
                .map(function (_, x) {
                return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: 0 });
            })
                .filter(function (cell) { return cell.x <= fixedPoint.x && cell.y <= fixedPoint.y; })
                .map(function (cell) { return DataCell(cell, { backgroundColor: "pink" }); });
        })),
        preact_1.factory(exports.TableCell, { className: "table-top", position: "sticky", zIndex: count + 100, width: sumLeft(maxRow) + 2, height: sumTop(fixedPoint.y + 1), left: p.x, top: leftOffset }, csvArray.map(function (v, y) {
            return rowArray
                .map(function (_, x) {
                return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: -p.x, oy: -leftOffset });
            })
                .filter(function (cell) { return cell.x > fixedPoint.x && cell.y <= fixedPoint.y; })
                .map(function (cell) { return (__assign({}, cell)); })
                .map(function (cell) { return DataCell(cell, { backgroundColor: "lightgray" }); });
        })),
        preact_1.factory(exports.TableCell, { className: "table-left", position: "sticky", zIndex: count + 200, width: sumLeft(fixedPoint.x + 1), height: sumTop(maxCol) - topOffset + 1, left: 0, top: topOffset + p.y }, csvArray.map(function (v, y) {
            return rowArray
                .map(function (_, x) {
                return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: -topOffset - p.y });
            })
                .filter(function (cell) { return cell.x <= fixedPoint.x && cell.y > fixedPoint.y; })
                .map(function (cell) { return DataCell(cell, { backgroundColor: "white" }); });
        })),
        preact_1.factory(exports.TableCell, { zIndex: 0, width: sumLeft(maxRow) + 2, height: sumTop(maxCol) + 1, left: 0, top: 0 }, csvArray.map(function (v, y) {
            return rowArray
                .map(function (_, x) {
                return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: 0 });
            })
                .filter(function (cell) { return cell.x > fixedPoint.x && cell.y > fixedPoint.y; })
                .map(function (cell) { return DataCell(cell, { backgroundColor: "white" }); });
        }))));
};
exports.CsvTable = CsvTable;
//# sourceMappingURL=CsvTable.js.map