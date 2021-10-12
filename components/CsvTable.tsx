import { factory, Fragment } from "libs/preact";
import { escapeHtml } from "libs/utils";

export const ResizeMarker = ({ topOffset = 0 }) => {
  return (
    <>
      <div
        className="table-resize-marker horizontal"
        dataTopOffset={topOffset}></div>
      <div
        className="table-resize-marker vertical"
        dataTopOffset={topOffset}></div>
    </>
  );
};

export const TableThumbs = ({
  cells,
  topOffset = 0,
  rowWidth,
  colHeight,
  sumTop,
  sumLeft,
  direction,
}) =>
  cells.map(d =>
    d.map(cell => {
      const top = sumTop(cell.y) - topOffset;
      const left = sumLeft(cell.x);
      const width = rowWidth[cell.x];
      const height = colHeight[cell.y];
      if (cell.x === 0 && cell.y === 0) return null;
      return (
        <>
          {direction.match("horizontal") && cell.x === 0 ? (
            <>
              {cell.y > 1 ? (
                <div
                  className="table-thumb row-resize"
                  style={{
                    left,
                    top,
                    width,
                    height: `2px`,
                    cursor: "row-resize",
                    // backgroundColor: "blue",
                  }}
                  dataX={cell.x}
                  dataY={cell.y - 1}></div>
              ) : null}
              <div
                className="table-thumb row-resize"
                style={{
                  top: top + height - 1,
                  left,
                  width,
                  height: `2px`,
                  cursor: "row-resize",
                  // backgroundColor: "blue",
                }}
                dataX={cell.x}
                dataY={cell.y}></div>
            </>
          ) : null}
          {direction.match("vertical") && cell.y === 0 ? (
            <>
              {cell.x > 1 ? (
                <div
                  className="table-thumb col-resize"
                  style={{
                    left,
                    top,
                    height,
                    cursor: "col-resize",
                    width: `2px`,
                    // backgroundColor: "lightgray",
                  }}
                  dataX={cell.x - 1}
                  dataY={cell.y}></div>
              ) : null}
              <div
                className="table-thumb col-resize"
                style={{
                  left: `${left + width - 2}px`,
                  top,
                  height,
                  cursor: "col-resize",
                  width: `2px`,
                  // backgroundColor: "lightgray",
                }}
                dataX={cell.x}
                dataY={cell.y}></div>
            </>
          ) : null}
        </>
      );
    })
  );

export const TableCell = (props: any) => {
  const { children, className, data, marker, name } = props;
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
      name={name}
      style={deleteUndef({ position: "absolute", ...props })}
      {...dataProps}>
      {children}
      {marker && (
        <TableCell
          className="table-marker"
          name={className}
          zIndex={props.zIndex || 0}
          width={100}
          height={24}
          left={0}
          top={0}></TableCell>
      )}
    </div>
  );
};

export const ThumbCell = (props: any) => {
  const { children, className, data, name } = props;
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
      name={name}
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
            <div style={{ marginLeft: 10, color, top: 1 }}>
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

  const topLeftCells = csvArray.map((v, y) =>
    rowArray
      .map((_, x) => {
        return { ...(v[x] || { value: "" }), x, y: y, ox: 0, oy: 0 };
      })
      .filter(cell => cell.x <= fixedPoint.x && cell.y <= fixedPoint.y)
  );
  const topCells = csvArray.map((v, y) =>
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
  );
  const leftCells = csvArray.map((v, y) =>
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
  );
  const rightBottomCells = csvArray.map((v, y) =>
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
  );

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
        className="table-top-left"
        position="sticky"
        zIndex={30}
        marker
        width={sumLeft(fixedPoint.x + 1)}
        height={0 /* sumTop(fixedPoint.y + 1)*/}
        left={0}
        top={0}>
        {topLeftCells.map(d =>
          d.map(cell =>
            DataCell(cell, {
              backgroundColor: cell.backgroundColor || "white",
              color: cell.color || "black",
            })
          )
        )}
        <TableThumbs
          direction="horizontal vertical"
          cells={topLeftCells}
          rowWidth={rowWidth}
          colHeight={colHeight}
          sumTop={sumTop}
          sumLeft={sumLeft}
        />
        <ResizeMarker topOffset={topOffset} />
      </TableCell>
      <TableCell
        className="table-top"
        position="sticky"
        zIndex={10}
        marker
        width={sumLeft(maxRow) + 2}
        height={0}
        left={0}
        top={topOffset}>
        {topCells.map(d =>
          d.map(cell =>
            DataCell(cell, {
              backgroundColor: cell.backgroundColor || "white",
              color: cell.color || "black",
              pointerEvents: "auto",
            })
          )
        )}
        <TableThumbs
          direction="vertical"
          topOffset={topOffset}
          cells={topCells}
          rowWidth={rowWidth}
          colHeight={colHeight}
          sumTop={sumTop}
          sumLeft={sumLeft}
        />
      </TableCell>
      <TableCell
        className="table-left"
        position="sticky"
        zIndex={20}
        marker
        width={sumLeft(fixedPoint.x + 1)}
        height={sumTop(maxCol) - topOffset + 1}
        left={0}
        top={topOffset}>
        {leftCells.map(d =>
          d.map(cell =>
            DataCell(cell, {
              backgroundColor: cell.backgroundColor || "white",
              color: cell.color || "black",
            })
          )
        )}
        <TableThumbs
          direction="horizontal"
          topOffset={topOffset}
          cells={leftCells}
          rowWidth={rowWidth}
          colHeight={colHeight}
          sumTop={sumTop}
          sumLeft={sumLeft}
        />
      </TableCell>
      <TableCell
        className="table-right-bottom"
        zIndex={0}
        marker
        width={sumLeft(maxRow) + 2}
        height={sumTop(maxCol) + 1}
        left={0}
        top={0}>
        {rightBottomCells.map(d =>
          d.map(cell =>
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
