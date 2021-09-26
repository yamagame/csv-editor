import { factory, Fragment, render } from "libs/preact";
import fs = require("fs");
import path = require("path");
import express from "express";
import { CsvTable } from "components/CsvTable";
import { Container } from "components/Container";

export function CsvRouter({ search_dir }) {
  const router = express.Router();
  const rowSize = [40, 40];

  interface CsvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    dataname?: string;
  }

  function csvParser(req, options: CsvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize: { width: 130, height: 18 },
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
    };
    const csvParser = require("libs/csv-parser");
    const csvArray = csvParser.load(path.join(search_dir, req.params[0]));
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

  router.post("/save/*", (req, res) => {
    const data = csvParser(req, {
      fixedPoint: { x: 0, y: 0 },
      rowSize,
    });
    req.body.csv.forEach(cell => {
      if (data.csv.length <= cell.y) {
        data.csv = [...data.csv, new Array(cell.y - data.csv.length).fill([])];
      }
      if (data.csv[cell.y].length <= cell.x) {
        data.csv[cell.y] = [
          ...data.csv[cell.y],
          new Array(cell.x - data.csv[cell.y].length).fill({ value: "" }),
        ];
      }
      try {
        data.csv[cell.y][cell.x].value = cell.value;
      } catch {}
    });
    {
      const csvParser = require("libs/csv-parser");
      const csvData = [...data.csv].slice(1).map(col => col.slice(1));
      const csvString = csvParser.stringify(csvData);
      const csvPath = path.join(search_dir, req.params[0]);
      fs.writeFileSync(csvPath, csvString);
    }
    res.sendStatus(200);
  });

  router.post("/view/*", (req, res) => {
    const data = csvParser(req, {
      fixedPoint: { x: 0, y: 0 },
      rowSize,
    });
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = data[k];
        return a;
      }, {})
    );
  });

  router.get("/view/*", (req, res) => {
    const data = csvParser(req, {
      fixedPoint: { x: 0, y: 0 },
      rowSize,
    });
    const container = (
      <Container title="Top">
        <div className="csv-control-panel">
          <input
            className="csv-save-button"
            type="button"
            value="セーブ"
            onClick="save();"
          />
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
        <script type="text/javascript" src="/csv-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  return router;
}