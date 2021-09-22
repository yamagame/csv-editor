import { factory, Fragment, render } from "libs/preact";
import path = require("path");
import express from "express";
import { CsvTable } from "components/CsvTable";
import { readDir } from "libs/utils";
import { Container } from "components/Container";

const TARGET_DIR = process.env.TARGET_DIR || "test-csv";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/view/env/*", (req, res) => {
  const envParser = require("./libs/env-parser");
  const envArray = envParser.load(path.join(TARGET_DIR, req.params[0]));
  const csvArray = envArray
    .filter(v => v.key)
    .map(v => [{ value: v.key }, { value: v.value }]);
  const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
  const header = new Array(maxRow).fill(0).map((v, i) => ({
    value: `${i + 1}`,
  }));
  const csv = [header, ...csvArray].map((v, i) => [{ value: `${i}` }, ...v]);
  const container = (
    <Container title="Top">
      <div className="csv-control-panel">
        <input id="csv-data-input" className="" type="text" />
      </div>
      <CsvTable
        id="csv-table"
        data={csv}
        left={30}
        top={30}
        fixedPoint={{ x: 0, y: 0 }}
        rowSize={[0, 150, 400]}
      />
    </Container>
  );
  res.send(render(container));
});

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
  const envParser = require("./libs/env-parser");

  const envFiles = readDir(TARGET_DIR, filepath => {
    return path.basename(filepath) === req.params[0];
  });

  const envData = {};
  const envKeys = {};
  const envTemp = envFiles.map(filepath => {
    const data = envParser.load(path.join(TARGET_DIR, filepath));
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

  const csvArray = [
    [
      { value: "" },
      ...envFiles.map(v => ({
        value: v,
      })),
    ],
    ...Object.entries(envData).map(env => {
      return [{ value: env[0] }, ...(env[1] as Array<{}>)];
    }),
  ];
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
      maxRow,
      maxCol,
    },
  };
}

app.post("/edit/env/*", (req, res) => {
  console.log(req.body);
  const env = envParser(req, {
    fixedPoint: { x: 1, y: 1 },
    rowSize: [40, 130, 130, 130],
  });
  res.send(
    Object.entries(req.body).reduce((a, [k, v]) => {
      a[k] = env[k];
      return a;
    }, {})
  );
});

app.get("/edit/env/*", (req, res) => {
  const env = envParser(req, {
    fixedPoint: { x: 1, y: 1 },
    rowSize: [40, 130, 130, 130],
  });
  const container = (
    <Container title="Top">
      <div className="csv-control-panel">
        <input id="csv-data-input" className="" type="text" />
      </div>
      <CsvTable
        id="csv-table"
        data={env.csv}
        left={30}
        top={30}
        dataname={env.dataname}
        defaultCellSize={env.defaultCellSize}
        fixedPoint={env.fixedPoint}
        rowSize={env.rowSize}
      />
    </Container>
  );
  res.send(render(container));
});

app.get("/view/csv/*", (req, res) => {
  const csvParser = require("./libs/csv-parser");
  const csvArray = csvParser.load(path.join(TARGET_DIR, req.params[0]));
  const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
  const header = new Array(maxRow).fill(0).map((v, i) => ({
    value: `${i + 1}`,
  }));
  const csv = [header, ...csvArray].map((v, i) => [{ value: `${i}` }, ...v]);
  const container = (
    <Container title="Top">
      <div className="csv-control-panel">
        <input id="csv-data-input" className="" type="text" />
      </div>
      <CsvTable
        id="csv-table"
        data={csv}
        left={30}
        top={30}
        fixedPoint={{ x: 0, y: 0 }}
      />
    </Container>
  );
  res.send(render(container));
});

app.get("/", function (req, res) {
  const container = (
    <Container title="Top">
      <section>
        {readDir(TARGET_DIR, filepath => {
          return path.extname(filepath) === ".csv";
        }).map(v => (
          <div>
            <a href={`/view/csv${v}`}>{v}</a>
          </div>
        ))}
      </section>
      <section>
        {readDir(TARGET_DIR, filepath => {
          return path.basename(filepath) === "sample-env";
        }).map(v => (
          <div>
            <a href={`/view/env${v}`}>{v}</a>
          </div>
        ))}
      </section>
      <section>
        <div>
          <a href={`/edit/env/sample-env`}>sample-env</a>
        </div>
      </section>
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`env-manager app listening at http://localhost:${port}`);
});
