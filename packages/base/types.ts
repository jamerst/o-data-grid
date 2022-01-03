
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
    queryParams?: [string, string | undefined][],
    columns: ODataGridBaseColDef<ColDef>[],
    idField?: string,
    alwaysFetch?: string[],
    $filter?: string,
    defaultSortModel?: SortModel,
    disableFilterBuilder?: boolean,
    filterBuilderProps?: ExternalBuilderProps,
    defaultPageSize?: number,
    disableHistory?: boolean,
    component: React.ElementType
  };

// remove properties which should not be used - these are handled internally
type OmitGridProps<T> = Omit<T,
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

export type ODataGridBaseColDef<ColDef> = Omit<ColDef, "hide" | "filterOperators" | "sortComparator"> & FieldDef & {
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