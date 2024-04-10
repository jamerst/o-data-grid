import { GridActionsColDef, GridValidRowModel, GridSingleSelectColDef } from "@mui/x-data-grid-pro";
import { GridBaseColDef } from "@mui/x-data-grid-pro/internals";
import { PickerValidDate } from "@mui/x-date-pickers";

import { ODataGridBaseColDef } from "../../base/models";
import FilterBuilder from "../../base/FilterBuilder/components/FilterBuilder";
import { allOperators, numericOperators } from "../../base/FilterBuilder/constants";

import ODataGridPro from "./ODataGridPro";

export {
  ODataGridPro,
  FilterBuilder,
  allOperators,
  numericOperators
}

export type { ODataGridProProps, ODataGridInitialState } from "./ODataGridProProps";
export type ODataGridColDef<TRow extends GridValidRowModel = any, V = any, F = any, TDate extends PickerValidDate = PickerValidDate>
  = ODataGridBaseColDef<GridBaseColDef<TRow, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridActionsColDef<TRow, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridSingleSelectColDef<TRow, V, F>, TRow, V, F, TDate>;

export type { ODataColumnVisibilityModel } from "../../base/models";

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