import React from "react";
import { GridColDef, GridValidRowModel, DataGridProps, GridInitialState, GridColumnsInitialState } from "@mui/x-data-grid";

import { FilterBuilderInitialState, FilterBuilderProps } from "../FilterBuilder/models/FilterBuilderProps";
import { ResponsiveValues } from "../hooks";
import { ODataGridBaseColDef } from "./columns/ODataGridBaseColDef";
import { ODataGridApi  } from "./ODataGridApi";

export type ODataGridBaseProps<
  ComponentProps extends DataGridProps,
  TDate,
  TInitialState extends GridInitialState,
  R extends GridValidRowModel = any,
> =
  OmitGridProps<ComponentProps>
  &
  {
    /**
     * URL of OData endpoint
     */
    url: string,

    /**
     * Fields to always add to $select clause (regardless of whether the associated column is visible, if one even exists)
     */
    alwaysSelect?: string[],

    /**
     * Column definitions
     */
    columns: ODataGridBaseColDef<GridColDef, R, any, any, TDate>[],

    /**
     * Column visibility state. Note: use initialState.columnVisibilityModel if you just want to set the default column
     * visibility state.
     */
    columnVisibilityModel?: ODataColumnVisibilityModel,

    /**
     * Component to use for DataGrid (internal use)
     */
    component: React.ElementType,

    /**
     * Disable the FilterBuilder if set to true
     */
    disableFilterBuilder?: boolean,

    /**
     * Disable the creation of history entries for the DataGrid and FilterBuilder if true
     */
    disableHistory?: boolean,

    /**
     * Static $filter to use for OData query (only used when disableFilterBuilder is true)
     */
    $filter?: string,

    /**
     * Props to pass to FilterBuilder
     */
    filterBuilderProps?: DataGridFilterBuilderProps<TDate>,

    /**
     * Initial state of component when mounted
     */
    initialState?: ODataGridInitialState<TInitialState>,

    /**
     * Options to add to OData request
     */
    requestOptions?: RequestInit,

    /**
     * Ref for API object which allows interacting with DataGrid and FilterBuilder programmatically
     */
    apiRef?: React.MutableRefObject<ODataGridApi>
  };

export type DataGridFilterBuilderProps<TDate> = Omit<FilterBuilderProps<TDate>, "schema" | "initialState">

// remove properties which should not be used - these are handled internally or overridden
type OmitGridProps<T> = Omit<T,
  "apiRef"
  | "columns"
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

/**
 * Initial state of ODataGrid when first mounted
 */
export type ODataGridInitialState<T extends GridInitialState> = Omit<T, "columns" | "filter"> & FilterBuilderInitialState & {
  columns?: ODataGridColumnsInitialState
}

type ODataGridColumnsInitialState = Omit<GridColumnsInitialState, "columnVisibilityModel"> & {
  columnVisibilityModel?: ODataColumnVisibilityModel
}

/**
 * Visibility state for DataGrid columns, can be static or responsive based on screen size
 */
export type ODataColumnVisibilityModel = Record<string, boolean | ResponsiveValues<boolean>>;