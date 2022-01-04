
import { ResponsiveValues } from "./hooks"
import { ExternalBuilderProps, FieldDef } from "./FilterBuilder/types"
import React from "react";

export type ODataGridBaseProps<
  ComponentProps extends IGridProps,
  SortModel extends IGridSortModel,
  ColDef
> =
  OmitGridProps<ComponentProps>
  &
  {
    url: string,
    alwaysSelect?: string[],
    columns: ODataGridBaseColDef<ColDef>[],
    component: React.ElementType,
    defaultPageSize?: number,
    defaultSortModel?: SortModel,
    disableFilterBuilder?: boolean,
    disableHistory?: boolean,
    $filter?: string,
    filterBuilderProps?: ExternalBuilderProps,
    idField?: string,
  };

// remove properties which should not be used - these are handled internally
type OmitGridProps<T> = Omit<T,
  "columns"
  | "rows"
  | "autoPageSize"
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

export type ODataGridBaseColDef<ColDef> = Omit<ColDef, "filterOperators" | "hide" | "sortComparator"> & FieldDef & {
  select?: string,
  expand?: Expand,
  hide?: ResponsiveValues<boolean> | boolean,
  filterOnly?: boolean
}

export type ODataResponse = {
  "@odata.count"?: number,
  value: IGridRowModel[]
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

export type IGridSortModel = ({ field: string, sort: 'asc' | 'desc' | null | undefined })[];

export type IGridRowModel<T = { [key: string]: any }> = T;

export type IGridProps = {
  onColumnVisibilityChange?: any,
  onSortModelChange?: any
}