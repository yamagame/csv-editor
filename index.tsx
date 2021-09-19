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

app.get("/view/*", (req, res) => {
  const csvParser = require("./libs/csv-parser");
  const csv = csvParser
    .load(path.join(TARGET_DIR, req.params[0]))
    .map((v, i) => [{ value: `${i}` }, ...v]);
  const container = (
    <Container title="Top">
      <CsvTable id="csv-table" data={csv} left={30} top={30} />
    </Container>
  );
  res.send(render(container));
});

app.get("/", function (req, res) {
  const container = (
    <Container title="Top">
      {readDir(TARGET_DIR).map(v => (
        <div>
          <a href={`/view${v}`}>{v}</a>
        </div>
      ))}
    </Container>
  );
  res.send(render(container));
});

app.listen(port, () => {
  console.log(`env-manager app listening at http://localhost:${port}`);
});
