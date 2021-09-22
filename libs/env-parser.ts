const fs = require("fs");
const path = require("path");

function log(message /*: string */) {
  console.log(`[dotenv][DEBUG] ${message}`);
}

const NEWLINE = "\n";
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

// Parses src into an Object
function parse(
  src /*: string | Buffer */,
  options /*: ?DotenvParseOptions */
) /*: DotenvParseOutput */ {
  const debug = Boolean(options && options.debug);
  const obj = [];

  // convert Buffers before splitting into lines and processing
  src
    .toString()
    .split(NEWLINES_MATCH)
    .forEach(function (line, idx) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL);
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1];
        // default undefined or missing values to empty string
        let val = keyValueArr[2] || "";
        const end = val.length - 1;
        const isDoubleQuoted = val[0] === '"' && val[end] === '"';
        const isSingleQuoted = val[0] === "'" && val[end] === "'";

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end);

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE);
          }
        } else {
          // remove surrounding whitespace
          val = val.trim();
        }

        obj.push({
          key: key,
          value: val,
          quoted: isDoubleQuoted ? '"' : isSingleQuoted ? "'" : "",
        });
      } else if (line === "") {
        // obj.push({});
      } else if (debug) {
        log(
          `did not match key and value when parsing line ${idx + 1}: ${line}`
        );
      }
    });

  return obj;
}

function config(dotenvPath) {
  let encoding = "utf8";
  let debug = false;
  try {
    return parse(fs.readFileSync(dotenvPath, { encoding }), { debug });
  } catch (e) {
    return { error: e };
  }
}

function stringify(parsed) {
  let ret = "";
  parsed.forEach(env => {
    ret += `${env.key}=${env.quoted}${env.value}${env.quoted}\n`;
  });
  return ret;
}

function trimQuote(value) {
  const ts = [/^"(.+)"$/, /^'(.+)'$/];
  for (let i = 0; i < ts.length; i++) {
    const m = value.trim().match(ts[i]);
    if (m) {
      return m[1].replace(/""/g, '"');
    }
  }
  return value;
}

module.exports.load = config;
module.exports.stringify = stringify;
module.exports.trimQuote = trimQuote;
