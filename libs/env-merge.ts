import { readDir } from "libs/utils";

interface EnvParserOptions {
  defaultCellSize?: { width: number; height: number };
  fixedPoint?: { x: number; y: number };
  rowSize?: number[];
  colSize?: number[];
  dataname?: string;
}

const rowSize = [40, 130, 130, 130, 130];
const colSize = [0, 0];

export function envParser(
  search_dir,
  filename,
  options: EnvParserOptions = {}
) {
  const defaultOptions = {
    defaultCellSize: { width: 50, height: 18 },
    fixedPoint: { x: 0, y: 0 },
    rowSize,
    colSize,
    ...options,
  };
  const envParser = require("libs/env-parser");

  const envFiles = readDir(search_dir, filepath => {
    return path.basename(filepath) === filename;
  });

  const envData = {};
  const envKeys = {};
  const envTemp = envFiles.map(filepath => {
    const envFilePath = path.join(search_dir, filepath);
    const data = envParser.load(envFilePath);
    return data;
  });
  envTemp.forEach(env => {
    env.reduce((a, v) => {
      if (!a[v.key]) a[v.key] = true;
      return a;
    }, envKeys);
  });

  Object.keys(envKeys).forEach(key => {
    if (!envData[key]) envData[key] = [];
    envTemp.forEach(env => {
      const v = env.find(data => data.key === key);
      if (v !== undefined) {
        envData[key].push(v);
      } else {
        envData[key].push({ value: "" });
      }
    });
  });

  interface Cell {
    value: string;
    color?: string;
    backgroundColor?: string;
  }

  const csvArray = [
    [
      { value: "" },
      ...envFiles.map(
        v =>
          ({
            value: v,
          } as Cell)
      ),
    ],
    ...Object.entries(envData).map(env => {
      return [{ value: env[0] }, ...(env[1] as Array<Cell>)];
    }),
  ];
  const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
  const maxCol = csvArray.length;
  const header = new Array(maxRow).fill(0).map((v, i) => ({
    value: `${i + 1}`,
    color: "white",
    backgroundColor: "gray",
  }));
  const csv = [header, ...csvArray].map((v, i) => [
    { value: `${i}`, color: "white", backgroundColor: "gray" },
    ...v,
  ]);
  csv.forEach((col, y) => {
    if (y <= 0) return;
    if (y <= 1) {
      col.forEach((cell, x) => {
        if (x > 0) {
          cell.backgroundColor = "lightgray";
        }
      });
    } else {
      col.forEach((cell, x) => {
        if (x > 0 && x <= 1) {
          cell.backgroundColor = "lightgray";
        }
      });
    }
  });
  return {
    csv,
    ...{
      ...defaultOptions,
      ...options,
      dataname: filename,
      maxRow: maxRow + 1,
      maxCol: maxCol + 1,
    },
  };
}
