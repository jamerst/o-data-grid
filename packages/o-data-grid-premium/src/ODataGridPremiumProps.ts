import { DataGridPremiumProps, GridInitialState} from "@mui/x-data-grid-premium";
import { PickerValidDate } from "@mui/x-date-pickers";

import { ODataGridBaseProps, ODataRowModel, ODataGridInitialState as ODataGridBaseInitialState } from "../../base/models";

export type ODataGridPremiumProps<TRow = any, TDate extends PickerValidDate = PickerValidDate> = Omit<
  ODataGridBaseProps<DataGridPremiumProps<ODataRowModel<TRow>>, TDate, GridInitialState>,
  "component"
  >;

export type ODataGridInitialState = ODataGridBaseInitialState<GridInitialState>;