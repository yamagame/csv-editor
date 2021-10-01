import { factory, render } from "libs/preact";
import path = require("path");
import express from "express";
import { readDir } from "libs/utils";
import { Container } from "components/Container";
import { EnvEditRouter, EnvViewRouter } from "routers/env-router";
import { CsvRouter } from "routers/csv-router";

const TARGET_DIR = process.env.TARGET_DIR || "test-csv";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/env/edit", EnvEditRouter({ search_dir: TARGET_DIR }));
app.use("/env/view", EnvViewRouter({ search_dir: TARGET_DIR }));

app.use("/csv", CsvRouter({ search_dir: TARGET_DIR }));

app.use("/action", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.get("/", function (req, res) {
  const container = (
    <Container title="Top">
      <section>
        {readDir(TARGET_DIR, filepath => {
          return path.extname(filepath) === ".csv";
        }).map(v => (
          <div>
            <a href={`/csv/view${v}`}>{v}</a>
          </div>
        ))}
      </section>
      <section>
        {readDir(TARGET_DIR, filepath => {
          return path.basename(filepath) === "sample-env";
        }).map(v => (
          <div>
            <a href={`/env/view${v}`}>{v}</a>
          </div>
        ))}
      </section>
      <section>
        <div>
          <a href={`/env/edit/sample-env`}>sample-env</a>
        </div>
      </section>
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`env-manager app listening at http://localhost:${port}`);
});
