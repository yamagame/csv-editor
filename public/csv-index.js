let controller;

function main() {
  controller = CsvTable(
    "/csv/view",
    "csv-table",
    ".csv-data-input",
    (file, text) => {
      postRequest("/csv/command", { file, text }, res => {
        console.log(res);
      });
    }
  );
}

function save() {
  controller.save("/csv/save");
}
