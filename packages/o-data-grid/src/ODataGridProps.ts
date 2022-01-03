import { ODataGridBaseProps } from "../../base/types";
import { DataGridProps, GridColDef, GridSortModel } from "@mui/x-data-grid";

export type ODataGridProps = ODataGridBaseProps<DataGridProps, GridSortModel, GridColDef>;