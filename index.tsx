import { factory, render } from "libs/preact";
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
    const cmd = spawn(
      "node",
      [
        process.env.SCRIPT_CMD,
        req.params.groupId,
        `'${JSON.stringify(req.body)}'`,
      ],
      {
        shell: true,
      }
    );
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

const readReademe = groupId => {
  if (process.env.README_CMD) {
    return new Promise(resolve => {
      let readme = "";
      const cmd = spawn("node", [process.env.README_CMD, groupId], {
        shell: true,
      });
      cmd.stdout.on("data", data => {
        console.error(data.toString());
        readme += data.toString();
      });
      cmd.stderr.on("data", data => {
        console.error(data.toString());
      });
      cmd.on("exit", code => {
        console.log(`Child exited with code ${code}`);
        resolve(readme);
      });
    });
  } else {
    return "";
  }
};

const renderContainer = async (groupId = -1) => {
  const { directories, options } = await loadConfig(CONFIG_PATH);
  const group = directories.find((g, i) => i === groupId);
  const container = (
    <Container title="CSV-Editor">
      <div className="csv-control-panel">
        <div className="csv-control-panel-grow"></div>
        <form>
          {group && group.password ? (
            <input
              className="csv-option-input"
              type="text"
              name="id"
              placeholder="ID"
            />
          ) : null}
          {group && group.password ? (
            <input
              className="csv-option-input"
              type="password"
              name="password"
              placeholder="PASS"
              autocomplete="off"
            />
          ) : null}
        </form>
        {Object.entries(options)
          .filter(([key, v]) => key !== "id" && key !== "password")
          .map(([key, option]: [string, string[]]) => (
            <select
              name={key}
              className="csv-option-selector csv-script-button">
              {option.map(value => (
                <option value={value}>{value}</option>
              ))}
            </select>
          ))}
        <input
          className="csv-button csv-script-button"
          type="button"
          value="スクリプト実行"
          disabled={groupId >= 0 && group.script ? false : true}
          onClick={`exec(${groupId});`}
        />
      </div>
      <div className="csv-list-container">
        <div className="csv-row-1">
          <div className="csv-list-item csv-list-title">グループ名</div>
          {directories.map((group, i) => (
            <div
              className={`csv-list-item csv-list-hover ${
                i === groupId ? "csv-group-active-cell" : ""
              }`}
              onclick={`window.location.href='/list/${i}';`}>
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
          <div className="csv-list-item csv-list-title">ファイル名</div>
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
                <div
                  className="csv-list-item csv-list-hover"
                  onclick={`window.location.href='/${group.viewer}?file=${file}';`}>
                  <a href={`/${group.viewer}?file=${file}`}>{v}</a>
                </div>
              );
            })}
        </div>
        <div className="csv-row-3">
          <div className="csv-instrcution-container">
            {await readReademe(groupId)}
          </div>
        </div>
      </div>
      <script type="text/javascript" src="/index.js"></script>
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
