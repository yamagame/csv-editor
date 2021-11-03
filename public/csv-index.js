let controller;

function main() {
  controller = CsvTable(
    "/csv/view",
    "csv-table",
    ".csv-data-input",
    (tableName, text) => {
      console.log(tableName, text);
    }
  );
}

function save() {
  controller.save("/csv/save");
}
