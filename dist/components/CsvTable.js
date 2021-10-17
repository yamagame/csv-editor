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
exports.CsvTable = exports.ThumbCell = exports.TableCell = exports.TableThumbs = exports.ResizeMarker = void 0;
var preact_1 = require("libs/preact");
var utils_1 = require("libs/utils");
var ResizeMarker = function (_a) {
    var _b = _a.topOffset, topOffset = _b === void 0 ? 0 : _b;
    return (preact_1.factory(preact_1.Fragment, null,
        preact_1.factory("div", { className: "table-resize-marker horizontal", dataTopOffset: topOffset }),
        preact_1.factory("div", { className: "table-resize-marker vertical", dataTopOffset: topOffset })));
};
exports.ResizeMarker = ResizeMarker;
var TableThumbs = function (_a) {
    var cells = _a.cells, _b = _a.topOffset, topOffset = _b === void 0 ? 0 : _b, rowWidth = _a.rowWidth, colHeight = _a.colHeight, sumTop = _a.sumTop, sumLeft = _a.sumLeft, direction = _a.direction;
    return cells.map(function (d) {
        return d.map(function (cell) {
            var top = sumTop(cell.y) - topOffset;
            var left = sumLeft(cell.x);
            var width = rowWidth[cell.x];
            var height = colHeight[cell.y];
            if (cell.x === 0 && cell.y === 0)
                return null;
            return (preact_1.factory(preact_1.Fragment, null,
                direction.match("horizontal") && cell.x === 0 ? (preact_1.factory(preact_1.Fragment, null,
                    cell.y > 1 ? (preact_1.factory("div", { className: "table-thumb row-resize", style: {
                            left: left,
                            top: top,
                            width: width,
                            height: "2px",
                            cursor: "row-resize",
                            // backgroundColor: "blue",
                        }, dataX: cell.x, dataY: cell.y - 1 })) : null,
                    preact_1.factory("div", { className: "table-thumb row-resize", style: {
                            top: top + height - 1,
                            left: left,
                            width: width,
                            height: "2px",
                            cursor: "row-resize",
                            // backgroundColor: "blue",
                        }, dataX: cell.x, dataY: cell.y }))) : null,
                direction.match("vertical") && cell.y === 0 ? (preact_1.factory(preact_1.Fragment, null,
                    cell.x > 1 ? (preact_1.factory("div", { className: "table-thumb col-resize", style: {
                            left: left,
                            top: top,
                            height: height,
                            cursor: "col-resize",
                            width: "2px",
                            // backgroundColor: "lightgray",
                        }, dataX: cell.x - 1, dataY: cell.y })) : null,
                    preact_1.factory("div", { className: "table-thumb col-resize", style: {
                            left: left + width - 2 + "px",
                            top: top,
                            height: height,
                            cursor: "col-resize",
                            width: "2px",
                            // backgroundColor: "lightgray",
                        }, dataX: cell.x, dataY: cell.y }))) : null));
        });
    });
};
exports.TableThumbs = TableThumbs;
var TableCell = function (props) {
    var children = props.children, className = props.className, data = props.data, marker = props.marker, name = props.name;
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
    return (preact_1.factory("div", __assign({ className: className, name: name, style: deleteUndef(__assign({}, props)) }, dataProps),
        children,
        marker && (preact_1.factory(exports.TableCell, { className: "table-marker", name: className, position: "absolute", zIndex: props.zIndex || 0, width: 100, height: 24, left: 0, top: 0 }))));
};
exports.TableCell = TableCell;
var ThumbCell = function (props) {
    var children = props.children, className = props.className, data = props.data, name = props.name;
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
    return (preact_1.factory("div", __assign({ className: className, name: name, style: deleteUndef(__assign({ position: "absolute" }, props)) }, dataProps), children));
};
exports.ThumbCell = ThumbCell;
var CsvTable = function (_a) {
    var _b = _a.data, data = _b === void 0 ? [] : _b, _c = _a.id, id = _c === void 0 ? "csv-table" : _c, _d = _a.dataname, dataname = _d === void 0 ? "" : _d, _e = _a.fixedPoint, fixedPoint = _e === void 0 ? { x: 1, y: 1 } : _e, _f = _a.defaultCellSize, defaultCellSize = _f === void 0 ? { width: 50, height: 18 } : _f, _g = _a.top, top = _g === void 0 ? 50 : _g, _h = _a.left, left = _h === void 0 ? 0 : _h, _j = _a.rowSize, rowSize = _j === void 0 ? [] : _j, _k = _a.colSize, colSize = _k === void 0 ? [] : _k;
    var csvArray = data;
    var maxRow = csvArray.reduce(function (a, v) { return (a < v.length ? v.length : a); }, 0);
    var maxCol = csvArray.length;
    var rowArray = new Array(maxRow).fill(0);
    var colArray = new Array(maxCol).fill(0);
    var rowWidth = rowArray.map(function (v) { return defaultCellSize.width; });
    var colHeight = colArray.map(function (v) { return defaultCellSize.height; });
    rowSize.forEach(function (v, i) {
        if (v > 0) {
            rowWidth[i] = v;
        }
    });
    colSize.forEach(function (v, i) {
        if (v > 0) {
            colHeight[i] = v;
        }
    });
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
        var color = props.color;
        delete props.color;
        return (preact_1.factory(exports.TableCell, __assign({ className: "csv-table-cell", data: {
                x: cell.x,
                y: cell.y,
                top: top,
                left: left,
            }, left: left + cell.ox, top: top + cell.oy, width: rowWidth[cell.x] - 1, height: colHeight[cell.y] - 1 }, props),
            preact_1.factory("div", { style: { color: color, top: 1 } }, utils_1.escapeHtml(cell.value))));
    };
    var leftOffset = rowWidth.reduce(function (a, v, i) { return (i <= fixedPoint.x ? a + v : a); }, 0) * 2;
    var topOffset = colHeight.reduce(function (a, v, i) { return (i <= fixedPoint.y ? a + v : a); }, 0) * 2;
    var topLeftCells = csvArray.map(function (v, y) {
        return rowArray
            .map(function (_, x) {
            return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: 0 });
        })
            .filter(function (cell) { return cell.x <= fixedPoint.x && cell.y <= fixedPoint.y; });
    });
    var topCells = csvArray.map(function (v, y) {
        return rowArray
            .map(function (_, x) {
            return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: -0, oy: -topOffset });
        })
            .filter(function (cell) { return cell.x > fixedPoint.x && cell.y <= fixedPoint.y; })
            .map(function (cell) { return (__assign({}, cell)); });
    });
    var leftCells = csvArray.map(function (v, y) {
        return rowArray
            .map(function (_, x) {
            return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: -topOffset });
        })
            .filter(function (cell) { return cell.x <= fixedPoint.x && cell.y > fixedPoint.y; });
    });
    var rightBottomCells = csvArray.map(function (v, y) {
        return rowArray
            .map(function (_, x) {
            return __assign(__assign({}, (v[x] || { value: "" })), { x: x, y: y, ox: 0, oy: 0 });
        })
            .filter(function (cell) { return cell.x > fixedPoint.x && cell.y > fixedPoint.y; });
    });
    return (preact_1.factory("div", { id: id, className: "csv-table", style: {
            left: left,
            top: top,
            height: sumTop(maxCol) + 1,
            width: sumLeft(maxRow) + 1,
            // backgroundColor: "pink",
        }, dataName: dataname },
        preact_1.factory(exports.TableCell, { className: "table-top-left", position: "fixed", zIndex: 30, marker: true, width: sumLeft(fixedPoint.x + 1), height: sumTop(fixedPoint.y + 1), 
            // height={0 /* sumTop(fixedPoint.y + 1)*/}
            left: left, top: top },
            topLeftCells.map(function (d) {
                return d.map(function (cell) {
                    return DataCell(cell, {
                        backgroundColor: cell.backgroundColor || "white",
                        color: cell.color || "black",
                    });
                });
            }),
            preact_1.factory(exports.TableThumbs, { direction: "horizontal vertical", cells: topLeftCells, rowWidth: rowWidth, colHeight: colHeight, sumTop: sumTop, sumLeft: sumLeft }),
            preact_1.factory(exports.ResizeMarker, { topOffset: topOffset })),
        preact_1.factory(exports.TableCell, { className: "table-top", position: "sticky", zIndex: 10, marker: true, width: sumLeft(maxRow) + 2, height: 0, left: 0, top: topOffset + top },
            topCells.map(function (d) {
                return d.map(function (cell) {
                    return DataCell(cell, {
                        backgroundColor: cell.backgroundColor || "white",
                        color: cell.color || "black",
                        pointerEvents: "auto",
                    });
                });
            }),
            preact_1.factory(exports.TableThumbs, { direction: "vertical", topOffset: topOffset, cells: topCells, rowWidth: rowWidth, colHeight: colHeight, sumTop: sumTop, sumLeft: sumLeft })),
        preact_1.factory(exports.TableCell, { className: "table-left", position: "sticky", zIndex: 20, marker: true, width: sumLeft(fixedPoint.x + 1), height: sumTop(maxCol) - topOffset + 1, marginLeft: 0, left: left, top: topOffset + top },
            leftCells.map(function (d) {
                return d.map(function (cell) {
                    return DataCell(cell, {
                        backgroundColor: cell.backgroundColor || "white",
                        color: cell.color || "black",
                    });
                });
            }),
            preact_1.factory(exports.TableThumbs, { direction: "horizontal", topOffset: topOffset, cells: leftCells, rowWidth: rowWidth, colHeight: colHeight, sumTop: sumTop, sumLeft: sumLeft })),
        preact_1.factory(exports.TableCell, { className: "table-right-bottom", zIndex: 0, marker: true, width: sumLeft(maxRow) + 2, height: 0 /*sumTop(maxCol) + 1*/, left: 0, top: 0 }, rightBottomCells.map(function (d, y) {
            return d.map(function (cell) {
                return DataCell(cell, {
                    backgroundColor: cell.backgroundColor || "white",
                    color: cell.color || "black",
                    // visibility: y > 10 ? "hidden" : "visible",
                });
            });
        }))));
};
exports.CsvTable = CsvTable;
//# sourceMappingURL=CsvTable.js.map