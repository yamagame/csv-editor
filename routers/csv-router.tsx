import { factory, Fragment, render } from "libs/preact";
import path = require("path");
import express from "express";
import { CsvTable } from "components/CsvTable";
import { Container } from "components/Container";

export function CsvRouter({ search_dir }) {
  const router = express.Router();
  const rowSize = [0, 40, 130, 130, 130];

  interface CsvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    dataname?: string;
  }

  function csvParser(req, options: CsvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize: { width: 50, height: 18 },
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
    };
    const csvParser = require("libs/csv-parser");
    const csvArray = csvParser.load(path.join(search_dir, req.params[0]));
    const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
    const maxCol = csvArray.length;
    const header = new Array(maxRow).fill(0).map((v, i) => ({
      value: `${i + 1}`,
    }));
    const csv = [header, ...csvArray].map((v, i) => [{ value: `${i}` }, ...v]);
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

  router.post("/view/*", (req, res) => {
    const env = csvParser(req, {
      fixedPoint: { x: 1, y: 1 },
      rowSize,
    });
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = env[k];
        return a;
      }, {})
    );
  });

  router.get("/view/*", (req, res) => {
    const data = csvParser(req, {
      fixedPoint: { x: 1, y: 1 },
      rowSize,
    });
    const container = (
      <Container title="Top">
        <div className="csv-control-panel">
          <input id="csv-data-input" className="" type="text" />
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
        <script type="text/javascript" src="/csv-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  return router;
}
