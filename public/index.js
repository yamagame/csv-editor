function main(tableId) {
  const element = document.getElementById(tableId);
  const tableCell = element.querySelectorAll(".tableCell");
  const borderThick = 2;

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
    });
  });
}

main("scrollTest");
