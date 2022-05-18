import { Checkbox } from "@material-ui/core";
import { MoreHorizontalIcon } from "@saleor/macaw-ui";
import { toggle } from "@saleor/utils/lists";
import React from "react";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";

import CardMenu, { CardMenuItem } from "../CardMenu";
import ColumnPicker from "../ColumnPicker";
import Column from "./Column";
import ColumnResize from "./ColumnResize";
import useStyles, { columnResizerWidth, rowIndicatorWidth } from "./styles";

export interface DatagridCell extends CellBase<string> {
  column: string;
  id: string;
}

export interface DatagridProps<T extends { id: string }> {
  availableColumns: Array<Record<"label" | "value", string>>;
  data: T[];
  getData: (row: T, column: string) => DatagridCell;
  menuItems: (id: string) => CardMenuItem[];
  onChange: (data: Matrix<DatagridCell>) => void;
}

function getId(row: DatagridCell[]): string {
  return row[0].id;
}

export const Datagrid = <T extends { id: string }>({
  availableColumns,
  data: initial,
  getData,
  menuItems,
  onChange
}: DatagridProps<T>): React.ReactElement => {
  const classes = useStyles();

  const [columns, setColumns] = React.useState(
    availableColumns.map(c => ({
      ...c,
      width: 200
    }))
  );
  const [rows, setRows] = React.useState<string[]>(initial.map(d => d.id));
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  // May contain formulas
  const [data, setData] = React.useState<Matrix<DatagridCell>>([]);
  const dataRef = React.useRef<Matrix<DatagridCell>>(data);
  const updateRef = (d: Matrix<DatagridCell>) => {
    dataRef.current = d;
  };

  React.useEffect(() => {
    const newData = initial.map(v => columns.map(c => getData(v, c.value)));
    setRows(initial.map(d => d.id));
    setData(newData);
    updateRef(newData);
  }, [initial]);

  React.useEffect(() => {
    if (rows.length && columns.length) {
      const newData = dataRef.current
        .map((_, index) =>
          dataRef.current.find(row => getId(row) === rows[index])
        )
        .map(row => columns.map(c => row.find(f => f.column === c.value)));
      setData(newData);
      updateRef(newData);
    }
  }, [columns, rows]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.scrollable}>
        <Spreadsheet
          data={data}
          columnLabels={columns.map(c => c.label)}
          className={classes.spreadsheet}
          Table={({ children }) => (
            <table className={classes.table}>
              <colgroup>
                <col className={classes.rowIndicator} />
                {columns.map(({ value, width }) => (
                  <col key={value} style={{ width }} />
                ))}
                <col className={classes.actionCol} />
              </colgroup>
              <tbody>{children}</tbody>
            </table>
          )}
          ColumnIndicator={({ column, label, onSelect }) => (
            <Column
              onClick={() => onSelect(column, true)}
              draggable
              data-column={column}
              onDrop={e => {
                const targetIndex = parseInt(
                  e.dataTransfer.getData("text/plain"),
                  10
                );
                setColumns(columns => {
                  const c = [...columns];
                  const r = c.splice(targetIndex, 1)[0];
                  c.splice(column, 0, r);
                  return c;
                });
              }}
            >
              {label}
            </Column>
          )}
          RowIndicator={({ row }) => (
            <td>
              <Checkbox
                checked={selected.includes(data[row][0].id)}
                onChange={() =>
                  setSelected(
                    toggle(data[row][0].id, selected, (a, b) => a === b)
                  )
                }
              />
            </td>
          )}
          CornerIndicator={() => <th />}
          onChange={data => {
            const fixedData = data.map((row, rowIndex) =>
              row.map((cell, cellIndex) =>
                cell === undefined
                  ? {
                      ...getData(initial[rowIndex], columns[cellIndex].value),
                      value: ""
                    }
                  : cell
              )
            );
            updateRef(fixedData);
            onChange(fixedData);
          }}
        />
        {columns.slice(0, -1).map((column, index) => (
          <ColumnResize
            key={`${column.value}-${column.width}`}
            offset={
              rowIndicatorWidth +
              columns.slice(0, index + 1).reduce((acc, v) => acc + v.width, 0) -
              Math.ceil(columnResizerWidth / 2)
            }
            onDrop={(_, data) => {
              setColumns(prevColumns =>
                prevColumns.map(pc =>
                  pc.value === column.value
                    ? { ...pc, width: pc.width + data.x }
                    : pc
                )
              );
            }}
          />
        ))}
      </div>
      <table className={classes.actions}>
        <tbody>
          <tr className={classes.actionRow}>
            <th>
              <ColumnPicker
                IconButtonProps={{
                  variant: "secondary"
                }}
                availableColumns={availableColumns}
                initialColumns={columns}
                defaultColumns={availableColumns.map(({ value }) => value)}
                onSave={columnNames =>
                  setColumns(prevColumns =>
                    columnNames.map(column => ({
                      ...availableColumns.find(c => c.value === column),
                      width:
                        prevColumns.find(pc => pc.value === column)?.width ??
                        200
                    }))
                  )
                }
                hasMore={false}
                loading={false}
                onFetchMore={() => undefined}
                onQueryChange={setQuery}
                query={query}
              />
            </th>
          </tr>
          {data.map((_, rowIndex) => (
            <tr key={rows[rowIndex]} className={classes.actionRow}>
              <td>
                <CardMenu
                  Icon={MoreHorizontalIcon}
                  menuItems={menuItems(rows[rowIndex])}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
Datagrid.displayName = "Datagrid";
export default Datagrid;
