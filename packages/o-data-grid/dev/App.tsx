import React from "react"
import { CssBaseline, Typography, Grid, TextField, Slider, Chip } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { GridSortModel } from "@mui/x-data-grid"
import { ODataGridColDef, ODataColumnVisibilityModel, escapeODataString } from "../src/index";
import ODataGrid from "../src/ODataGrid";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const theme = createTheme({
  palette: {
    mode: "dark"
  }
})

export const muiCache = createCache({
  key: "mui",
  prepend: true
});

const App = () => {
  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ODataGrid
          url="http://0.0.0.0:5000/api/odata/job"
          columns={columns}
          columnVisibilityModel={columnVisibility}
          getRowId={(row) => row.Id}
          defaultSortModel={defaultSort}
          filterBuilderProps={filterBuilderProps}
          alwaysSelect={alwaysFetch}
        />
      </ThemeProvider>
    </CacheProvider>
  );
}

type LocationFilter = {
  location?: string,
  distance?: number
}

const filterBuilderProps = { autocompleteGroups: ["Job", "Company"] };

const alwaysFetch = ["Id", "Archived"];
const columns: ODataGridColDef[] = [
  {
    field: "Title",
    headerName: "Job Title",
    flex: 2,
    autocompleteGroup: "Job"
  },
  {
    field: "Location",
    headerName: "Location",
    flex: 1,
    renderCustomFilter: (value, setValue) => (
      <Grid item container xs={12} md spacing={1}>
        <Grid item xs={12} md>
          <TextField
            value={(value as LocationFilter)?.location ?? ""}
            onChange={(e) => setValue({ ...value, location: e.target.value })}
            size="small"
            fullWidth
            label="Search Location"
            required
          />
        </Grid>
        <Grid item xs={12} md>
          <Typography variant="body2">Distance</Typography>
          <Slider
            value={(value as LocationFilter)?.distance ?? 15}
            onChange={(_, val) => setValue({ ...value, distance: val as number })}
            step={5}
            min={0}
            max={50}
            valueLabelFormat={(val) => `${val}mi`}
            valueLabelDisplay="auto"
            size="small"
            sx={{padding: 0}}
          />
        </Grid>
      </Grid>
    ),
    getCustomFilterString: (_, v) => {
      const filter = v as LocationFilter;
      return {
        filter: `Latitude ne null and Longitude ne null and Distance le ${filter.distance ?? 15}`,
        compute: {
          compute: `geocode('${escapeODataString(filter.location ?? "")}', Latitude, Longitude) as Distance`,
          select: ["Distance"]
        }
      };
    },
    valueGetter: (params) => `${params.row.Location}${params.row.Distance ? ` (${params.row.Distance.toFixed(1)} mi away)` : ""}`,
    autocompleteGroup: "Job"
  },
  {
    field: "Company/Name",
    headerName: "Company",
    flex: 2,
    renderCell: (params) => (
      <Grid container spacing={1} alignItems="center" wrap="nowrap">
        <Grid item>
          {params.value}
        </Grid>
        {params.row["Company/Recruiter"] && <Grid item><Chip sx={{ cursor: "pointer" }} label="Recruiter" size="small" /></Grid>}
        {params.row["Company/Blacklisted"] && <Grid item><Chip sx={{ cursor: "pointer" }} label="Blacklisted" size="small" color="error" /></Grid>}
      </Grid>
    ),
    expand: { navigationField: "Company", select: "Id,Name,Recruiter,Blacklisted,Watched" },
    autocompleteGroup: "Company"
  },
  {
    field: "Salary",
    type: "number",
    filterField: "AvgYearlySalary",
    sortField: "AvgYearlySalary",
    label: "Median Annual Salary",
    filterType: "number",
    filterOperators: ["eq", "ne", "gt", "lt", "ge", "le", "null", "notnull"],
    flex: 1,
    autocompleteGroup: "Job"
  },
  {
    field: "Status",
    type: "singleSelect",
    valueOptions: ["Not Applied", "Awaiting Response", "In Progress", "Rejected", "Dropped Out"],
    filterOperators: ["eq", "ne"],
    autocompleteGroup: "Job"
  },
  {
    field: "JobCategories",
    headerName: "Categories",
    label: "Category",
    expand: {
      navigationField: "JobCategories/Category",
      select: "Name"
    },
    sortable: false,
    filterable: false,
    flex: 1,
    renderCell: (params) => params.row.JobCategories.map((c: any) => c["Category/Name"]).join(", "),
    autocompleteGroup: "Job"
  },
  {
    field: "Source/DisplayName",
    expand: { navigationField: "Source", select: "DisplayName" },
    headerName: "Source",
    filterable: false,
    sortable: false,
    flex: 1,
    valueGetter: (params) => params.row[params.field] ? params.row[params.field] : "Added Manually",
    autocompleteGroup: "Job"
  },
  {
    field: "Posted",
    select: "Posted,Seen,Archived",
    headerName: "Posted",
    type: "date",
    flex: .9,
    autocompleteGroup: "Job"
  },

  // filter only
  {
    field: "Company/Recruiter",
    label: "Company Type",
    filterOnly: true,
    filterOperators: ["eq", "ne"],
    type: "singleSelect",
    valueOptions: [
      { label: "Employer", value: false },
      { label: "Recruiter", value: true }
    ],
    autocompleteGroup: "Company"
  },
  {
    field: "Company/Watched",
    label: "Company Watched",
    filterOnly: true,
    filterOperators: ["eq", "ne"],
    type: "boolean",
    autocompleteGroup: "Company"
  },
  {
    field: "Company/Blacklisted",
    label: "Company Blacklisted",
    filterOnly: true,
    filterOperators: ["eq", "ne"],
    type: "boolean",
    autocompleteGroup: "Company"
  },
  {
    field: "Description",
    filterOnly: true,
    filterOperators: ["contains"],
    autocompleteGroup: "Job"
  },
  {
    field: "Notes",
    filterOnly: true,
    filterOperators: ["contains"],
    autocompleteGroup: "Job"
  }
];

const columnVisibility: ODataColumnVisibilityModel = {
  "Company/Name": { xs: false, md: true },
  "Salary": { xs: false, lg: true },
  "Status": false,
  "JobCategories": { xs: false, xl: true },
  "Source/DisplayName": true,
  "Posted": { xs: false, sm: true },
}

const defaultSort: GridSortModel = [{ field: "Posted", sort: "desc" }];

export default App;