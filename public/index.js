function postRequest(url, body, callback) {
  const XHR = new XMLHttpRequest();
  XHR.addEventListener("load", function (event) {
    callback(JSON.parse(XHR.response));
  });
  XHR.addEventListener("error", function (event) {
    console.error(event);
  });
  XHR.open("post", url);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(JSON.stringify(body));
}

function CsvTable(env, tableId, inputSelctor) {
  const dataInput = document.querySelector(inputSelctor);
  dataInput.addEventListener("change", e => {
    if (controller.currentSelectedCell) {
      controller.currentSelectedCell.setText(
        e.srcElement.value.replace(/\\n/g, "\n")
      );
    }
  });

  const element = document.getElementById(tableId);
  const dataName = element.getAttribute("data-name");

  const tableCell = element.querySelectorAll(".csv-table-cell");
  const tableTop = element.querySelector(".table-top");
  const tableLeft = element.querySelector(".table-left");
  const marker = element.querySelector(".table-marker");
  const borderThick = 1;

  function TableCell(element, controller) {
    this.element = element;
    this.x = parseInt(element.getAttribute("data-x"), 10);
    this.y = parseInt(element.getAttribute("data-y"), 10);
    this.width = parseInt(element.getAttribute("data-width"), 10);
    this.height = parseInt(element.getAttribute("data-height"), 10);
    this.backgroundColor = element.style["background-color"];
    this.selected = false;
    element.addEventListener("click", e => {
      const select = callback => {
        if (!this.selected) {
          if (!e.shiftKey && !e.altKey) {
            controller.clearSelectAll();
          }
          if (
            e.altKey &&
            controller.currentSelectedCell &&
            (controller.currentSelectedCell.x === this.x ||
              controller.currentSelectedCell.y === this.y)
          ) {
            const tx = [controller.currentSelectedCell.x, this.x];
            const ty = [controller.currentSelectedCell.y, this.y];
            let minx = Math.min(...tx);
            let maxx = Math.max(...tx);
            let miny = Math.min(...ty);
            let maxy = Math.max(...ty);
            if (minx === 0 && maxx === 0) {
              controller.cells.forEach(cell => {
                if (cell.y <= maxy && cell.y >= miny) {
                  cell.setSelect();
                }
              });
            } else {
              controller.cells.forEach(cell => {
                if (cell.x <= maxx && cell.x >= minx) {
                  cell.setSelect();
                }
              });
            }
            this.setSelect();
            dataInput.value = "";
          } else {
            controller.cells.forEach(cell => {
              if (callback(cell)) {
                cell.setSelect();
              }
            });
            this.setSelect();
            dataInput.value = "";
          }
        } else {
          controller.cells.forEach(cell => {
            if (callback(cell)) {
              cell.clearSelect();
            }
          });
        }
      };
      if (this.y === 0 && this.x > 0) {
        select(cell => cell.y >= 0 && cell.x === this.x);
      } else if (this.x === 0 && this.y > 0) {
        select(cell => cell.x >= 0 && cell.y === this.y);
      } else {
        if (!this.selected) {
          if (!e.shiftKey && !e.altKey) {
            controller.clearSelectAll();
          }
          if (
            e.altKey &&
            controller.currentSelectedCell &&
            controller.currentSelectedCell.x > 0 &&
            controller.currentSelectedCell.y > 0
          ) {
            const tx = [controller.currentSelectedCell.x, this.x];
            const ty = [controller.currentSelectedCell.y, this.y];
            let minx = Math.min(...tx);
            let maxx = Math.max(...tx);
            let miny = Math.min(...ty);
            let maxy = Math.max(...ty);
            controller.cells.forEach(cell => {
              if (
                cell.x <= maxx &&
                cell.x >= minx &&
                cell.y <= maxy &&
                cell.y >= miny
              ) {
                cell.setSelect();
              }
            });
            this.setSelect();
            controller.setInput(this);
          } else {
            this.setSelect();
            controller.setInput(this);
          }
        } else {
          this.clearSelect();
        }
      }
      controller.showMarker();
    });
    this.setSelect = () => {
      this.element.style.setProperty("background-color", "pink");
      this.selected = true;
      controller.currentSelectedCell = this;
      controller.setMarker(this);
    };
    this.clearSelect = () => {
      this.element.style.setProperty("background-color", this.backgroundColor);
      this.selected = false;
    };
    this.moveFrom = (x, y, width, height) => {
      this.x += x;
      this.y += y;
      this.element.setAttribute("data-x", this.x);
      this.element.setAttribute("data-y", this.y);
      const left = parseInt(this.element.style.left);
      const top = parseInt(this.element.style.top);
      this.element.style.setProperty("left", `${left + width}px`);
      this.element.style.setProperty("top", `${top + height}px`);
    };
    this.setText = text => {
      this.element.querySelector("div").innerText = text;
    };
    this.getText = () => {
      return this.element.querySelector("div").innerText;
    };
  }

  function CellController(tableCell) {
    this.cells = [];
    this.defaultCellSize = { width: 50, height: 18 };
    this.rowSize = [];
    this.colSize = [];
    this.rowWidth = [];
    this.colHeight = [];
    tableCell.forEach(element => {
      this.cells.push(new TableCell(element, this));
    });

    function makeCell(cell) {
      const element = document.createElement("div");
      const pre = document.createElement("pre");
      pre.setAttribute("class", "csv-table-code");
      const code = document.createElement("code");
      const div = document.createElement("div");
      div.style = "margin-left: 10px";
      const newContent = document.createTextNode("");
      div.appendChild(newContent);
      code.appendChild(div);
      pre.appendChild(code);
      element.appendChild(pre);
      element.style.cssText = cell.element.style.cssText;
      element.setAttribute("class", "csv-table-cell");
      element.setAttribute("data-x", cell.x);
      element.setAttribute("data-y", cell.y);
      element.setAttribute("data-width", cell.element.style.width);
      element.setAttribute("data-height", cell.element.style.height);
      return element;
    }

    this.clearSelectAll = () => {
      this.cells.forEach(cell => {
        if (cell.selected) {
          cell.clearSelect();
        }
      });
      delete this.currentSelectedCell;
    };
    this.showMarker = () => {
      if (this.cells.some(cell => cell.selected) && this.currentSelectedCell) {
        marker.style.setProperty("visibility", "visible");
      } else {
        marker.style.setProperty("visibility", "hidden");
      }
    };
    this.setMarker = cell => {
      marker.style.setProperty("top", `${this.sumTop(cell.y)}px`);
      marker.style.setProperty("left", `${this.sumLeft(cell.x)}px`);
      marker.style.setProperty("width", `${this.rowWidth[cell.x] - 2}px`);
      marker.style.setProperty("height", `${this.colHeight[cell.y] - 2}px`);
    };
    this.resize = () => {
      const rowArray = new Array(this.maxRow).fill(0);
      const colArray = new Array(this.maxCol).fill(0);
      this.rowWidth = rowArray.map(v => this.defaultCellSize.width);
      this.colHeight = colArray.map(v => this.defaultCellSize.height);
      this.rowSize.forEach((v, i) => {
        if (v > 0) {
          this.rowWidth[i] = v;
        }
      });
      this.colSize.forEach((v, i) => {
        if (v > 0) {
          this.colHeight[i] = v;
        }
      });
    };
    this.sumTop = y =>
      [...this.colHeight].slice(0, y).reduce((a, v, i) => {
        return a + v;
      }, 0);
    this.sumLeft = x =>
      [...this.rowWidth].slice(0, x).reduce((a, v, i) => {
        return a + v;
      }, 0);
    this.insertRowLine = () => {
      const selectedCell = this.currentSelectedCell;
      const colCells = this.cells.filter(cell => {
        return cell.y === selectedCell.y;
      });
      const newCells = [];

      colCells.reverse().forEach(cell => {
        const element = makeCell(cell);
        cell.element.parentElement.insertBefore(element, cell.element);
        const newCell = new TableCell(element, controller);
        newCell.backgroundColor = cell.backgroundColor;
        newCell.selected = true;
        newCells.push(newCell);
      });

      const y = selectedCell.y;
      const height = this.colHeight[y];
      this.colHeight.splice(y, 0, this.colHeight[y]);
      this.maxCol++;
      this.cells.forEach(cell => {
        if (cell.y >= y) {
          cell.moveFrom(0, 1, 0, height);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      tableLeft.style.height = `${parseInt(tableLeft.style.height) + height}px`;

      this.cells = [...this.cells, ...newCells];
      this.resetIndexNumber();
    };
    this.insertColLine = () => {
      const selectedCell = this.currentSelectedCell;
      const rowCells = this.cells.filter(cell => {
        return cell.x === selectedCell.x;
      });
      const newCells = [];

      rowCells.reverse().forEach(cell => {
        const element = makeCell(cell);
        cell.element.parentElement.insertBefore(element, cell.element);
        const newCell = new TableCell(element, controller);
        newCell.backgroundColor = cell.backgroundColor;
        newCell.selected = true;
        newCells.push(newCell);
      });

      const x = selectedCell.x;
      const width = this.rowWidth[x];
      this.rowWidth.splice(x, 0, this.rowWidth[x]);
      this.maxRow++;
      this.cells.forEach(cell => {
        if (cell.x >= x) {
          cell.moveFrom(1, 0, width, 0);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      tableTop.style.width = `${parseInt(tableTop.style.width) + width}px`;

      this.cells = [...this.cells, ...newCells];
      this.resetIndexNumber();
    };
    this.resetIndexNumber = () => {
      this.cells
        .filter(cell => cell.x === 0)
        .sort((a, b) => {
          if (a.y < b.y) return -1;
          if (a.y > b.y) return 1;
          return 0;
        })
        .forEach((cell, i) => {
          cell.setText(`${i}`);
        });
    };
    this.selectCellWithPosition = (x, y) => {
      const cell = this.cells.find(cell => cell.x === x && cell.y === y);
      if (cell) {
        this.setMarker(cell);
        this.currentSelectedCell = cell;
        this.setInput(cell);
      }
      return cell;
    };
    this.setInput = cell => {
      dataInput.value = cell.element.innerText.replace(/\n/g, "\\n");
    };
    this.save = url => {
      postRequest(`${url}/${dataName}`, {
        csv: this.cells.map(cell => ({
          x: cell.x,
          y: cell.y,
          value: cell.getText(),
        })),
      });
    };
  }

  const controller = new CellController(tableCell);

  postRequest(
    `${env}/${dataName}`,
    { rowSize: true, defaultCellSize: true, maxRow: true, maxCol: true },
    res => {
      controller.rowSize = res.rowSize;
      controller.defaultCellSize = res.defaultCellSize;
      controller.maxRow = res.maxRow;
      controller.maxCol = res.maxCol;
      controller.resize();
    }
  );

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

  const moveSelect = (e, dx, dy) => {
    if (controller.currentSelectedCell) {
      const cell = controller.currentSelectedCell;
      const _cell = controller.selectCellWithPosition(cell.x + dx, cell.y + dy);
      if (!e.shiftKey && !e.altKey) {
        if (_cell) controller.clearSelectAll();
      }
      if (_cell && _cell.element) {
        _cell.element.dispatchEvent(
          new MouseEvent("click", {
            view: window,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
          })
        );
      }
    }
    e.preventDefault();
  };

  window.addEventListener("keydown", e => {
    if (e.target == dataInput) {
      if (e.key === "Enter") {
        dataInput.blur();
      }
    }
    if (e.target == document.querySelector("body")) {
      if (e.key === "Enter") {
        if (controller.currentSelectedCell) {
          if (controller.currentSelectedCell.x === 0) {
            const { x, y } = controller.currentSelectedCell;
            controller.insertRowLine(controller.currentSelectedCell.y);
            controller.selectCellWithPosition(x, y);
          } else if (controller.currentSelectedCell.y === 0) {
            const { x, y } = controller.currentSelectedCell;
            controller.insertColLine(controller.currentSelectedCell.x);
            controller.selectCellWithPosition(x, y);
          } else {
            dataInput.focus();
          }
        }
      }
      if (e.key === "ArrowDown") {
        moveSelect(e, 0, 1);
      }
      if (e.key === "ArrowUp") {
        moveSelect(e, 0, -1);
      }
      if (e.key === "ArrowLeft") {
        moveSelect(e, -1, 0);
      }
      if (e.key === "ArrowRight") {
        moveSelect(e, 1, 0);
      }
    }
  });

  return controller;
}
