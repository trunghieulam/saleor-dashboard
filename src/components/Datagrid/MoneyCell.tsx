import React from "react";
import { DataEditorComponent, DataViewerComponent } from "react-spreadsheet";

import Money from "../Money";
import { usePriceField } from "../PriceField/usePriceField";
import { MoneyDatagridCell } from "./useDatagrid";

export const MoneyCellView: DataViewerComponent<MoneyDatagridCell> = ({
  cell
}) =>
  cell.value ? (
    <Money
      money={{
        amount: parseFloat(cell.value),
        currency: cell.currency
      }}
    />
  ) : (
    <span>-</span>
  );

export const MoneyCellEdit: DataEditorComponent<MoneyDatagridCell> = ({
  onChange: onChangeBase,
  cell
}) => {
  const { onChange, onKeyDown, minValue, step } = usePriceField(
    cell.currency,
    event => {
      onChangeBase({ ...cell, value: event.target.value });
    }
  );

  const value = cell?.value ?? "";

  return (
    <div className="Spreadsheet__data-editor">
      <input
        type="number"
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
        min={minValue}
        step={step}
        autoFocus
      />
    </div>
  );
};
