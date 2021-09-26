import { factory, Fragment, render } from "libs/preact";
import path = require("path");
import express from "express";
import { CsvTable } from "components/CsvTable";
import { readDir } from "libs/utils";
import { Container } from "components/Container";

export function EnvEditRouter({ search_dir }) {
  const router = express.Router();
  const rowSize = [40, 130, 130, 130, 130];

  interface EnvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    dataname?: string;
  }

  function envParser(req, options: EnvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize: { width: 50, height: 18 },
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
    };
    const envParser = require("libs/env-parser");

    const envFiles = readDir(search_dir, filepath => {
      return path.basename(filepath) === req.params[0];
    });

    const envData = {};
    const envKeys = {};
    const envTemp = envFiles.map(filepath => {
      const data = envParser.load(path.join(search_dir, filepath));
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
        dataname: req.params[0],
        maxRow: maxRow + 1,
        maxCol: maxCol + 1,
      },
    };
  }

  router.post("/*", (req, res) => {
    const data = envParser(req, {
      fixedPoint: { x: 1, y: 1 },
      rowSize,
    });
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = data[k];
        return a;
      }, {})
    );
  });

  router.get("/*", (req, res) => {
    const data = envParser(req, {
      fixedPoint: { x: 1, y: 1 },
      rowSize,
    });
    const container = (
      <Container title="Top">
        <div className="csv-control-panel">
          <input className="csv-data-input" type="text" />
        </div>
        <CsvTable
          id="csv-table"
          data={data.csv}
          left={30}
          top={30}
          dataname={data.dataname}
          defaultCellSize={data.defaultCellSize}
          fixedPoint={data.fixedPoint}
          rowSize={data.rowSize}
        />
        <script type="text/javascript" src="/env-edit-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  router.post("/*", (req, res) => {
    const data = envParser(req, {
      fixedPoint: { x: 1, y: 1 },
      rowSize,
    });
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = data[k];
        return a;
      }, {})
    );
  });

  return router;
}

export function EnvViewRouter({ search_dir }) {
  const router = express.Router();
  const rowSize = [0, 150, 400];

  interface CsvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    dataname?: string;
  }

  function envParser(req, options: CsvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize: { width: 50, height: 18 },
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
    };
    const envParser = require("libs/env-parser");
    const envArray = envParser.load(path.join(search_dir, req.params[0]));
    const csvArray = envArray
      .filter(v => v.key)
      .map(v => [{ value: v.key }, { value: v.value }]);
    const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
    const maxCol = csvArray.length;
    const header = new Array(maxRow).fill(0).map((v, i) => ({
      value: `${i + 1}`,
      color: "white",
      backgroundColor: "gray",
    }));
    const csv = [header, ...csvArray].map((v, i) => [
      { value: `${i}`, color: "white", backgroundColor: "gray" },
      ,
      ...v,
    ]);
    return {
      csv,
      ...{
        ...defaultOptions,
        ...options,
        dataname: req.params[0],
        maxRow: maxRow + 1,
        maxCol: maxCol + 1,
      },
    };
  }

  router.get("/*", (req, res) => {
    const data = envParser(req, {
      rowSize,
    });
    const container = (
      <Container title="Top">
        <div className="csv-control-panel">
          <input className="csv-data-input" type="text" />
        </div>
        <CsvTable
          id="csv-table"
          data={data.csv}
          left={30}
          top={30}
          dataname={data.dataname}
          defaultCellSize={data.defaultCellSize}
          fixedPoint={data.fixedPoint}
          rowSize={data.rowSize}
        />
        <script type="text/javascript" src="/env-view-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  router.post("/*", (req, res) => {
    const data = envParser(req, {
      rowSize,
    });
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = data[k];
        return a;
      }, {})
    );
  });

  return router;
}
