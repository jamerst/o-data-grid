
import React from "react";
import { GridColDef, GridValidRowModel, DataGridProps } from "@mui/x-data-grid";
import { GridBaseColDef } from "@mui/x-data-grid/models/colDef/gridColDef";

import { FilterBuilderProps } from "./FilterBuilder/models/FilterBuilderProps";
import { FieldDef } from "./FilterBuilder/models/fields";
import { ResponsiveValues } from "./hooks"

export type ODataGridBaseProps<
  ComponentProps extends DataGridProps,
  TDate,
  R extends GridValidRowModel = any,
> =
  OmitGridProps<ComponentProps>
  &
  {
    url: string,
    alwaysSelect?: string[],
    columns: ODataGridBaseColDef<GridColDef, R, any, any, TDate>[],
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

export type ODataGridBaseColDef<C extends GridBaseColDef<R, V, F> = GridColDef, R extends GridValidRowModel = GridValidRowModel, V = any, F = any, TDate = any> = Omit<C, "filterOperators" | "sortComparator">
  & FieldDef<TDate>
  & {
    select?: string,
    expand?: Expand | Expand[],
    filterOnly?: boolean
  }

// type for rows when displayed in datagrid
// allows object to be flattened for convenience, but still allows strong typing through "result" property
export type ODataRowModel<T> = Record<string, any> & T;

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