let controller;

function main() {
  controller = CsvTable("/csv/view", "csv-table", ".csv-data-input");

  function save() {
    controller.save("/csv/save");
  }
}
