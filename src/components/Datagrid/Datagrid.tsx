import { MoreHorizontalIcon } from "@saleor/macaw-ui";
import React from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";

import CardMenu, { CardMenuItem } from "../CardMenu";
import ColumnPicker from "../ColumnPicker";
import useStyles, { rowIndicatorWidth } from "./styles";

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
      onDragOver={e => {
        e.preventDefault();
      }}
      style={dragOver ? { borderRight: `1px solid red` } : {}}
      {...rest}
    />
  );
};

const ColumnMove: React.FC<{
  offset: number;
  onDrop: DraggableEventHandler;
}> = ({ offset, onDrop }) => {
  const [drag, setDrag] = React.useState(false);

  return (
    <Draggable
      axis="x"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrag={() => {
        setDrag(true);
      }}
      onStop={(event, data) => {
        setDrag(false);
        onDrop(event, data);
      }}
    >
      <div
        style={{
          background: drag ? "red" : "transparent",
          cursor: "e-resize",
          width: 3,
          height: "100%",
          position: "absolute",
          top: 0,
          left: offset
        }}
      />
    </Draggable>
  );
};

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
          <ColumnMove
            key={`${column.value}-${column.width}`}
            offset={
              rowIndicatorWidth +
              columns.slice(0, index + 1).reduce((acc, v) => acc + v.width, 0) -
              1
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
