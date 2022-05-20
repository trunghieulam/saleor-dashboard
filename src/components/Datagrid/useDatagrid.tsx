import { useCallback, useEffect, useRef, useState } from "react";
import { Matrix } from "react-spreadsheet";

import { MoneyCellEdit, MoneyCellView } from "./MoneyCell";
import { MoneyToggleCellView } from "./MoneyToggleCell";
import { NumberCellEdit } from "./NumberCell";
import { AvailableColumn, ColumnState, DatagridCell } from "./types";

function getId(row: DatagridCell[]): string {
  return row[0].id;
}

export interface UseDatagridOpts<T> {
  availableColumns: AvailableColumn[];
  data: T[];
  getData: (row: T, column: string) => DatagridCell;
  onChange: (data: Matrix<DatagridCell>) => void;
}

function useDatagrid<T extends { id: string }>({
  availableColumns,
  data: initial,
  getData,
  onChange: onChangeBase
}: UseDatagridOpts<T>) {
  const [columns, setColumns] = useState<ColumnState[]>(
    availableColumns.map(c => ({
      ...c,
      width: 200
    }))
  );
  const [rows, setRows] = useState<string[]>(initial.map(d => d.id));

  // May contain formulas
  const [data, setData] = useState<Matrix<DatagridCell>>([]);
  const dataRef = useRef<Matrix<DatagridCell>>(data);
  const updateRef = (d: Matrix<DatagridCell>) => {
    dataRef.current = d;
  };

  useEffect(() => {
    const newData = initial.map(v =>
      columns.map<DatagridCell>(c => ({
        ...getData(v, c.value),
        DataViewer:
          c.type === "money"
            ? MoneyCellView
            : c.type === "moneyToggle"
            ? MoneyToggleCellView
            : undefined,
        DataEditor: ["money", "moneyToggle"].includes(c.type)
          ? MoneyCellEdit
          : c.type === "number"
          ? NumberCellEdit
          : undefined
      }))
    );
    setRows(initial.map(d => d.id));
    setData(newData);
    updateRef(newData);
  }, [initial]);

  useEffect(() => {
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

  const onChange = useCallback(
    (data: Matrix<DatagridCell>) => {
      const fixedData = data.map((row, rowIndex) =>
        row.map((cell, cellIndex) =>
          cell === undefined
            ? {
                ...getData(initial[rowIndex], columns[cellIndex].value),
                ...(cell.type === "moneyToggle" ? { toggled: false } : {}),
                value: ""
              }
            : cell
        )
      );
      updateRef(fixedData);
      onChangeBase(fixedData);
    },
    [getData, initial, columns]
  );

  const onColumnChange = useCallback(
    (columnNames: string[]) =>
      setColumns(prevColumns =>
        columnNames.map(column => ({
          ...availableColumns.find(c => c.value === column),
          width: prevColumns.find(pc => pc.value === column)?.width ?? 200
        }))
      ),
    [setColumns]
  );

  const onColumnMove = useCallback(
    (columnIndex, targetIndex) =>
      setColumns(columns => {
        const c = [...columns];
        const r = c.splice(targetIndex, 1)[0];
        c.splice(columnIndex, 0, r);

        return c;
      }),
    [setColumns]
  );

  const onColumnResize = useCallback(
    (column: ColumnState, move: number) =>
      setColumns(prevColumns =>
        prevColumns.map(pc =>
          pc.value === column.value ? { ...pc, width: pc.width + move } : pc
        )
      ),
    [setColumns]
  );

  return {
    columns,
    data,
    rows,
    setRows,
    onChange,
    onColumnChange,
    onColumnMove,
    onColumnResize
  };
}

export default useDatagrid;
