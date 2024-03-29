const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
import { factory, Fragment, render } from "libs/preact";
import { loadJson, saveJson, findConfig, defaultConfig } from "libs/utils";
import express from "express";
import { CsvTable } from "components/CsvTable";
import { Container } from "components/Container";

export function CsvRouter(config: any = {}) {
  const router = express.Router();
  const rowSize = config.cellWidth || [40, 0];
  const colSize = config.cellHeight || [0];
  const defaultCellSize = { width: 130, height: 18 };

  interface CsvParserOptions {
    defaultCellSize?: { width: number; height: number };
    fixedPoint?: { x: number; y: number };
    rowSize?: number[];
    colSize?: number[];
    dataname?: string;
  }

  const alphabetNumber = index => {
    const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let length = char.length;
    let ret = "";
    ret = char[index % length] + ret;
    index = Math.floor(index / length);
    while (index > 0) {
      ret = char[((index - 1) % length) % length] + ret;
      index = Math.floor((index - 1) / length);
    }
    return ret;
  };

  function csvParser(filename, options: CsvParserOptions = {}) {
    const defaultOptions = {
      defaultCellSize,
      fixedPoint: { x: 0, y: 0 },
      rowSize: [],
      colSize: [],
    };
    const csvParser = require("libs/csv-parser");
    const csvFilePath = path.join(filename);
    const csvArray = csvParser.load(csvFilePath);
    const csvJson = loadJson(csvFilePath);
    const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
    const maxCol = csvArray.length;
    const header = new Array(maxRow + 1).fill(0).map((v, i) => ({
      value: `${alphabetNumber(i)}`,
      color: "white",
      backgroundColor: "gray",
    }));
    const csv = [
      header,
      ...csvArray.map((v, i) => [
        { value: `${i + 1}`, color: "white", backgroundColor: "gray" },
        ...v,
      ]),
    ];
    return {
      csv,
      ...{
        ...defaultOptions,
        ...options,
        dataname: filename,
        maxRow: maxRow + 1,
        maxCol: maxCol + 1,
        ...csvJson,
        defaultCellSize: { ...defaultCellSize, ...options.defaultCellSize },
      },
    };
  }

  router.post("/command", async (req, res) => {
    const { file, text } = req.body;
    const configData = await findConfig(config.path, file, defaultConfig);
    if (configData.command) {
      try {
        console.log(configData.command, file, text);
        const cmd = spawn(`${configData.command}`, [file, text], {
          shell: true,
        });
        cmd.stdout.on("data", data => {
          console.log(data.toString());
        });
        cmd.stderr.on("data", data => {
          console.error(data.toString());
        });
        cmd.on("exit", code => {
          console.log(`Child exited with code ${code}`);
        });
      } catch (err) {
        console.error(err);
      }
    }
    res.sendStatus(200);
  });

  router.get("/download/*", async (req, res) => {
    const { file } = req.query;
    try {
      if (!fs.existsSync(file)) {
        return res.sendStatus(404);
      }
      const data = fs.readFileSync(file, { encoding: "utf-8" });
      res.setHeader(
        "content-disposition",
        `attachment; filename=${path.basename(file)}`
      );
      res.setHeader("content-type", "text/csv; charset=UTF-8");
      res.send(data);
    } catch (err) {
      res.sendStatus(404);
    }
  });

  router.post("/save/*", async (req, res) => {
    const { file } = req.query;
    const configData = await findConfig(config.path, file, defaultConfig);
    const data = csvParser(file, {
      fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
      rowSize: configData.rowSize || rowSize,
      colSize: configData.colSize || colSize,
      defaultCellSize: configData.defaultCellSize || defaultCellSize,
    });
    const { maxRow, maxCol } = req.body;
    req.body.csv.forEach(cell => {
      if (data.csv.length <= cell.y) {
        data.csv = [
          ...data.csv,
          ...new Array(cell.y - data.csv.length + 1).fill([]),
        ];
      }
      if (data.csv[cell.y].length <= cell.x) {
        data.csv[cell.y] = [
          ...data.csv[cell.y],
          ...new Array(cell.x - data.csv[cell.y].length + 1).fill({
            value: "",
          }),
        ];
      }
      try {
        data.csv[cell.y][cell.x] = { value: cell.value };
      } catch {}
    });
    {
      const csvParser = require("libs/csv-parser");
      const csvData = [...data.csv].slice(1).map(col => col.slice(1));
      const csvString = csvParser.stringify(
        csvData.map(v => v.slice(0, maxRow - 1)).slice(0, maxCol - 1)
      );
      const csvPath = req.query.file;
      fs.writeFileSync(csvPath, csvString);
    }
    {
      const { rowSize, colSize } = req.body;
      const csvFilePath = req.query.file.toString();
      saveJson(csvFilePath, { rowSize, colSize, maxCol, maxRow });
    }
    if (configData.execute) {
      try {
        console.log(configData.execute, file);
        const cmd = spawn(`${configData.execute}`, [file], {
          shell: true,
        });
        cmd.stdout.on("data", data => {
          console.log(data.toString());
        });
        cmd.stderr.on("data", data => {
          console.error(data.toString());
        });
        cmd.on("exit", code => {
          console.log(`Child exited with code ${code}`);
        });
      } catch (err) {
        console.error(err);
      }
    }
    res.send({ result: "OK" });
  });

  router.post("/view/*", async (req, res) => {
    const configData = await findConfig(
      config.path,
      req.query.file,
      defaultConfig
    );
    const data = csvParser(req.query.file, {
      fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
      rowSize: configData.rowSize || rowSize,
      colSize: configData.colSize || colSize,
      defaultCellSize: configData.defaultCellSize || defaultCellSize,
    });
    data.form = configData.form;
    data.edit = configData.edit;
    res.send(
      Object.entries(req.body).reduce((a, [k, v]) => {
        a[k] = data[k];
        return a;
      }, {})
    );
  });

  router.get("/view", async (req, res) => {
    const configData = await findConfig(
      config.path,
      req.query.file,
      defaultConfig
    );
    const data = csvParser(req.query.file, {
      fixedPoint: { x: configData.fixedH || 0, y: configData.fixedV || 0 },
      rowSize: configData.rowSize || rowSize,
      colSize: configData.colSize || colSize,
      defaultCellSize: configData.defaultCellSize || defaultCellSize,
    });
    const container = (
      <Container title="CSV-Editor">
        <div className="csv-control-panel">
          <a href={`/list/${configData.groupIndex}`}>
            <span className="csv-data-name">{configData.name}</span>
          </a>
          :<span className="csv-data-name">{data.dataname}</span>
          <input className="csv-data-input" type="text" />
          <input
            className="csv-button"
            type="button"
            value="ダウンロード"
            onClick="download();"
          />
          {configData.edit !== false ? (
            <input
              className="csv-button"
              type="button"
              value="セーブ"
              onClick="save();"
            />
          ) : null}
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
          colSize={data.colSize}
          form={configData.form}
        />
        <script type="text/javascript" src="/csv-index.js"></script>
      </Container>
    );
    res.send(render(container));
  });

  return router;
}
