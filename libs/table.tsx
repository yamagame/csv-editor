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

export const divTable = (csvArray, options) => {
  const { browser } = options;
  const maxRow = csvArray.reduce((a, v) => (a < v.length ? v.length : a), 0);
  const maxCol = csvArray.length;
  const rowArray = new Array(maxRow).fill(0);
  const colArray = new Array(maxCol).fill(0);
  const rowWidth = rowArray.map(v => 100);
  const colHeight = colArray.map(v => 24);
  rowWidth[0] = 50;
  rowWidth[1] = 50;
  const fixedPoint = { x: 1, y: 1 };
  let count = maxRow * maxCol;
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
    return (
      <TableCell
        className="tableCell"
        data={{
          x: cell.x,
          y: cell.y,
          top,
          left,
        }}
        zIndex={count--}
        left={left + cell.ox}
        top={top + cell.oy}
        width={rowWidth[cell.x]}
        height={colHeight[cell.y]}
        borderRight="solid 1px"
        borderBottom="solid 1px"
        {...props}>
        <div style={{ marginLeft: 10 }}>{escapeHtml(cell.value)}</div>
      </TableCell>
    );
  };
  const leftOffset =
    rowWidth.reduce((a, v, i) => (i <= fixedPoint.x ? a + v : a), 0) * 2;
  const topOffset =
    colHeight.reduce((a, v, i) => (i <= fixedPoint.y ? a + v : a), 0) * 2;
  const p = (() => {
    switch (browser) {
      case "safari":
        return { x: 1, y: 1 };
      case "chrome":
      default:
        return { x: 0, y: 0 };
    }
  })();
  return (
    <div
      id="scrollTest"
      style={{
        margin: 0,
        padding: 0,
        position: "relative",
        left: 0,
        top: 50,
        borderTop: "solid 1px",
        borderLeft: "solid 1px",
        display: "inline-block",
        overflow: "auto",
        height: sumTop(maxCol),
        width: sumLeft(maxRow),
      }}>
      <TableCell
        className="tableLeftTop"
        position="sticky"
        zIndex={count + 300}
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
            .map(cell => DataCell(cell, { backgroundColor: "pink" }))
        )}
      </TableCell>
      <TableCell
        className="tableTop"
        position="sticky"
        zIndex={count + 100}
        width={sumLeft(maxRow) + 2}
        height={sumTop(fixedPoint.y + 1)}
        left={p.x}
        top={leftOffset}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return {
                ...(v[x] || { value: "" }),
                x,
                y: y,
                ox: -p.x,
                oy: -leftOffset,
              };
            })
            .filter(cell => cell.x > fixedPoint.x && cell.y <= fixedPoint.y)
            .map(cell => ({ ...cell }))
            .map(cell => DataCell(cell, { backgroundColor: "lightgray" }))
        )}
      </TableCell>
      <TableCell
        className="tableLeft"
        position="sticky"
        zIndex={count + 200}
        width={sumLeft(fixedPoint.x + 1)}
        height={sumTop(maxCol) - topOffset + 1}
        left={0}
        top={topOffset + p.y}>
        {csvArray.map((v, y) =>
          rowArray
            .map((_, x) => {
              return {
                ...(v[x] || { value: "" }),
                x,
                y,
                ox: 0,
                oy: -topOffset - p.y,
              };
            })
            .filter(cell => cell.x <= fixedPoint.x && cell.y > fixedPoint.y)
            .map(cell => DataCell(cell, { backgroundColor: "white" }))
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
            .map(cell => DataCell(cell, { backgroundColor: "white" }))
        )}
      </TableCell>
    </div>
  );
};

export const simpleTable = csvArray => (
  <table class="topCsvDom">
    <thead>
      <tr>
        {csvArray[0].map((cell, j) => (
          <th class="fileNameBG">{escapeHtml(cell.value)}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {[...csvArray].slice(1).map(v => (
        <tr>
          {v.map(v => (
            <td>{escapeHtml(v.value)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
