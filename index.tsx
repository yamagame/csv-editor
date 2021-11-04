import { factory, render } from "libs/preact";
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

app.get("/", async (req, res) => {
  const { directories } = await loadConfig(CONFIG_PATH);
  const container = (
    <Container title="Top">
      {directories.map(group => (
        <section>
          <p className="group-name">{group.name}</p>
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
      <script type="text/javascript" src="/index.js"></script>
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`env-manager app listening at http://localhost:${port}`);
});
