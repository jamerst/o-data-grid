import React from "react"
import { CssBaseline, Typography, Grid, TextField, Slider, Chip } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { GridActionsCellItem, GridSortModel } from "@mui/x-data-grid"
import { ODataColumnVisibilityModel, escapeODataString, ODataGridColumns } from "../src/index";
import ODataGrid from "../src/ODataGrid";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { ExternalBuilderProps } from "../../base/FilterBuilder/types";

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


type Job = {
  id: number,
  title: string,
  description: string,
  salary?: string,
  avgYearlySalary?: number,
  location: string,
  latitude?: number,
  longitude?: number,
  url?: string,
  companyId?: number,
  posted: string,
  notes: string,
  seen: boolean,
  archived: boolean,
  status: string,
  dateApplied: string,
  provider?: string,
  providerId?: string,
  sourceId?: number,
  duplicateJobId?: number,
  actualCompanyId?: number,

  company: Company,
  jobCategories: JobCategory[],
}

type Company = {
  id: number,
  name: string,
  location: string,
  latitude?: number,
  longitude?: number,
  notes?: string,
  watched: boolean,
  blacklisted: boolean,
  website?: string,
  rating?: number,
  glassdoor?: string,
  linkedIn?: string,
  endole?: string,
  recruiter: boolean
}

type JobCategory = {
  jobId: number,
  categoryId: number,
  category: Category
}

type Category = {
  id: number,
  name: string
}


const filterBuilderProps: ExternalBuilderProps<Dayjs> = { autocompleteGroups: ["Job", "Company"], localizationProviderProps: { dateAdapter: AdapterDayjs } };

const alwaysFetch = ["Id", "Archived"];
const columns: ODataGridColumns<Job> = [
  {
    field: "title",
    headerName: "Job Title",
    flex: 2,
    autocompleteGroup: "Job"
  },
  {
    field: "location",
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
    valueGetter: (params) => `${params.row["location"]}${params.row["distance"] ? ` (${params.row["distance"].toFixed(1)} mi away)` : ""}`,
    autocompleteGroup: "Job"
  },
  {
    field: "company/name",
    headerName: "Company",
    flex: 2,
    renderCell: (params) => (
      <Grid container spacing={1} alignItems="center" wrap="nowrap">
        <Grid item>
          {params.value}
        </Grid>
        {params.row["company/recruiter"] && <Grid item><Chip sx={{ cursor: "pointer" }} label="Recruiter" size="small" /></Grid>}
        {params.row.result.company?.blacklisted && <Grid item><Chip sx={{ cursor: "pointer" }} label="Blacklisted" size="small" color="error" /></Grid>}
      </Grid>
    ),
    expand: { navigationField: "company", select: "id,name,recruiter,blacklisted,watched" },
    autocompleteGroup: "Company"
  },
  {
    field: "salary",
    headerName: "Salary",
    type: "number",
    filterField: "avgYearlySalary",
    sortField: "avgYearlySalary",
    label: "Median Annual Salary",
    filterType: "number",
    filterOperators: ["eq", "ne", "gt", "lt", "ge", "le", "null", "notnull"],
    flex: 1,
    autocompleteGroup: "Job"
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: ["Not Applied", "Awaiting Response", "In Progress", "Rejected", "Dropped Out"],
    filterOperators: ["eq", "ne"],
    autocompleteGroup: "Job"
  },
  {
    field: "jobCategories",
    headerName: "Categories",
    label: "Category",
    expand: {
      navigationField: "jobCategories",
      expand: {
        navigationField: "category",
        select: "name",
        expand: [
          {
            navigationField: "companyCategories",
            count: true
          },
          {
            navigationField: "companyCategories",
            count: true
          },
          {
            navigationField: "jobCategories",
            count: true
          },
        ]
      }
    },
    sortable: false,
    filterable: false,
    flex: 1,
    renderCell: (params) => params.row.result.jobCategories.map((c) => c.category.name).join(", "),
    autocompleteGroup: "Job"
  },
  // {
  //   field: "source/displayName",
  //   expand: { navigationField: "source", select: "displayName" },
  //   headerName: "Source",
  //   filterable: false,
  //   sortable: false,
  //   flex: 1,
  //   valueGetter: (params) => params.row[params.field] ? params.row[params.field] : "Added Manually",
  //   autocompleteGroup: "Job"
  // },
  {
    field: "posted",
    select: "posted,seen,archived",
    headerName: "Posted",
    type: "date",
    flex: .9,
    autocompleteGroup: "Job"
  },
  {
    field: "actions",
    type: "actions",
    getActions: (params) => [
      <GridActionsCellItem label="Test" showInMenu onClick={() => console.log(params)} />
    ]
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