function postRequest(url, body, callback) {
  const XHR = new XMLHttpRequest();
  XHR.addEventListener("load", function (event) {
    if (callback) callback(JSON.parse(XHR.response));
  });
  XHR.addEventListener("error", function (event) {
    console.error(event);
  });
  XHR.open("post", url);
  XHR.setRequestHeader("content-type", "application/json");
  XHR.send(JSON.stringify(body));
}

function CsvTable(env, tableId, inputSelctor, onclick) {
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
  const tableTopLeft = element.querySelector(".table-top-left");
  const tableRightBottom = element.querySelector(".table-right-bottom");
  const markerAll = element.querySelectorAll(".table-marker");
  const borderThick = 1;
  const topOffset = tableTopLeft.getBoundingClientRect().height * 2;

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
      if (!controller.loaded) return;
      if (this.y === 0 && this.x > 0) {
        this.select(e, cell => cell.y >= 0 && cell.x === this.x);
        controller.setMarker(this);
      } else if (this.x === 0 && this.y > 0) {
        this.select(e, cell => cell.x >= 0 && cell.y === this.y);
        controller.setMarker(this);
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
          if (controller.editCell === this) {
            this.clearSelect();
            delete controller.editCell;
          } else {
            dataInput.focus();
            dataInput.select();
            controller.editCell = this;
          }
        }
        controller.setMarker(this);
      }
      controller.showMarker();
      e.preventDefault();
    });
    this.setSelect = () => {
      this.element.style.setProperty("background-color", "pink");
      this.selected = true;
      controller.currentSelectedCell = this;
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
      onclick(this);
      e.stopPropagation();
    };
    this.setText = text => {
      const div = this.element.querySelector("div");
      if (div.innerText === text) return;
      div.innerText = text;
      const commonStyle = () => {
        let s = ``;
        return s;
      };
      if (text.indexOf("@") === 0) {
        div.classList.add("csv-cell-button");
        div.style = `${commonStyle()} width: ${
          this.getWidth() - 32
        }px; height: ${this.getHeight() - 7}px; color: ${
          this.color
        }; margin-right: 10px;`;
        div.addEventListener("click", this.clickButton);
      } else {
        div.classList.remove("csv-cell-button");
        div.style = `${commonStyle()} color: ${this.color};`;
        div.removeEventListener("click", this.clickButton);
      }
    };
    this.getText = () => {
      return this.element.querySelector("div").innerText;
    };
  }

  function CellController(tableCell, topOffset) {
    this.cells = [];
    this.defaultCellSize = { width: 50, height: 18 };
    this.rowSize = [];
    this.colSize = [];
    this.rowWidth = [];
    this.colHeight = [];
    this.topOffset = topOffset;
    tableCell.forEach(element => {
      this.cells.push(new TableCell(element, this));
    });

    function makeThumb(props) {
      const {
        className,
        top,
        left,
        width,
        height,
        cursor,
        x,
        y,
        backgroundColor,
      } = props;
      const div = document.createElement("div");
      div.setAttribute("class", `table-thumb ${className}`);
      div.style = `left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px; cursor: ${cursor}; background-color: ${backgroundColor};`;
      div.setAttribute("data-x", x);
      div.setAttribute("data-y", y);
      return div;
    }

    function makeThumbs(cell) {
      const r = [];
      const { element } = cell;
      const top = parseInt(element.style.top);
      const left = parseInt(element.style.left);
      const width = parseInt(element.style.width);
      const height = parseInt(element.style.height);
      if (cell.x === 0) {
        r.push(
          makeThumb({
            className: "row-resize",
            top: top - 2,
            left,
            width: width + 1,
            height: 2,
            x: cell.x,
            y: cell.y - 1,
            // backgroundColor: "blue",
            cursor: "row-resize",
          })
        );
        r.push(
          makeThumb({
            className: "row-resize",
            top: top + height,
            left,
            width: width + 1,
            height: 2,
            x: cell.x,
            y: cell.y,
            // backgroundColor: "blue",
            cursor: "row-resize",
          })
        );
      }
      if (cell.y === 0) {
        r.push(
          makeThumb({
            className: "col-resize",
            top,
            left,
            width: 2,
            height: height + 1,
            x: cell.x - 1,
            y: cell.y,
            // backgroundColor: "lightgray",
            cursor: "col-resize",
          })
        );
        r.push(
          makeThumb({
            className: "col-resize",
            top,
            left: left + width - 1,
            width: 2,
            height: height + 1,
            x: cell.x,
            y: cell.y,
            // backgroundColor: "lightgray",
            cursor: "col-resize",
          })
        );
      }
      return r;
    }

    function makeCell(cell) {
      const element = document.createElement("div");
      const div = document.createElement("div");
      div.style = `color: ${cell.color};`;
      const newContent = document.createTextNode("");
      div.appendChild(newContent);
      element.appendChild(div);
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
      delete this.editCell;
    };
    this.showMarker = () => {
      if (this.cells.some(cell => cell.selected) && this.currentSelectedCell) {
        const { element } = this.currentSelectedCell;
        const table = {
          "table-top": tableTop,
          "table-left": tableLeft,
          "table-top-left": tableTopLeft,
          "table-right-bottom": tableRightBottom,
        };
        markerAll.forEach(marker => {
          const name = marker.getAttribute("name");
          if (table[name].contains(element)) {
            marker.style.setProperty("visibility", "visible");
          } else {
            marker.style.setProperty("visibility", "hidden");
          }
        });
      } else {
        markerAll.forEach(marker => {
          marker.style.setProperty("visibility", "hidden");
        });
      }
    };
    this.setMarker = cell => {
      const cellRect = cell.element.getBoundingClientRect();
      const tableRect1 = element.getBoundingClientRect();
      markerAll.forEach(marker => {
        const name = marker.getAttribute("name");
        if (name === "table-right-bottom") {
          marker.style.top = `${cellRect.top - tableRect1.top}px`;
        } else if (name === "table-top") {
          marker.style.top = `${this.sumTop(cell.y) - this.topOffset}px`;
        } else if (name === "table-top-left") {
          marker.style.top = `${this.sumTop(cell.y)}px`;
        } else {
          marker.style.top = `${
            cellRect.top - this.topOffset - tableRect1.top
          }px`;
        }
      });
      markerAll.forEach(marker => {
        const name = marker.getAttribute("name");
        const tableRect1 = element.getBoundingClientRect();
        if (name === "table-right-bottom") {
          marker.style.left = `${cellRect.left - tableRect1.left}px`;
        } else if (name === "table-top") {
          marker.style.left = `${
            this.sumLeft(cell.x) // - parseInt(tableRect1.left)
          }px`;
        } else if (name === "table-top-left") {
          marker.style.left = `${this.sumLeft(cell.x)}px`;
        } else {
          marker.style.left = `${cellRect.left - parseInt(tableRect1.left)}px`;
        }
      });
      markerAll.forEach(marker => {
        marker.style.width = `${this.rowWidth[cell.x] - 3}px`;
      });
      markerAll.forEach(marker => {
        marker.style.height = `${this.colHeight[cell.y] - 3}px`;
      });
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
        newCells.push(newCell);
      });

      const y = selectedCell.y;
      const height = this.colHeight[y + 1];
      this.colHeight.push(this.colHeight[this.colHeight.length - 1]);
      this.colSize.push(this.colHeight[this.colHeight.length - 1]);
      this.maxCol++;
      this.cells.forEach(cell => {
        if (cell.y >= y) {
          cell.moveFrom(0, 1, 0, height);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      const addheight = this.colHeight[this.colHeight.length - 1];

      tableLeft.style.height = `${
        parseInt(tableLeft.style.height) + addheight
      }px`;
      element.style.height = `${parseInt(element.style.height) + addheight}px`;

      this.cells = [...this.cells, ...newCells];
      this.resetIndexNumber();

      const lastCell = this.cells.find(
        cell => cell.x === 0 && cell.y === this.maxCol - 1
      );
      if (lastCell) {
        const thumbs = makeThumbs(lastCell);
        thumbs.forEach(thumb => tableLeft.appendChild(thumb));
      }

      this.updateThumb();

      Object.entries(resizeMarkers).forEach(([k, v]) => {
        v.forEach(v => {
          if (v.classList.contains("vertical")) {
            v.style.height = `${parseInt(v.style.height) + addheight}px`;
          }
        });
      });
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
        newCells.push(newCell);
      });

      const x = selectedCell.x;
      const width = this.rowWidth[x + 1];
      this.rowWidth.push(this.rowWidth[this.rowWidth.length - 1]);
      this.rowSize.push(this.rowWidth[this.rowWidth.length - 1]);
      this.maxRow++;
      this.cells.forEach(cell => {
        if (cell.x >= x) {
          cell.moveFrom(1, 0, width, 0);
          cell.element.style["background-color"] = cell.backgroundColor;
        }
      });

      const addwidth = this.rowWidth[this.rowWidth.length - 1];

      tableTop.style.width = `${parseInt(tableTop.style.width) + addwidth}px`;
      // tableRightBottom.style.width = `${
      //   parseInt(tableRightBottom.style.width) + addwidth
      // }px`;
      element.style.width = `${parseInt(element.style.width) + addwidth}px`;

      this.cells = [...this.cells, ...newCells];
      this.resetIndexNumber();

      const lastCell = this.cells.find(
        cell => cell.y === 0 && cell.x === this.maxRow - 1
      );
      if (lastCell) {
        const thumbs = makeThumbs(lastCell);
        thumbs.forEach(thumb => tableTop.appendChild(thumb));
      }

      this.updateThumb();

      Object.entries(resizeMarkers).forEach(([k, v]) => {
        v.forEach(v => {
          if (v.classList.contains("horizontal")) {
            v.style.width = `${parseInt(v.style.width) + addwidth}px`;
          }
        });
      });
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
            this.thumbs.horizontal[this.thumbs.horizontal.length - 1].remove();
            this.thumbs.horizontal[this.thumbs.horizontal.length - 2].remove();
            this.updateThumb();
            if (this.currentSelectedCell) {
              this.setMarker(this.currentSelectedCell);
            }
            const dy = -this.colHeight[this.maxCol];
            Object.entries(resizeMarkers).forEach(([k, v]) => {
              v.forEach(v => {
                if (v.classList.contains("vertical")) {
                  v.style.height = `${parseInt(v.style.height) + dy}px`;
                }
              });
            });
            tableLeft.style.height = `${
              parseInt(tableLeft.style.height) + dy
            }px`;
            element.style.height = `${parseInt(element.style.height) + dy}px`;
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
            this.thumbs.vertical[this.thumbs.vertical.length - 1].remove();
            this.thumbs.vertical[this.thumbs.vertical.length - 2].remove();
            this.updateThumb();
            if (this.currentSelectedCell) {
              this.setMarker(this.currentSelectedCell);
            }
            const dx = -this.rowWidth[this.maxRow];
            Object.entries(resizeMarkers).forEach(([k, v]) => {
              v.forEach(v => {
                if (v.classList.contains("horizontal")) {
                  v.style.width = `${parseInt(v.style.width) + dx}px`;
                }
              });
            });
            tableTop.style.width = `${parseInt(tableTop.style.width) + dx}px`;
            tableRightBottom.style.width = `${
              parseInt(tableRightBottom.style.width) + dx
            }px`;
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
      postRequest(
        `${url}/${dataName}`,
        {
          csv,
          colSize: this.colSize,
          rowSize: this.rowSize,
          maxCol: this.maxCol,
          maxRow: this.maxRow,
        },
        message => {
          console.log(message);
        }
      );
    };
    this.selectedCells = () => {
      return this.cells.filter(cell => cell.selected);
    };
    this.setPasteboard = (type, cells) => {
      this.pasteboard = { type, cells };
    };
    this.getPasteboard = () => {
      return this.pasteboard || { type: "copy", cells: [] };
    };
    this.selectedCellTopLeft = () => {
      let minx = -1;
      let miny = -1;
      this.cells.forEach(cell => {
        if (cell.selected) {
          if (minx < 0 || minx > cell.x) minx = cell.x;
          if (miny < 0 || miny > cell.y) miny = cell.y;
        }
      });
      if (minx < 0 || miny < 0) return null;
      return { x: minx, y: miny };
    };

    this.thumbs = {
      horizontal: [],
      vertical: [],
    };

    this.updateThumb = () => {
      const thumbAll = element.querySelectorAll(".table-thumb");
      this.thumbs.horizontal = [];
      this.thumbs.vertical = [];
      thumbAll.forEach(thumb => {
        if (thumb.classList.contains("row-resize")) {
          this.thumbs.horizontal.push(thumb);
        } else {
          this.thumbs.vertical.push(thumb);
        }
        const mouseDown = e => {
          this.mouseDown(e, thumb);
        };
        const dblClick = e => {
          this.resizeDefault(e, thumb);
        };
        thumb.removeEventListener("mousedown", mouseDown);
        thumb.addEventListener("mousedown", mouseDown);
        thumb.removeEventListener("dblclick", dblClick);
        thumb.addEventListener("dblclick", dblClick);
      });
      this.thumbs.horizontal.sort((a, b) => {
        return parseInt(a.style.top) - parseInt(b.style.top);
      });
      this.thumbs.vertical.sort((a, b) => {
        return parseInt(a.style.left) - parseInt(b.style.left);
      });
    };

    const resizeMarkers = (function () {
      const resizeMarkers = {
        tableTopLeft: [
          ...tableTopLeft.querySelectorAll(".table-resize-marker"),
        ],
      };
      Object.entries(resizeMarkers).forEach(([k, v]) => {
        const horizontal = v.find(v => v.classList.contains("horizontal"));
        const vertical = v.find(v => v.classList.contains("vertical"));
        if (horizontal) {
          horizontal.style.visibility = "hidden";
          horizontal.style.width = `${parseInt(element.style.width) - 2}px`;
          horizontal.style.height = "1px";
        }
        if (vertical) {
          vertical.style.visibility = "hidden";
          vertical.style.width = "1px";
          vertical.style.height = `${parseInt(element.style.height) - 4}px`;
        }
      });
      return resizeMarkers;
    })();

    this.getResizeMarker = thumb => {
      if (thumb.classList.contains("row-resize")) {
        return resizeMarkers.tableTopLeft.find(marker => {
          if (marker.classList.contains("horizontal")) {
            return marker;
          }
        });
      } else {
        return resizeMarkers.tableTopLeft.find(marker => {
          if (marker.classList.contains("vertical")) {
            return marker;
          }
        });
      }
    };

    const thumbElement = thumb => {
      if (tableTop.contains(thumb)) return tableTop;
      if (tableLeft.contains(thumb)) return tableLeft;
      return element;
    };

    const getScrollOffset = thumb => {
      const vrect = element.getBoundingClientRect();
      const rect = thumbElement(thumb).getBoundingClientRect();
      return [vrect.x - rect.x, vrect.y - rect.y];
    };

    this.elementPosition = thumb => {
      const [ddx, ddy] = getScrollOffset(thumb);
      const rect = thumbElement(thumb).getBoundingClientRect();
      const dx = rect.left + window.pageXOffset + ddx;
      const dy = rect.top + window.pageYOffset + ddy;
      return [dx, dy];
    };

    this.resizeMarkerX = (x, thumb) => {
      const index = this.thumbs.vertical.indexOf(thumb);
      const colIndex = parseInt(thumb.getAttribute("data-x"));
      const leftThumb = this.thumbs.vertical[index - 2];
      const topPos = parseInt(tableTopLeft.style.left);
      const thumbPosition = leftThumb
        ? leftThumb.getBoundingClientRect().left
        : topPos + this.sumLeft(colIndex);
      const min = thumbPosition + 4 - topPos;
      if (x <= min) return min;
      return x;
    };

    this.resizeMarkerY = (y, thumb, marker) => {
      const index = this.thumbs.horizontal.indexOf(thumb);
      const colIndex = parseInt(thumb.getAttribute("data-y"));
      const topThumb = this.thumbs.horizontal[index - 2];
      const topPos = parseInt(tableTopLeft.style.top);
      const thumbPosition = topThumb
        ? topThumb.getBoundingClientRect().top
        : topPos + this.sumTop(colIndex);
      if (
        this.fixedPoint.y >= 1 &&
        colIndex <= this.fixedPoint.y &&
        tableTopLeft.contains(thumb)
      ) {
        const min = this.sumTop(colIndex) + 4;
        if (y <= min) return min;
      } else {
        const min = thumbPosition + 4 - topPos;
        if (y <= min) return min;
      }
      return y;
    };

    this.moveResizeMarker = (thumb, e) => {
      const [dx, dy] = this.elementPosition(thumb);
      const marker = this.getResizeMarker(thumb);
      if (marker) {
        marker.style.visibility = "visible";
        if (marker.classList.contains("vertical")) {
          const tx = this.resizeMarkerX(e.clientX - dx, thumb, marker);
          marker.style.left = `${tx}px`;
        } else {
          const ty = this.resizeMarkerY(e.clientY - dy, thumb, marker);
          marker.style.top = `${ty}px`;
        }
        return [parseInt(marker.style.left), parseInt(marker.style.top)];
      }
      return [0, 0];
    };

    this.hideResizeMarker = () => {
      Object.entries(resizeMarkers).forEach(([k, v]) => {
        const horizontal = v.find(v => v.classList.contains("horizontal"));
        const vertical = v.find(v => v.classList.contains("vertical"));
        if (horizontal) {
          horizontal.style.visibility = "hidden";
        }
        if (vertical) {
          vertical.style.visibility = "hidden";
        }
      });
    };

    this.resizeDefault = (e, thumb) => {
      this.targetThumb = thumb;
      const datax = thumb.getAttribute("data-x");
      const datay = thumb.getAttribute("data-y");
      const width = this.rowWidth[datax];
      const height = this.colHeight[datay];
      this.mousePosition = {
        dx: this.defaultCellSize.width - width,
        dy: this.defaultCellSize.height - height,
      };
      this.mouseUp(e);
      if (thumb.classList.contains("row-resize")) {
        this.colSize[datay] = this.defaultCellSize.height;
      } else {
        this.rowSize[datax] = this.defaultCellSize.width;
      }
    };

    this.mouseDown = (e, thumb) => {
      this.targetThumb = thumb;
      this.mousePosition = {
        x: e.clientX,
        y: e.clientY,
        dx: 0,
        dy: 0,
        mx: 0,
        my: 0,
      };
      const [mx, my] = this.moveResizeMarker(this.targetThumb, e);
      this.mousePosition.mx = mx;
      this.mousePosition.my = my;
      e.stopPropagation();
    };
    this.mouseMove = e => {
      if (this.targetThumb) {
        const [mx, my] = this.moveResizeMarker(this.targetThumb, e);
        this.mousePosition.dx = mx - this.mousePosition.mx;
        this.mousePosition.dy = my - this.mousePosition.my;
      }
    };
    this.mouseUp = e => {
      if (this.targetThumb) {
        const { dx, dy } = this.mousePosition;
        if (this.targetThumb.classList.contains("row-resize")) {
          const index = parseInt(this.targetThumb.getAttribute("data-y"));
          if (index === 0) {
            this.thumbs.vertical.forEach(thumb => {
              thumb.style.height = `${parseInt(thumb.style.height) + dy}px`;
            });
          }
          this.thumbs.horizontal.forEach(thumb => {
            const i = parseInt(thumb.getAttribute("data-y"));
            if (i >= index) {
              thumb.style.top = `${parseInt(thumb.style.top) + dy}px`;
            }
          });
          this.colHeight[index] += dy;
          this.colSize[index] = this.colHeight[index];
          this.cells.forEach(cell => {
            if (cell.y === index) {
              cell.element.style.height = `${
                parseInt(cell.element.style.height) + dy
              }px`;
            } else if (cell.y > index) {
              cell.element.style.top = `${
                parseInt(cell.element.style.top) + dy
              }px`;
            }
          });
          Object.entries(resizeMarkers).forEach(([k, v]) => {
            v.forEach(v => {
              if (v.classList.contains("vertical")) {
                v.style.height = `${parseInt(v.style.height) + dy}px`;
              }
            });
          });
          tableLeft.style.height = `${parseInt(tableLeft.style.height) + dy}px`;
          element.style.height = `${parseInt(element.style.height) + dy}px`;
        } else {
          const index = parseInt(this.targetThumb.getAttribute("data-x"));
          this.thumbs.vertical.forEach(thumb => {
            const i = parseInt(thumb.getAttribute("data-x"));
            if (i >= index) {
              thumb.style.left = `${parseInt(thumb.style.left) + dx}px`;
            }
          });
          if (index === 0) {
            this.thumbs.horizontal.forEach(thumb => {
              thumb.style.width = `${parseInt(thumb.style.width) + dx}px`;
            });
          }
          this.rowWidth[index] += dx;
          this.rowSize[index] = this.rowWidth[index];
          this.cells.forEach(cell => {
            if (cell.x === index) {
              cell.element.style.width = `${
                parseInt(cell.element.style.width) + dx
              }px`;
            } else if (cell.x > index) {
              cell.element.style.left = `${
                parseInt(cell.element.style.left) + dx
              }px`;
            }
          });
          Object.entries(resizeMarkers).forEach(([k, v]) => {
            v.forEach(v => {
              if (v.classList.contains("horizontal")) {
                v.style.width = `${parseInt(v.style.width) + dx}px`;
              }
            });
          });
          tableTop.style.width = `${parseInt(tableTop.style.width) + dx}px`;
          tableRightBottom.style.width = `${
            parseInt(tableRightBottom.style.width) + dx
          }px`;
          element.style.width = `${parseInt(element.style.width) + dx}px`;
        }
        if (this.currentSelectedCell) {
          this.setMarker(this.currentSelectedCell);
        }
        delete this.targetThumb;
        this.hideResizeMarker();
      }
      delete this.mousePosition;
    };
  }

  const controller = new CellController(tableCell, topOffset);

  postRequest(
    `${env}/${dataName}`,
    {
      rowSize: true,
      colSize: true,
      defaultCellSize: true,
      fixedPoint: true,
    },
    res => {
      controller.rowSize = res.rowSize || [];
      controller.colSize = res.colSize || [];
      controller.defaultCellSize = res.defaultCellSize;
      controller.fixedPoint = res.fixedPoint;
      controller.cells.forEach(cell => cell.setText(cell.getText()));
      controller.maxRow =
        controller.cells.reduce((a, cell) => (a < cell.x ? cell.x : a), 0) + 1;
      controller.maxCol =
        controller.cells.reduce((a, cell) => (a < cell.y ? cell.y : a), 0) + 1;
      controller.resize();
      controller.updateThumb();
      controller.loaded = true;
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
  // ajustTableSize();

  // window.addEventListener("resize", () => {
  //   ajustTableSize();
  // });

  const moveSelect = (e, dx, dy) => {
    if (controller.currentSelectedCell) {
      const cell = controller.currentSelectedCell;
      const _cell = controller.selectCellWithPosition(cell.x + dx, cell.y + dy);
      if (!e.shiftKey && !e.altKey) {
        if (_cell) controller.clearSelectAll();
      }
      if (_cell && _cell.element && !_cell.selected) {
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

  window.addEventListener("mousemove", controller.mouseMove);

  window.addEventListener("mouseup", controller.mouseUp);

  window.addEventListener("keydown", e => {
    if (e.target == dataInput) {
      if (e.key === "Enter") {
        dataInput.blur();
        moveSelect(e, 0, 1);
      }
    }
    if (e.target == document.querySelector("body")) {
      if (e.metaKey) {
        if (e.key === "x") {
          const selCell = controller.selectedCellTopLeft();
          if (selCell) {
            controller.setPasteboard(
              "cut",
              controller.selectedCells().map(cell => ({
                x: cell.x - selCell.x,
                y: cell.y - selCell.y,
                text: cell.getText(),
                cell,
              }))
            );
          }
        }
        if (e.key === "c") {
          const selCell = controller.selectedCellTopLeft();
          if (selCell) {
            controller.setPasteboard(
              "copy",
              controller.selectedCells().map(cell => ({
                x: cell.x - selCell.x,
                y: cell.y - selCell.y,
                text: cell.getText(),
                cell,
              }))
            );
          }
        }
        if (e.key === "v") {
          const selCell = controller.selectedCellTopLeft();
          if (selCell) {
            const { type, cells } = controller.getPasteboard();
            if (type === "cut") {
              cells.forEach(item => item.cell.setText(""));
            }
            cells.forEach(item => {
              controller.cells.forEach(cell => {
                if (
                  cell.x === selCell.x + item.x &&
                  cell.y === selCell.y + item.y
                ) {
                  cell.setText(item.text);
                }
              });
            });
          }
        }
      }
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
            dataInput.select();
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
