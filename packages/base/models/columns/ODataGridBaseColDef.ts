import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { GridBaseColDef } from "@mui/x-data-grid/models/colDef/gridColDef";

import { FieldDef } from "../../FilterBuilder/models/fields";
import { Expand } from "../OData/Expand";

/**
 * Column definition for ODataGrid
 */
export type ODataGridBaseColDef<C extends GridBaseColDef<R, V, F> = GridColDef, R extends GridValidRowModel = GridValidRowModel, V = any, F = any, TDate = any> = Omit<C, "filterOperators" | "sortComparator">
  & FieldDef<TDate>
  & {
    /**
     * Fields to add to $select clause when column is shown
     */
    select?: string,

    /**
     * Related data to include via $expand clause when column is shown
     */
    expand?: Expand | Expand[],

    /**
     * Expressions to add to $compute clause when column is shown
     */
    compute?: string,

    /**
     * Set to true if column is for filtering only (hides the column from the DataGrid)
     */
    filterOnly?: boolean,

    /**
     * The field name to use for sorting (if different from field)
     */
    sortField?: string
  }