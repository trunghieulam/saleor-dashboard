import { MoreHorizontalIcon } from "@saleor/macaw-ui";
import React from "react";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";

import CardMenu, { CardMenuItem } from "../CardMenu";
import ColumnPicker from "../ColumnPicker";
import useStyles from "./styles";

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

const Column: React.FC<React.DetailedHTMLProps<
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>,
  HTMLTableHeaderCellElement
>> = ({ onDrop, ...rest }) => {
  const [dragOver, setDragOver] = React.useState(false);

  return (
    <th
      onDragStart={e => {
        e.dataTransfer.setData("text/plain", rest["data-column"]);
      }}
      onDragEnter={() => {
        setDragOver(true);
      }}
      onDragLeave={() => {
        setDragOver(false);
      }}
      onDrop={e => {
        e.preventDefault();
        if (onDrop) {
          onDrop(e);
        }
        setDragOver(false);
      }}
      style={dragOver ? { borderRight: `1px solid red` } : {}}
      {...rest}
    />
  );
};

export const Datagrid = <T,>({
  availableColumns,
  data: initial,
  getData,
  menuItems
}: DatagridProps<T>): React.ReactElement => {
  const classes = useStyles();

  const [columns, setColumns] = React.useState(availableColumns);

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
      <Spreadsheet
        data={data}
        columnLabels={columns.map(c => c.label)}
        className={classes.spreadsheet}
        Table={({ children }) => (
          <table className={classes.table}>
            <colgroup>
              <col style={{ width: 80 }} />
              {columns.map(({ value }) => (
                <col key={value} style={{ width: 200 }} />
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
      <table className={classes.actions}>
        <tbody>
          <tr className={classes.actionRow}>
            <th>
              <ColumnPicker
                IconButtonProps={{
                  variant: "secondary"
                }}
                availableColumns={availableColumns}
                initialColumns={availableColumns}
                defaultColumns={["name", "sku", "margin"]}
                onSave={columnNames =>
                  setColumns(
                    columnNames.map(column =>
                      availableColumns.find(c => c.value === column)
                    )
                  )
                }
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
