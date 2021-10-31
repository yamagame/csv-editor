import { factory, render } from "libs/preact";
import path = require("path");
import express from "express";
import { readDir } from "libs/utils";
import { Container } from "components/Container";
import { EnvViewRouter } from "routers/env-router";
import { CsvRouter } from "routers/csv-router";
import { readFile } from "fs/promises";

const CONFIG_PATH = process.env.CONFIG_PATH || "./config.json";

const loadConfig = async () => {
  const data = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(data);
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
  "/csv",
  CsvRouter({}, async () => {
    const { directories } = await loadConfig();
    return directories.find(group => group.id === "csv-viewer");
  })
);
app.use(
  "/env",
  EnvViewRouter({}, async () => {
    const { directories } = await loadConfig();
    return directories.find(group => group.id === "env-viewer");
  })
);

app.get("/", async (req, res) => {
  const { directories } = await loadConfig();
  const container = (
    <Container title="Top">
      {directories.map(group => (
        <section>
          <p className="group-name">{group.name}</p>
          {readDir(group.dir, filepath => {
            if (group.extension) {
              const ext = path.extname(filepath);
              return ext !== "" && group.extension.indexOf(ext) >= 0;
            }
            if (group.files) {
              const basename = path.basename(filepath);
              return group.files.indexOf(basename) >= 0;
            }
          }).map(v => (
            <div className="group-item">
              <a href={`${group.viewer}?file=${encodeURI(v)}`}>{v}</a>
            </div>
          ))}
        </section>
      ))}
      <script type="text/javascript" src="/index.js"></script>
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`env-manager app listening at http://localhost:${port}`);
});
