import { factory, Fragment } from "libs/preact";
import fs from "fs";
import path from "path";
import { readFile } from "fs/promises";

export function escapeHtml(string: string) {
  if (typeof string !== "string") {
    return string;
  }
  return removeQuote(string).replace(/[&'`"<>]/g, function (match) {
    return {
      "&": "&amp;",
      "'": "&#x27;",
      "`": "&#x60;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
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

export const readDir = (rootDir: string, callback) => {
  const _readDir = (dir: string) => {
    let result = [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        if (path.parse(filepath).name !== "node_modules") {
          result = [...result, ..._readDir(filepath)];
        }
      } else if (stat.isFile()) {
        if (callback(filepath)) {
          result.push(filepath.replace(rootDir, ""));
        }
      }
    });
    return result;
  };
  return _readDir(rootDir);
};

export const loadJson = (basepath: string) => {
  const name = path.basename(basepath);
  const dir = path.dirname(basepath);
  const filepath = path.format({ dir, name, ext: ".json" });
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {
    return {};
  }
};

export const saveJson = (basepath: string, params: any) => {
  const name = path.basename(basepath);
  const dir = path.dirname(basepath);
  const filepath = path.format({ dir, name, ext: ".json" });
  try {
    const readJson = () => {
      try {
        return JSON.parse(fs.readFileSync(filepath, "utf-8"));
      } catch {
        return {};
      }
    };
    const data = readJson();
    let updated = false;
    Object.keys(params).forEach(key => {
      if (params[key]) {
        data[key] = params[key];
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(filepath, JSON.stringify(data, null, "  "), "utf8");
    }
  } catch {
    return {};
  }
};

export const defaultConfig = {
  extension: ".csv",
  viewer: "csv/view",
};

export const loadConfig = async config => {
  try {
    const data = await readFile(config, "utf-8");
    const configJson = JSON.parse(data);
    if (configJson.directories) {
      configJson.directories = configJson.directories.map(group => {
        return { ...defaultConfig, ...group };
      });
    }
    return configJson;
  } catch {
    //
  }
  return {};
};

export const findConfig = async (config, filepath, defaultConfig) => {
  const localConfig = await loadConfig(
    path.join(path.dirname(filepath), `.config.json`)
  );
  const configJson = await loadConfig(config);
  const retVal = {
    ...defaultConfig,
    ...configJson.directories.find(
      group => filepath.indexOf(path.join(group.dir)) === 0
    ),
    ...localConfig,
  };
  console.log(retVal);
  console.log(localConfig);
  return retVal;
};
