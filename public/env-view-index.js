function main() {
  const controller = CsvTable(
    //baseURL
    "/env/view",
    //table ID
    "csv-table",
    //input selector
    ".csv-data-input",
    cell => {
      postRequest(`/action/${dataName}`, { text: cell.getText() });
    }
  );
}
