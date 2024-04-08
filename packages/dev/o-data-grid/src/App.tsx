import React, { useEffect, useRef } from "react"
import { Button, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { GridActionsCellItem } from "@mui/x-data-grid"
import { ODataGrid, ODataColumnVisibilityModel, escapeODataString, ODataGridColDef, ODataGridInitialState, useODataGridApiRef, SerialisedGroup } from "../../../o-data-grid/src"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { Edit } from "@mui/icons-material";
import { DataGridFilterBuilderProps } from "../../../base/models";

const theme = createTheme({
  palette: {
    mode: "dark"
  }
})

const getRowId = (row: any) => row.Id;

const columnVisibility: ODataColumnVisibilityModel = {
  "Customer/EmailAddress": { xs: false, md: true }
}

const test: SerialisedGroup = {
  connective: "and",
  negated: false,
  children: [
    {
      field: "Customer/Name",
      op: "contains",
      value: "ga"
    }
  ]
};

const App = () => {
  const apiRef = useODataGridApiRef();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.debug("attaching event");
    return apiRef.current.onFilterChange.on((args) => console.debug(args));
  }, [apiRef]);

  useEffect(() => console.debug("ref", ref), [ref]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ODataGrid
        url="https://api.o-data-grid.jtattersall.net/order"
        columns={columns}
        filterBuilderProps={filterBuilderProps}
        alwaysSelect={alwaysFetch}
        getRowId={getRowId}
        pageSizeOptions={pageSizeOptions}
        initialState={initialState}
        apiRef={apiRef}
        ref={ref}
      />
      <Button onClick={() => apiRef.current.setFilter(test)}>Set Filter</Button>
    </ThemeProvider>
  );
}
const initialState: ODataGridInitialState = {
  pagination: {
    paginationModel: {
      pageSize: 10
    }
  },
  sorting: {
    sortModel: [{ field: "Date", sort: "desc" }]
  },
  columns: {
    columnVisibilityModel: columnVisibility
  },
  filterBuilder: {
    filterModel: {
      connective: "and",
      negated: false,
      children: [
        {
          field: "Customer/Name",
          op: "contains",
          value: "g"
        }
      ]
    }
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
      const safeValue = escapeODataString(value as string)?.toLowerCase();
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
    field: "TotalNoVat",
    headerName: "Total (ex VAT)",
    type: "number",
    compute: "Total div 1.2 as TotalNoVat",
    autocompleteGroup: "Order"
  },
  {
    field: "HasMiddleName",
    headerName: "Has Middle Name",
    compute: "Customer/MiddleNames ne null and Customer/MiddleNames ne '' as HasMiddleName",
    filterType: "boolean",
    filterOperators: ["eq"],
    valueGetter: (params) => params.row.HasMiddleName ? "Yes" : "No",
    autocompleteGroup: "Customer"
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

export default App;