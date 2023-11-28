
import React from "react";
import { GridColDef, GridValidRowModel, DataGridProps, GridInitialState, GridColumnsInitialState } from "@mui/x-data-grid";
import { GridBaseColDef } from "@mui/x-data-grid/models/colDef/gridColDef";

import { FilterBuilderInitialState, FilterBuilderProps } from "./FilterBuilder/models/FilterBuilderProps";
import { FieldDef } from "./FilterBuilder/models/fields";
import { ResponsiveValues } from "./hooks"
import { SerialisedGroup } from "../o-data-grid/src";

export type ODataGridBaseProps<
  ComponentProps extends DataGridProps,
  TDate,
  TInitialState extends GridInitialState,
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
    initialState?: ODataInitialState<TInitialState>,
    requestOptions?: RequestInit
  };

export type DataGridFilterBuilderProps<TDate> = Omit<FilterBuilderProps<TDate>, "schema" | "initialState">

// remove properties which should not be used - these are handled internally or overridden
type OmitGridProps<T> = Omit<T,
  "columns"
  | "rows"
  | "autoPageSize"
  | "columnVisibilityModel"
  | "disableColumnFilter"
  | "filterMode"
  | "filterModel"
  | "initialState"
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

type ODataColumnsInitialState = Omit<GridColumnsInitialState, "columnVisibilityModel"> & {
  columnVisibilityModel?: ODataColumnVisibilityModel
}

export type ODataInitialState<T extends GridInitialState> = Omit<T, "columns" | "filter"> & FilterBuilderInitialState & {
  columns?: ODataColumnsInitialState
}

export type ODataGridBaseColDef<C extends GridBaseColDef<R, V, F> = GridColDef, R extends GridValidRowModel = GridValidRowModel, V = any, F = any, TDate = any> = Omit<C, "filterOperators" | "sortComparator">
  & FieldDef<TDate>
  & {
    select?: string,
    expand?: Expand | Expand[],
    filterOnly?: boolean
  }

// type for rows when displayed in datagrid
// allows object to be flattened for convenience, but still allows strong typing
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

export type ODataColumnVisibilityModel = Record<string, boolean | ResponsiveValues<boolean>>;