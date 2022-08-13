
import { ResponsiveValues } from "./hooks"
import { ExternalBuilderProps, FieldDef } from "./FilterBuilder/types"
import React from "react";

export type ODataGridBaseProps<
  ComponentProps extends IGridProps,
  SortModel extends IGridSortModel,
  ColDef,
  TRow,
  TDate
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
    defaultSortModel?: SortModel,
    disableFilterBuilder?: boolean,
    disableHistory?: boolean,
    $filter?: string,
    filterBuilderProps?: ExternalBuilderProps<TDate>,
    requestOptions?: RequestInit
  };

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

type ODataColumn<T, TDate> = Omit<T, "filterOperators" | "hide" | "sortComparator"> & FieldDef<TDate> & {
  select?: string,
  expand?: Expand | Expand[],
  hide?: ResponsiveValues<boolean> | boolean,
  filterOnly?: boolean
}

// type for rows when displayed in datagrid
// allows object to be flattened for convenience, but still allows strong typing through "result" property
export type ODataRowModel<T> = {
  result: T,
  [key: string]: any
}

export type ODataGridBaseColDef<ColDef, TDate> = ODataColumn<ColDef, TDate>
export type ODataGridBaseEnrichedColDef<ColDef, ActionsColDef, TDate> =
  | ODataColumn<ColDef, TDate>
  | ODataColumn<ActionsColDef, TDate>;

export type ODataBaseGridColumns<EnrichedColDef, ActionsColDef, TDate> = ODataGridBaseEnrichedColDef<EnrichedColDef, ActionsColDef, TDate>[]

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

export type ColumnVisibilityModel = Record<string, boolean>;

export type IGridSortModel = ({ field: string, sort: 'asc' | 'desc' | null | undefined })[];

export type IGridRowModel<T = { [key: string]: any }> = T;

export type IGridProps = {
  onColumnVisibilityModelChange?: any,
  columnVisibilityModel?: ColumnVisibilityModel,
  onSortModelChange?: any
}