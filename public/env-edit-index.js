const controlelr = CsvTable(
  //baseURL
  "/env/edit",
  //table ID
  "csv-table",
  //input selector
  ".csv-data-input",
  cell => {
    postRequest(`/action/${dataName}`, { text: cell.getText() });
  }
);
