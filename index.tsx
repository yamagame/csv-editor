import { factory, render } from "libs/preact";
import fs = require("fs");
const { spawn } = require("child_process");
import path = require("path");
import express from "express";
import { readDir, loadConfig, defaultConfig } from "libs/utils";
import { Container } from "components/Container";
import { EnvViewRouter } from "routers/env-router";
import { CsvRouter } from "routers/csv-router";

const CONFIG_PATH = process.env.CONFIG_PATH || "./config.json";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static("public"));

app.use(
  "/csv",
  CsvRouter({
    path: CONFIG_PATH,
    id: "csv-viewer",
  })
);

app.use(
  "/env",
  EnvViewRouter({
    path: CONFIG_PATH,
    id: "env-viewer",
  })
);

app.post("/exec/:groupId", async (req, res) => {
  if (process.env.SCRIPT_CMD) {
    const cmd = spawn("node", [process.env.SCRIPT_CMD, req.params.groupId], {
      shell: true,
    });
    cmd.stdout.on("data", data => {
      process.stdout.write(data.toString());
    });
    cmd.stderr.on("data", data => {
      process.stderr.write(data.toString());
    });
    cmd.on("exit", code => {
      console.log(`Child exited with code ${code}`);
    });
  }
  res.sendStatus(200);
});

app.get("/readme/:groupId", async (req, res) => {
  if (process.env.README_CMD) {
    const cmd = spawn("node", [process.env.README_CMD, req.params.groupId], {
      shell: true,
    });
    cmd.stderr.on("data", data => {
      console.error(data.toString());
    });
    cmd.on("exit", code => {
      console.log(`Child exited with code ${code}`);
    });
    cmd.stdout.pipe(res);
  } else {
    res.send("No Document");
  }
});

const renderContainer = async (groupId = -1) => {
  const { directories } = await loadConfig(CONFIG_PATH);
  const group = directories.find((g, i) => i === groupId);
  const container = (
    <Container title="CSV-Editor">
      <div className="csv-list-container">
        <div className="csv-row-1">
          {directories.map((group, i) => (
            <div>
              <a
                className={`group-name ${
                  i === groupId ? "csv-group-active" : ""
                }`}
                href={`/list/${i}`}>
                {group.name}
              </a>
            </div>
          ))}
        </div>
        <div className="csv-row-2">
          {group &&
            readDir(group.path, filepath => {
              if (group.files) {
                const basename = path.basename(filepath);
                return group.files.indexOf(basename) >= 0;
              }
              if (group.extension) {
                const ext = path.extname(filepath);
                return ext !== "" && group.extension.indexOf(ext) >= 0;
              }
            }).map(v => {
              const file = encodeURI(path.join(group.path, v));
              return (
                <div className="group-item">
                  <a href={`/${group.viewer}?file=${file}`}>{v}</a>
                </div>
              );
            })}
        </div>
        <div className="csv-row-2">
          <input
            className="csv-button csv-script-button"
            type="button"
            value="スクリプト実行"
            disabled={groupId >= 0 ? false : true}
            onClick={`exec(${groupId});`}
          />
          <pre>
            <code className="csv-instrcution-container"></code>
          </pre>
        </div>
      </div>
      <script type="text/javascript" src="/index.js"></script>
      <script type="text/javascript">{`loadReadme(${groupId})`}</script>
    </Container>
  );
  return render(container);
};

app.get("/list/:groupId", async (req, res) => {
  res.send(await renderContainer(parseInt(req.params.groupId)));
});

app.get("/", async (req, res) => {
  res.send(await renderContainer());
});

app.listen(port, () => {
  console.log(`CSV-Editor app listening at http://localhost:${port}`);
});
