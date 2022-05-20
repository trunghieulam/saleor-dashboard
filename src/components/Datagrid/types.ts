import { CellBase } from "react-spreadsheet";

interface DatagridCellBase extends CellBase<string> {
  column: string;
  id: string;
}

export interface StringDatagridCell extends DatagridCellBase {
  type: "string";
}

export interface MoneyDatagridCell extends DatagridCellBase {
  currency: string;
  type: "money";
}

export interface MoneyToggleDatagridCell extends DatagridCellBase {
  currency: string;
  toggled: boolean;
  type: "moneyToggle";
}

export type DatagridCell =
  | StringDatagridCell
  | MoneyDatagridCell
  | MoneyToggleDatagridCell;

export type AvailableColumn = Record<"label" | "value", string> & {
  type: DatagridCell["type"];
};
export interface ColumnState extends AvailableColumn {
  width: number;
}
