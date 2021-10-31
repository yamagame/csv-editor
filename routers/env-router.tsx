import { factory, render } from "libs/preact";
import path = require("path");
import express from "express";
import { CsvTable } from "components/CsvTable";
import { Container } from "components/Container";

export function EnvViewRouter(options: any = {}, optionReader: () => {}) {
  const router = express.Router();
  const rowSize = [0, 150, 400];
  const colSize = [0, 0];

  interface CsvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    colSize?: number[];
    dataname?: string;
  }

  function envParser(filename, options: CsvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize: { width: 50, height: 18 },
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
    };
    const envParser = require("libs/env-parser");
    const envArray = envParser.load(filename);
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
        dataname: filename,
        maxRow: maxRow + 1,
        maxCol: maxCol + 1,
        rowSize,
        colSize,
      },
    };
  }

  router.get("/view", (req, res) => {
    const data = envParser(req.query.file, {
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
          left={0}
          top={30}
          dataname={data.dataname}
          defaultCellSize={data.defaultCellSize}
          fixedPoint={data.fixedPoint}
          rowSize={data.rowSize}
        />
        <script type="text/javascript" src="/env-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  router.post("/view/*", (req, res) => {
    const data = envParser(req.params[0], {
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
