const controlelr = CsvTable("/csv/view", "csv-table", ".csv-data-input");

function save() {
  controlelr.save("/csv/save");
}
