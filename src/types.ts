
import { DataGridProps, GridSortModel, GridColDef, GridRowModel, GridInputComponentProps } from "@mui/x-data-grid"
import { DataGridProProps } from "@mui/x-data-grid-pro"
import { ResponsiveValues } from "hooks"
import { ExternalBuilderProps, FieldDef } from "FilterBuilder/types"
import React from "react";

export type ODataGridProps = ODataGridBaseProps<DataGridProps>;
export type ODataGridProProps = ODataGridBaseProps<DataGridProProps>;

export type ODataGridBaseProps<T> =
  removeProps<T>
  &
  {
    url: string,
    queryParams?: [string, string | undefined][],
    columns: ODataGridColDef[],
    idField?: string,
    alwaysFetch?: string[],
    $filter?: string,
    defaultSortModel?: GridSortModel,
    disableFilterBuilder?: boolean,
    filterBuilderProps?: ExternalBuilderProps,
    defaultPageSize?: number,
    disableHistory?: boolean,
    component: React.ElementType
  };

// remove properties which should not be used - these are handled internally
type removeProps<T> = Omit<T,
  "columns"
  | "rows"
  | "rowCount"
  | "pagination"
  | "paginationMode"
  | "page"
  | "pageSize"
  | "onPageChange"
  | "onPageSizeChange"
  | "loading"
  | "sortingMode"
  | "sortModel"
  | "disableColumnFilter"
  | "onFilterModelChange"
>

export type ODataGridColDef = Omit<GridColDef, "hide" | "filterOperators" | "sortComparator"> & FieldDef & {
  select?: string,
  expand?: Expand,
  hide?: ResponsiveValues<boolean> | boolean,
  filterOnly?: boolean
}

export type ODataResponse = {
  "@odata.count"?: number,
  value: GridRowModel[]
}

export type Expand = {
  navigationField: string,
  select?: string,
  expand?: Expand,
  orderBy?: string,
  top?: number,
  count?: boolean
}

export type ValueOption = string | number | SelectOption;

export type SelectOption = {
  value: any,
  label: string
}