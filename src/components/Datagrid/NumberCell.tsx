import { FormChange } from "@saleor/hooks/useForm";
import React from "react";
import { DataEditorComponent, DataViewerComponent } from "react-spreadsheet";

import { NumberDatagridCell } from "./types";

export const NumberCellView: DataViewerComponent<NumberDatagridCell> = ({
  cell
}) => <span>{cell.value ?? "-"}</span>;

export const NumberCellEdit: DataEditorComponent<NumberDatagridCell> = ({
  onChange: onChangeBase,
  cell
}) => {
  const onChange: FormChange = event => {
    onChangeBase({ ...cell, value: event.target.value });
  };
  const value = cell?.value ?? "";

  return (
    <div className="Spreadsheet__data-editor">
      <input
        type="number"
        onChange={onChange}
        value={value}
        min={cell.min}
        max={cell.max}
        step={cell.step}
        autoFocus
      />
    </div>
  );
};
