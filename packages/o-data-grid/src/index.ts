import { GridActionsColDef, GridValidRowModel, GridSingleSelectColDef } from "@mui/x-data-grid";
import { GridBaseColDef } from "@mui/x-data-grid/internals";
import { PickerValidDate } from "@mui/x-date-pickers";

import { allOperators, numericOperators } from "../../base/FilterBuilder/constants";
import FilterBuilder from "../../base/FilterBuilder/components/FilterBuilder";
import { ODataGridBaseColDef, ODataRowModel } from "../../base/models";

import ODataGrid from "./ODataGrid";

export {
  ODataGrid,
  FilterBuilder,
  allOperators,
  numericOperators
}

export type { ODataGridProps, ODataGridInitialState } from "./ODataGridProps";
export type ODataGridColDef<TRow extends GridValidRowModel = any, V = any, F = any, TDate extends PickerValidDate = PickerValidDate>
  = ODataGridBaseColDef<GridBaseColDef<ODataRowModel<TRow>, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridActionsColDef<ODataRowModel<TRow>, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridSingleSelectColDef<ODataRowModel<TRow>, V, F>, TRow, V, F, TDate>;

export type { ODataColumnVisibilityModel, ODataRowModel } from "../../base/models";

export { useODataGridApiRef } from "../../base/hooks/useODataGridApiRef";

export type {
  FilterBuilderLocaleText,
  FilterBuilderProps
} from "../../base/FilterBuilder/models";
export type {
  FieldDef,
  BooleanFieldDef,
  CollectionFieldDef,
  DateFieldDef,
  DateTimeFieldDef,
  SingleSelectFieldDef,
  TextFieldDef,
} from "../../base/FilterBuilder/models/fields";
export type {
  CollectionOperation,
  Connective,
  SerialisedGroup,
  SerialisedCondition,
} from "../../base/FilterBuilder/models/filters";
export type {
  TranslatedQuery,
  ComputeSelect,
  FilterCompute,
  QueryStringCollection,
} from "../../base/FilterBuilder/models/filters/translation"

export { escapeODataString } from "../../base/FilterBuilder/utils";
export { defaultTranslators } from "../../base/FilterBuilder/translation";