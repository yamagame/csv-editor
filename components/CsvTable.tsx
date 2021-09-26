import { factory, Fragment } from "libs/preact";
import { escapeHtml } from "libs/utils";

export const TableCell = (props: any) => {
  const { children, className, data } = props;
  delete props.children;
  delete props.className;
  delete props.data;
  const deleteUndef = style => {
    const r = { ...style };
    Object.entries(style).forEach(([k, v]) => v === undefined && delete r[k]);
    return r;
  };
  const dataProps = data
    ? Object.entries(data).reduce((a, [k, v]) => {
        a[`data-${k}`] = v;
        return a;
      }, {})
    : {};
  return (
    <div
      className={className}
      style={deleteUndef({ position: "absolute", ...props })}
      {...dataProps}>
      {children}
    </div>
  );
};

export const CsvTable = ({
  data = [],
  id = "csv-table",
  dataname = "",
  fixedPoint = { x: 1, y: 1 },
  defaultCellSize = { width: 50, height: 18 },
  top = 50,
  left = 0,
  rowSize = [],
  colSize = [],
}) => {
  const csvArray = data;
  const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
  const maxCol = csvArray.length;
  const rowArray = new Array(maxRow).fill(0);
  const colArray = new Array(maxCol).fill(0);
  const rowWidth = rowArray.map(v => defaultCellSize.width);
  const colHeight = colArray.map(v => defaultCellSize.height);
  rowSize.forEach((v, i) => {
    if (v > 0) {
      rowWidth[i] = v;
    }
  });
  colSize.forEach((v, i) => {
    if (v > 0) {
      colHeight[i] = v;
    }
  });
  const sumTop = y =>
    colHeight.reduce((a, v, i) => {
      if (i < y) a += v;
      return a;
    }, 0);
  const sumLeft = x =>
    rowWidth.reduce((a, v, i) => {
      if (i < x) a += v;
      return a;
    }, 0);
  const DataCell = (cell, props) => {
    const top = sumTop(cell.y);
    const left = sumLeft(cell.x);
    const { color } = props;
    delete props.color;
    return (
      <TableCell
        className="csv-table-cell"
        data={{
          x: cell.x,
          y: cell.y,
          top,
          left,
        }}
        left={left + cell.ox}
        top={top + cell.oy}
        width={rowWidth[cell.x] - 1}
        height={colHeight[cell.y] - 1}
        {...props}>
        <pre className="csv-table-code">
          <code>
            <div style={{ marginLeft: 10, color }}>
              {escapeHtml(cell.value)}
            </div>
          </code>
        </pre>
      </TableCell>
    );
  };
  const leftOffset =
    rowWidth.reduce((a, v, i) => (i <= fixedPoint.x ? a + v : a), 0) * 2;
  const topOffset =
    colHeight.reduce((a, v, i) => (i <= fixedPoint.y ? a + v : a), 0) * 2;
  return (
    <div
      id={id}
      className="csv-table"
      style={{
        left,
        top,
        height: sumTop(maxCol) + 2,
        width: sumLeft(maxRow) + 2,
      }}
      dataName={dataname}>
      <TableCell
        className="table-marker"
        zIndex={50}
        width={100}
        height={24}
        left={0}
        top={0}></TableCell>
      <TableCell
        className="table-top-left"
        position="sticky"
        zIndex={30}
        width={sumLeft(fixedPoint.x + 1)}
        height={sumTop(fixedPoint.y + 1)}
        left={0}
        top={0}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return { ...(v[x] || { value: "" }), x, y: y, ox: 0, oy: 0 };
            })
            .filter(cell => cell.x <= fixedPoint.x && cell.y <= fixedPoint.y)
            .map(cell =>
              DataCell(cell, {
                backgroundColor: cell.backgroundColor || "white",
                color: cell.color || "black",
              })
            )
        )}
      </TableCell>
      <TableCell
        className="table-top"
        position="sticky"
        pointerEvents="none"
        zIndex={10}
        width={sumLeft(maxRow) + 2}
        height={sumTop(fixedPoint.y + 1)}
        left={0}
        top={topOffset}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return {
                ...(v[x] || { value: "" }),
                x,
                y: y,
                ox: -0,
                oy: -topOffset,
              };
            })
            .filter(cell => cell.x > fixedPoint.x && cell.y <= fixedPoint.y)
            .map(cell => ({ ...cell }))
            .map(cell =>
              DataCell(cell, {
                backgroundColor: cell.backgroundColor || "white",
                color: cell.color || "black",
                pointerEvents: "auto",
              })
            )
        )}
      </TableCell>
      <TableCell
        className="table-left"
        position="sticky"
        zIndex={20}
        width={sumLeft(fixedPoint.x + 1)}
        height={sumTop(maxCol) - topOffset + 1}
        left={0}
        top={topOffset}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return {
                ...(v[x] || { value: "" }),
                x,
                y,
                ox: 0,
                oy: -topOffset,
              };
            })
            .filter(cell => cell.x <= fixedPoint.x && cell.y > fixedPoint.y)
            .map(cell =>
              DataCell(cell, {
                backgroundColor: cell.backgroundColor || "white",
                color: cell.color || "black",
              })
            )
        )}
      </TableCell>
      <TableCell
        zIndex={0}
        width={sumLeft(maxRow) + 2}
        height={sumTop(maxCol) + 1}
        left={0}
        top={0}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return {
                ...(v[x] || { value: "" }),
                x,
                y: y,
                ox: 0,
                oy: 0,
              };
            })
            .filter(cell => cell.x > fixedPoint.x && cell.y > fixedPoint.y)
            .map(cell =>
              DataCell(cell, {
                backgroundColor: cell.backgroundColor || "white",
                color: cell.color || "black",
              })
            )
        )}
      </TableCell>
    </div>
  );
};
