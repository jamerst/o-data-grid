import { ODataGridBaseProps, ODataRowModel } from "../../base/types";
import { DataGridProps, GridColDef, GridSortModel } from "@mui/x-data-grid";

export type ODataGridProps<TRow = any, TDate = any> = Omit<
  ODataGridBaseProps<DataGridProps<ODataRowModel<TRow>>, GridSortModel, GridColDef<ODataRowModel<TRow>>, TRow, TDate>,
  "component"
>;