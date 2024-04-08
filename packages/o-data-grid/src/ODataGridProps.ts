import { GridInitialState} from "@mui/x-data-grid";
import { ODataGridBaseProps, ODataRowModel, ODataGridInitialState as ODataGridBaseInitialState } from "../../base/models";
import { DataGridProps } from "@mui/x-data-grid";

export type ODataGridProps<TRow = any, TDate = any> = Omit<
    ODataGridBaseProps<DataGridProps<ODataRowModel<TRow>>,
    TDate,
    GridInitialState>,
  "component"
  >;

export type ODataGridInitialState = ODataGridBaseInitialState<GridInitialState>;