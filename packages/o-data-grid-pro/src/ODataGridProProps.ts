import { DataGridProProps, GridInitialState} from "@mui/x-data-grid-pro";
import { PickerValidDate } from "@mui/x-date-pickers";

import { ODataGridBaseProps, ODataRowModel, ODataGridInitialState as ODataGridBaseInitialState } from "../../base/models";

export type ODataGridProProps<TRow = any, TDate extends PickerValidDate = PickerValidDate> = Omit<
  ODataGridBaseProps<DataGridProProps<ODataRowModel<TRow>>, TDate, GridInitialState>,
  "component"
  >;

export type ODataGridInitialState = ODataGridBaseInitialState<GridInitialState>;