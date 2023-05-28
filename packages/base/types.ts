
import React from "react";
import { GridColDef, DataGridProps } from "@mui/x-data-grid";

import { FilterBuilderProps } from "./FilterBuilder/models/FilterBuilderProps";
import { FieldDef } from "./FilterBuilder/models/fields";
import { ResponsiveValues } from "./hooks"

export type ODataGridBaseProps<
  ComponentProps extends DataGridProps,
  TDate
> =
  OmitGridProps<ComponentProps>
  &
  {
    url: string,
    alwaysSelect?: string[],
    columns: ODataGridBaseColDef<TDate>[],
    columnVisibilityModel?: ODataColumnVisibilityModel,
    component: React.ElementType,
    disableFilterBuilder?: boolean,
    disableHistory?: boolean,
    $filter?: string,
    filterBuilderProps?: DataGridFilterBuilderProps<TDate>,
    requestOptions?: RequestInit
  };

export type DataGridFilterBuilderProps<TDate> = Omit<FilterBuilderProps<TDate>, "schema">

// remove properties which should not be used - these are handled internally or overridden
type OmitGridProps<T> = Omit<T,
  "columns"
  | "rows"
  | "autoPageSize"
  | "columnVisibilityModel"
  | "disableColumnFilter"
  | "filterMode"
  | "filterModel"
  | "loading"
  | "onFilterModelChange"
  | "onPageChange"
  | "onPageSizeChange"
  | "page"
  | "pageSize"
  | "paginationMode"
  | "rowCount"
  | "sortingMode"
  | "sortModel"
  >

export type ODataGridBaseColDef<TDate> = Omit<GridColDef, "filterOperators" | "sortComparator"> & FieldDef<TDate> & {
  select?: string,
  expand?: Expand | Expand[],
  filterOnly?: boolean
}

// type for rows when displayed in datagrid
// allows object to be flattened for convenience, but still allows strong typing through "result" property
export type ODataRowModel<T> = {
  result: T,
  [key: string]: any
}

export type ODataResponse<T> = {
  "@odata.count"?: number,
  value: T[]
}

export type Expand = {
  navigationField: string,
  select?: string,
  expand?: Expand[] | Expand,
  orderBy?: string,
  top?: number,
  count?: boolean
}

export type ValueOption = string | number | SelectOption;

export type SelectOption = {
  value: any,
  label: string
}

export type ODataColumnVisibilityModel = Record<string, boolean | ResponsiveValues<boolean>>;