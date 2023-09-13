import React from "react"
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { GridActionsCellItem, GridSortModel, useGridApiRef, GridActionsColDef, GridInitialState } from "@mui/x-data-grid"
import { ODataGrid, ODataColumnVisibilityModel, escapeODataString, FilterBuilderProps, ODataGridColDef } from "../../../o-data-grid/src"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { Edit } from "@mui/icons-material";
import { DataGridFilterBuilderProps } from "../../../base/types";

const theme = createTheme({
  palette: {
    mode: "dark"
  }
})

const getRowId = (row: any) => row.Id;

const App = () => {
  // const apiRef = useGridApiRef();
  // if (typeof apiRef.current.getRowsCount === "function") {
  //   console.debug("gridApiRef", apiRef.current.getRowsCount());
  // }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ODataGrid
        url="https://api.o-data-grid.jtattersall.net/order"
        columns={columns}
        columnVisibilityModel={columnVisibility}
        // defaultSortModel={defaultSort}
        filterBuilderProps={filterBuilderProps}
        alwaysSelect={alwaysFetch}
        getRowId={getRowId}
        pageSizeOptions={pageSizeOptions}
        initialState={initialState}
        // apiRef={apiRef}
      />
    </ThemeProvider>
  );
}
const initialState: GridInitialState = {
  pagination: {
    paginationModel: {
      pageSize: 10
    }
  },
  sorting: {
    sortModel: [{ field: "Date", sort: "desc" }]
  }
}
const pageSizeOptions = [10, 25, 50, 100];

const filterBuilderProps: DataGridFilterBuilderProps<Dayjs> = { autocompleteGroups: ["Customer", "Order"], localizationProviderProps: { dateAdapter: AdapterDayjs } };

const alwaysFetch = ["Id"];
const columns: ODataGridColDef[] = [
  {
    field: "Customer/Name",
    headerName: "Name",
    expand: {
      navigationField: "Customer",
      select: "FirstName,MiddleNames,Surname"
    },
    sortField: "Customer/Surname",
    flex: 2,
    autocompleteGroup: "Customer",
    filterOperators: ["eq", "ne", "contains"],
    getCustomFilterString: (op, value) => {
      const safeValue = escapeODataString(value)?.toLowerCase();
      return op === "contains"
        ? `contains(tolower(Customer/FirstName), '${safeValue}') or contains(tolower(Customer/MiddleNames), '${safeValue}') or contains(tolower(Customer/Surname), '${safeValue}')`
        : `tolower(Customer/FirstName) ${op} '${safeValue}' or tolower(Customer/MiddleNames) ${op} '${safeValue}' or tolower(Customer/Surname) ${op} '${safeValue}'`
    },
    valueGetter: (params) => [params.row.Customer.FirstName, params.row.Customer.MiddleNames, params.row.Customer.Surname]
      .filter(n => n)
      .join(" ")
  },
  {
    field: "Customer/EmailAddress",
    headerName: "Email Address",
    expand: {
      navigationField: "Customer",
      select: "EmailAddress"
    },
    flex: 2,
    autocompleteGroup: "Customer",
  },
  {
    field: "Date",
    type: "datetime",
    flex: .9,
    autocompleteGroup: "Order",
    valueGetter: (params) => new Date(params.value)
  },
  {
    field: "Total",
    type: "number",
    autocompleteGroup: "Order",
  },
  {
    field: "actions",
    type: "actions",
    flex: .7,
    getActions: (params) => [
      <GridActionsCellItem label="Edit" icon={<Edit/>} onClick={() => console.log(params.id)} key="Action1"/>
    ],
  }
];

const columnVisibility: ODataColumnVisibilityModel = {
  "Customer/EmailAddress": { xs: false, md: true }
}

export default App;