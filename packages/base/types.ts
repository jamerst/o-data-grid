
import { FilterBuilderProps } from "./FilterBuilder/models/FilterBuilderProps";
import { FieldDef } from "./FilterBuilder/models/fields";
import { ResponsiveValues } from "./hooks"
import React from "react";

export type ODataGridBaseProps<
  ComponentProps extends IGridProps<TColumnVisibilityModel, TPaginationModel, TSortModel>,
  ColDef,
  TDate,
  TColumnVisibilityModel extends IGridColumnVisibilityModel,
  TPaginationModel extends IGridPaginationModel,
  TSortModel extends IGridSortModel
> =
  OmitGridProps<ComponentProps>
  &
  {
    url: string,
    alwaysSelect?: string[],
    columns: ODataGridBaseColDef<ColDef, TDate>[],
    columnVisibilityModel?: ODataColumnVisibilityModel,
    component: React.ElementType,
    defaultPageSize?: number,
    defaultSortModel?: TSortModel,
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

export type ODataGridBaseColDef<T, TDate> = Omit<T, "filterOperators" | "sortComparator"> & FieldDef<TDate> & {
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

export type IGridColumnVisibilityModel = Record<string, boolean>;

export type IGridSortModel = ({ field: string, sort: 'asc' | 'desc' | null | undefined })[];

export type IGridRowModel<T = { [key: string]: any }> = T;

export type IGridPaginationModel = {
  pageSize: number,
  page: number
}

export type IGridProps<TColumnVisibilityModel extends IGridColumnVisibilityModel,
  TPaginationModel extends IGridPaginationModel,
  TSortModel extends IGridSortModel
> =
  {
    columnVisibilityModel?: TColumnVisibilityModel,
    onColumnVisibilityModelChange?: (model: TColumnVisibilityModel, details: any) => void,
    // I have absolutely no idea why, but TypeScript refuses to work if I try typing the details parameter.
    // I'm fed up of trying to work out why, but it somehow finds a signature which uses unknown as the type instead of
    // the generic. I can't even begin to understand why, but it does. I don't care any more, we don't even touch the
    // details parameter.

    paginationModel?: TPaginationModel,
    onPaginationModelChange?: (model: TPaginationModel, details: any) => void

    onSortModelChange?: (model: TSortModel, details: any) => void
  }