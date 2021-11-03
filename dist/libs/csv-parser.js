"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var delim = ",";
function parse(src, _a) {
    var boolean = _a.debug;
    var row = [];
    var col = [];
    var i = 0;
    var val = "";
    var quat = "";
    if (src.length <= 0)
        return [[{ value: "" }]];
    do {
        if (src[i] === delim) {
            col.push({ value: val, quat: quat });
            val = "";
            quat = "";
        }
        else if (src[i] === "\n" || src[i] === "\r") {
            col.push({ value: val, quat: quat });
            val = "";
            quat = "";
            row.push(col);
            col = [];
            if (src[i + 1] === "\n" || src[i + 1] === "\r") {
                i++;
            }
        }
        else if (src[i] === '"') {
            // val = src[i];
            i++;
            do {
                if (src[i] === '"' && src[i + 1] === '"' && i < src.length - 1) {
                    i += 2;
                    val += '"';
                    continue;
                }
                else if (src[i] === '"') {
                    // val += src[i];
                    break;
                }
                val += src[i];
                i++;
            } while (i < src.length);
            quat = '"';
        }
        else {
            do {
                if (src[i] === delim) {
                    col.push({ value: val, quat: quat });
                    val = "";
                    quat = "";
                    break;
                }
                else if (src[i] === "\n" || src[i] === "\r") {
                    col.push({ value: val, quat: quat });
                    val = "";
                    quat = "";
                    row.push(col);
                    col = [];
                    if (src[i + 1] === "\n" || src[i + 1] === "\r") {
                        i++;
                    }
                    break;
                }
                val += src[i];
                i++;
            } while (i < src.length);
        }
        i++;
    } while (i < src.length);
    col.push({ value: val, quat: quat });
    if (col.length > 0) {
        row.push(col);
    }
    return row;
}
function load(src) {
    var encoding = "utf8";
    var debug = false;
    try {
        return parse(fs_1.default.readFileSync(src, { encoding: encoding }), { debug: debug });
    }
    catch (e) {
        return { error: e };
    }
}
function stringify(parsed) {
    var ret = "";
    parsed.forEach(function (row, i) {
        if (i > 0) {
            ret += "\n";
        }
        row.forEach(function (col, i) {
            if (i > 0) {
                ret += delim;
            }
            if (col.value.indexOf(",") >= 0 ||
                col.value.indexOf('"') >= 0 ||
                col.value.indexOf("\n") >= 0) {
                ret += "\"" + col.value.replace(/"/g, '""') + "\"";
            }
            else {
                ret += col.value;
            }
        });
    });
    return ret;
}
module.exports.parse = parse;
module.exports.load = load;
module.exports.stringify = stringify;
// prettier-ignore
if (require.main === module) {
    var csv = load("./test.csv");
    console.log(csv);
    console.log(stringify(csv));
}
//# sourceMappingURL=csv-parser.js.map