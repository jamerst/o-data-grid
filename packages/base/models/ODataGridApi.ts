import { GridApi } from "@mui/x-data-grid";
import { FilterBuilderApi } from "../FilterBuilder/models";

export type ODataGridApi = GridApi & FilterBuilderApi & InternalODataGridApi;

export type InternalODataGridApi = {
  /**
   * Reload the rows in the DataGrid by re-fetching them from the OData API
   * @returns Promise that completes when rows have been reloaded
   */
  reload: () => Promise<void>
}