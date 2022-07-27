import { ODataGridBaseProps } from "../../base/types";
import { DataGridProProps, GridColDef, GridSortModel } from "@mui/x-data-grid-pro";

export type ODataGridProProps<TDate = any> = Omit<
  ODataGridBaseProps<DataGridProProps, GridSortModel, GridColDef, TDate>,
  "component"
>;