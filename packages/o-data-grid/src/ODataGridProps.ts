import { ODataGridBaseProps } from "../../base/types";
import { DataGridProps, GridColDef, GridSortModel } from "@mui/x-data-grid";

export type ODataGridProps = Omit<
  ODataGridBaseProps<DataGridProps, GridSortModel, GridColDef>,
  "component"
>;