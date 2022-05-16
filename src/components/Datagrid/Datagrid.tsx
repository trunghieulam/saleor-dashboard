import { MoreHorizontalIcon } from "@saleor/macaw-ui";
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

export interface DatagridProps<T> {
  availableColumns: Array<Record<"label" | "value", string>>;
  data: T[];
  getData: (row: T, column: string) => DatagridCell;
  menuItems: (row: DatagridCell[]) => CardMenuItem[];
}

export const Datagrid = <T,>({
  availableColumns,
  data: initial,
  getData,
  menuItems
}: DatagridProps<T>): React.ReactElement => {
  const classes = useStyles();

  const [columns, setColumns] = React.useState(
    availableColumns.map(c => ({
      ...c,
      width: 200
    }))
  );
  const [query, setQuery] = React.useState("");

  // May contain formulas
  const [data, setData] = React.useState<Matrix<DatagridCell>>([]);

  React.useEffect(() => {
    setData((initial ?? []).map(v => columns.map(c => getData(v, c.value))));
  }, [initial]);

  React.useEffect(() => {
    setData(prevData =>
      prevData.map(row => columns.map(c => row.find(f => f.column === c.value)))
    );
  }, [columns]);

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
          onChange={data => {
            setData(data);
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
          {data.map(row => (
            <tr className={classes.actionRow}>
              <td>
                <CardMenu
                  Icon={MoreHorizontalIcon}
                  menuItems={menuItems(row)}
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
