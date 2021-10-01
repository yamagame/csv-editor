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
    this.backgroundColor = element.style["background-color"];
    this.color = element.querySelector("div").style["color"];
    this.selected = false;
    this.select = (e, callback) => {
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
    element.addEventListener("click", e => {
      if (this.y === 0 && this.x > 0) {
        this.select(e, cell => cell.y >= 0 && cell.x === this.x);
      } else if (this.x === 0 && this.y > 0) {
        this.select(e, cell => cell.x >= 0 && cell.y === this.y);
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
      e.preventDefault();
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
    this.getWidth = () => {
      return controller.rowWidth[this.x];
    };
    this.getHeight = () => {
      return controller.colHeight[this.y];
    };
    this.moveFrom = (x, y, width, height) => {
      const dx = controller.sumLeft(this.x + x) - controller.sumLeft(this.x);
      const dy = controller.sumTop(this.y + y) - controller.sumTop(this.y);
      this.x += x;
      this.y += y;
      this.element.setAttribute("data-x", this.x);
      this.element.setAttribute("data-y", this.y);
      const left = parseInt(this.element.style.left);
      const top = parseInt(this.element.style.top);
      this.element.style.setProperty("left", `${left + dx}px`);
      this.element.style.setProperty("top", `${top + dy}px`);
      this.element.style.setProperty(
        "width",
        `${controller.rowWidth[this.x] - 1}px`
      );
      this.element.style.setProperty(
        "height",
        `${controller.colHeight[this.y] - 1}px`
      );
    };
    this.clickButton = e => {
      console.log(`click ${this.getText()}`);
      e.stopPropagation();
    };
    this.setText = text => {
      const div = this.element.querySelector("div");
      div.innerText = text;
      const commonStyle = () => {
        let s = `position: absolute;`;
        s += `top: 1px;`;
        return s;
      };
      if (text.indexOf("@") === 0) {
        div.classList.add("csv-cell-button");
        div.style = `${commonStyle()} width: ${
          this.getWidth() - 32
        }px; height: ${this.getHeight() - 5}px; margin-left: 10px; color: ${
          this.color
        }; margin-right: 10px;`;
        div.addEventListener("click", this.clickButton);
      } else {
        div.classList.remove("csv-cell-button");
        div.style = `${commonStyle()} margin-left: 10px; color: ${this.color};`;
        div.removeEventListener("click", this.clickButton);
      }
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
      div.style = `margin-left: 10px; color: ${cell.color};`;
      const newContent = document.createTextNode("");
      div.appendChild(newContent);
      code.appendChild(div);
      pre.appendChild(code);
      element.appendChild(pre);
      element.style.cssText = cell.element.style.cssText;
      element.setAttribute("class", "csv-table-cell");
      element.setAttribute("data-x", cell.x);
      element.setAttribute("data-y", cell.y);
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
      marker.style.setProperty("width", `${this.rowWidth[cell.x] - 3}px`);
      marker.style.setProperty("height", `${this.colHeight[cell.y] - 3}px`);
    };
    this.resize = () => {
      const rowArray = new Array(
        Math.max(this.maxRow, this.rowWidth ? this.rowWidth.length : 0)
      ).fill(0);
      const colArray = new Array(
        Math.max(this.maxCol, this.colHeight ? this.colHeight.length : 0)
      ).fill(0);
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
    this.insertColLine = () => {
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
        newCell.color = cell.color;
        newCell.selected = true;
        // console.log(newCell.getText());
        // newCell.setText("");
        newCells.push(newCell);
      });

      const y = selectedCell.y;
      const height = this.colHeight[y + 1];
      this.colHeight.push(this.colHeight[this.colHeight.length - 1]);
      this.maxCol++;
      this.cells.forEach(cell => {
        if (cell.y >= y) {
          cell.moveFrom(0, 1, 0, height);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      tableLeft.style.height = `${parseInt(tableLeft.style.height) + height}px`;

      this.cells = [...this.cells, ...newCells];
      this.cells.forEach(cell => console.log(cell.x, cell.y, cell.getText()));
      this.resetIndexNumber();
    };
    this.insertRowLine = () => {
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
        newCell.color = cell.color;
        newCell.selected = true;
        // console.log(newCell.getText());
        // newCell.setText("");
        newCells.push(newCell);
      });

      const x = selectedCell.x;
      const width = this.rowWidth[x + 1];
      this.rowWidth.push(this.rowWidth[this.rowWidth.length - 1]);
      this.maxRow++;
      this.cells.forEach(cell => {
        if (cell.x >= x) {
          cell.moveFrom(1, 0, width, 0);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      tableTop.style.width = `${parseInt(tableTop.style.width) + width}px`;

      this.cells = [...this.cells, ...newCells];
      this.cells.forEach(cell => console.log(cell.x, cell.y, cell.getText()));
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
      this.cells
        .filter(cell => cell.y === 0)
        .sort((a, b) => {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
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
      }
      return cell;
    };
    this.setInput = cell => {
      dataInput.value = cell.element.innerText.replace(/\n/g, "\\n");
    };
    this.delete = () => {
      const selectedCell = this.currentSelectedCell;
      const selectLine = (dx, dy) => {
        this.resetIndexNumber();
        this.resize();
        this.clearSelectAll();
        const selectCell = (x, y) => {
          const targetCell = this.cells.find(
            cell => cell.x === x && cell.y === y
          );
          if (targetCell) {
            targetCell.element.dispatchEvent(
              new MouseEvent("click", {
                view: window,
                shiftKey: true,
                altKey: true,
              })
            );
            return true;
          }
          return false;
        };
        if (!selectCell(selectedCell.x, selectedCell.y)) {
          selectCell(selectedCell.x + dx, selectedCell.y + dy);
        }
      };
      if (selectedCell && (selectedCell.y > 0 || selectedCell.x > 0)) {
        const removeElements = [];
        if (selectedCell.x === 0) {
          if (this.maxCol > 2) {
            const cells = this.cells
              .filter(cell => {
                if (cell.y === selectedCell.y) {
                  removeElements.push(cell.element);
                  return false;
                }
                return true;
              })
              .map(cell => {
                if (cell.y > selectedCell.y) {
                  const height = this.colHeight[selectedCell.y];
                  cell.moveFrom(0, -1, 0, -height);
                }
                return cell;
              });
            this.cells = cells;
            this.maxCol--;
            selectLine(0, -1);
          }
        } else if (selectedCell.y === 0) {
          if (this.maxRow > 2) {
            const cells = this.cells
              .filter(cell => {
                if (cell.x === selectedCell.x) {
                  removeElements.push(cell.element);
                  return false;
                }
                return true;
              })
              .map(cell => {
                if (cell.x > selectedCell.x) {
                  const width = this.rowWidth[selectedCell.x];
                  cell.moveFrom(-1, 0, -width, 0);
                }
                return cell;
              });
            this.cells = cells;
            this.maxRow--;
            selectLine(-1, 0);
          }
        } else {
          selectedCell.setText("");
          dataInput.value = "";
        }
        removeElements.forEach(el => el.remove());
      }
    };
    this.save = url => {
      const csv = this.cells.map(cell => ({
        x: cell.x,
        y: cell.y,
        value: cell.getText(),
      }));
      postRequest(`${url}/${dataName}`, {
        csv,
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
      controller.cells.forEach(cell => cell.setText(cell.getText()));
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
        moveSelect(e, 0, 1);
      }
    }
    if (e.target == document.querySelector("body")) {
      if (e.key === " ") {
        if (controller.currentSelectedCell) {
          if (controller.currentSelectedCell.getText() !== "") {
            controller.currentSelectedCell.setText("");
          } else {
            controller.currentSelectedCell.setText("◯");
          }
          moveSelect(e, 0, 1);
        }
      }
      if (e.key === "Enter") {
        if (controller.currentSelectedCell) {
          if (
            controller.currentSelectedCell.x === 0 &&
            controller.currentSelectedCell.y > 0
          ) {
            const { x, y } = controller.currentSelectedCell;
            controller.insertColLine(controller.currentSelectedCell.y);
            controller.selectCellWithPosition(x, y);
          } else if (
            controller.currentSelectedCell.x > 0 &&
            controller.currentSelectedCell.y === 0
          ) {
            const { x, y } = controller.currentSelectedCell;
            controller.insertRowLine(controller.currentSelectedCell.x);
            controller.selectCellWithPosition(x, y);
          } else if (
            controller.currentSelectedCell.x > 0 &&
            controller.currentSelectedCell.y > 0
          ) {
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
      if (e.key === "Backspace") {
        controller.delete();
      }
      if (e.key === "Delete") {
        controller.delete();
      }
    }
  });

  return controller;
}
