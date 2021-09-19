function CsvTable(tableId) {
  const element = document.getElementById(tableId);
  const tableCell = element.querySelectorAll(".csv-table-cell");
  const borderThick = 1;

  function ajustTableSize() {
    const top = parseInt(element.style.top, 10);
    const left = parseInt(element.style.left, 10);
    const width = window.innerWidth - borderThick - left;
    const height = window.innerHeight - borderThick - top;
    element.style.setProperty("width", `${width}px`);
    element.style.setProperty("height", `${height}px`);
  }
  ajustTableSize();

  window.addEventListener("resize", () => {
    ajustTableSize();
  });

  tableCell.forEach(element => {
    element.addEventListener("click", function () {
      console.log(
        "click",
        element.getAttribute("data-x"),
        element.getAttribute("data-y")
      );
      if (element.style["background-color"] === "pink") {
        element.style.setProperty("background-color", "white");
      } else {
        element.style.setProperty("background-color", "pink");
      }
    });
  });
}

const csvtable = new CsvTable("csv-table");
