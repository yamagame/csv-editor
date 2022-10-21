var fs = require("fs");
var path = require("path");
function log(message /*: string */) {
    console.log("[dotenv][DEBUG] ".concat(message));
}
var NEWLINE = "\n";
var RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
var RE_NEWLINES = /\\n/g;
var NEWLINES_MATCH = /\n|\r|\r\n/;
// Parses src into an Object
function parse(src /*: string | Buffer */, options /*: ?DotenvParseOptions */) {
    var debug = Boolean(options && options.debug);
    var obj = [];
    // convert Buffers before splitting into lines and processing
    src
        .toString()
        .split(NEWLINES_MATCH)
        .forEach(function (line, idx) {
        // matching "KEY' and 'VAL' in 'KEY=VAL'
        var keyValueArr = line.match(RE_INI_KEY_VAL);
        // matched?
        if (keyValueArr != null) {
            var key = keyValueArr[1];
            // default undefined or missing values to empty string
            var val = keyValueArr[2] || "";
            var end = val.length - 1;
            var isDoubleQuoted = val[0] === '"' && val[end] === '"';
            var isSingleQuoted = val[0] === "'" && val[end] === "'";
            // if single or double quoted, remove quotes
            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end);
                // if double quoted, expand newlines
                if (isDoubleQuoted) {
                    val = val.replace(RE_NEWLINES, NEWLINE);
                }
            }
            else {
                // remove surrounding whitespace
                val = val.trim();
            }
            obj.push({
                key: key,
                value: val,
                quoted: isDoubleQuoted ? '"' : isSingleQuoted ? "'" : "",
            });
        }
        else if (line === "") {
            // obj.push({});
        }
        else if (debug) {
            log("did not match key and value when parsing line ".concat(idx + 1, ": ").concat(line));
        }
    });
    return obj;
}
function config(dotenvPath) {
    var encoding = "utf8";
    var debug = false;
    try {
        return parse(fs.readFileSync(dotenvPath, { encoding: encoding }), { debug: debug });
    }
    catch (e) {
        return { error: e };
    }
}
function stringify(parsed) {
    var ret = "";
    parsed.forEach(function (env) {
        ret += "".concat(env.key, "=").concat(env.quoted).concat(env.value).concat(env.quoted, "\n");
    });
    return ret;
}
function trimQuote(value) {
    var ts = [/^"(.+)"$/, /^'(.+)'$/];
    for (var i = 0; i < ts.length; i++) {
        var m = value.trim().match(ts[i]);
        if (m) {
            return m[1].replace(/""/g, '"');
        }
    }
    return value;
}
module.exports.load = config;
module.exports.stringify = stringify;
module.exports.trimQuote = trimQuote;
//# sourceMappingURL=env-parser.js.map