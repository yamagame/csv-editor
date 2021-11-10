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
      console.error(data.toString());
    });
    cmd.stderr.on("data", data => {
      console.error(data.toString());
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

app.get("/", async (req, res) => {
  const { directories } = await loadConfig(CONFIG_PATH);
  const container = (
    <Container title="CSV-Editor">
      <div className="csv-list-container">
        <div className="csv-row">
          {directories.map((group, i) => (
            <section>
              <p className="group-name" onClick={`loadReadme(this, ${i})`}>
                {group.name}
              </p>
              {readDir(group.dir, filepath => {
                if (group.files) {
                  const basename = path.basename(filepath);
                  return group.files.indexOf(basename) >= 0;
                }
                if (group.extension) {
                  const ext = path.extname(filepath);
                  return ext !== "" && group.extension.indexOf(ext) >= 0;
                }
              }).map(v => {
                const file = encodeURI(path.join(group.dir, v));
                return (
                  <div className="group-item">
                    <a href={`${group.viewer}?file=${file}`}>{v}</a>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
        <div className="csv-row">
          <section className="csv-instruction">
            <input
              className="csv-button csv-script-button"
              type="button"
              value="スクリプト実行"
              disabled
              onClick={`exec();`}
            />
            <pre>
              <code className="csv-instrcution-container"></code>
            </pre>
          </section>
        </div>
      </div>
      <script type="text/javascript" src="/index.js"></script>
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`CSV-Editor app listening at http://localhost:${port}`);
});
