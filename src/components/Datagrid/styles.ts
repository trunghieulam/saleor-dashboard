import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles(
  theme => ({
    table: {
      borderCollapse: "collapse",
      border: "none",
      tableLayout: "fixed",
      width: "100%"
    },
    tableWrapper: {
      "& th": {
        fontWeight: 400,
        textAlign: "left"
      },
      "& .Spreadsheet__cell": {
        height: 48
      },
      "& .Spreadsheet__active-cell": {
        "& input": {
          letterSpacing: "inherit"
        },
        fontWeight: 500
      },
      "& .Spreadsheet__active-cell, .Spreadsheet__floating-rect--selected": {
        borderWidth: 1
      },
      "--background-color": "var(--background-default)",
      "--text-color": "inherit",
      "--border-color": theme.palette.saleor.main[5],
      "--outline-background-color": "rgba(0,0,0,.05)",
      "--outline-color": theme.palette.saleor.main[1],
      "--elevation": "none",
      fontWeight: 500,
      overflowX: "scroll",
      width: "100%"
    }
  }),
  { name: "Datagrid" }
);

export default useStyles;
