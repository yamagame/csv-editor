import { factory, Fragment } from "libs/preact";
import fs from "fs";
import path from "path";

export function escapeHtml(string: string) {
  if (typeof string !== "string") {
    return string;
  }
  return removeQuote(string).replace(/[&'`"<>\n]/g, function (match) {
    return {
      "&": "&amp;",
      "'": "&#x27;",
      "`": "&#x60;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
      "\n": "<br/>",
    }[match];
  });
}

export function removeQuote(value) {
  const ts = [/^"(.+)"$/, /^'(.+)'$/];
  for (let i = 0; i < ts.length; i++) {
    const m = value.trim().match(ts[i]);
    if (m) {
      return m[1].replace(/""/g, '"');
    }
  }
  return value;
}

export const readDir = (rootDir: string) => {
  const _readDir = (dir: string) => {
    let result = [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        result = [...result, ..._readDir(filepath)];
      } else if (stat.isFile()) {
        if (path.extname(filepath) === ".csv") {
          result.push(filepath.replace(rootDir, ""));
        }
      }
    });
    return result;
  };
  return _readDir(rootDir);
};
