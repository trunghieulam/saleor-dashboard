import { useCallback, useEffect, useRef, useState } from "react";
import { CellBase, Matrix } from "react-spreadsheet";

export interface DatagridCell extends CellBase<string> {
  column: string;
  id: string;
}

function getId(row: DatagridCell[]): string {
  return row[0].id;
}

export interface UseDatagridOpts<T> {
  availableColumns: Array<Record<"label" | "value", string>>;
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
  const [columns, setColumns] = useState(
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
    const newData = initial.map(v => columns.map(c => getData(v, c.value)));
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
    data => {
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
      onChangeBase(fixedData);
    },
    [getData, initial, columns]
  );

  const onColumnChange = useCallback(
    columnNames =>
      setColumns(prevColumns =>
        columnNames.map(column => ({
          ...availableColumns.find(c => c.value === column),
          width: prevColumns.find(pc => pc.value === column)?.width ?? 200
        }))
      ),
    [setColumns]
  );

  return {
    columns,
    setColumns,
    data,
    rows,
    setRows,
    onChange,
    onColumnChange
  };
}

export default useDatagrid;
