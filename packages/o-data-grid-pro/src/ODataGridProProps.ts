import { ODataGridBaseProps, ODataRowModel } from "../../base/types";
import { DataGridProProps, GridColDef, GridSortModel } from "@mui/x-data-grid-pro";

export type ODataGridProProps<TRow = any, TDate = any> = Omit<
  ODataGridBaseProps<DataGridProProps<ODataRowModel<TRow>>, GridSortModel, GridColDef<ODataRowModel<TRow>>, TRow, TDate>,
  "component"
>;