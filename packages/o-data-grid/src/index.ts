import { GridColDef, GridActionsColDef, GridValidRowModel } from "@mui/x-data-grid";

import ODataGrid from "./ODataGrid";
import { ODataGridBaseColDef, ODataRowModel } from "../../base/types";
import FilterBuilder from "../../base/FilterBuilder/components/FilterBuilder";
import { allOperators, numericOperators } from "../../base/FilterBuilder/constants";
import { GridBaseColDef, GridSingleSelectColDef } from "@mui/x-data-grid/internals";

export {
  ODataGrid,
  FilterBuilder,
  allOperators,
  numericOperators
}

export type { ODataGridProps, ODataInitialState } from "./ODataGridProps";
export type ODataGridColDef<TRow extends GridValidRowModel = any, V = any, F = any, TDate = any>
  = ODataGridBaseColDef<GridBaseColDef<TRow, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridActionsColDef<TRow, V, F>, TRow, V, F, TDate>
  | ODataGridBaseColDef<GridSingleSelectColDef<TRow, V, F>, TRow, V, F, TDate>;
  // | ODataGridBaseColDef<GridActionsColDef<ODataRowModel<TRow>, V, F>, TDate>;
    // supposedly GridActionsColDef has been removed according to the migration guide, but it hasn't and is still
    // needed?

export type { SelectOption, ValueOption, ODataColumnVisibilityModel } from "../../base/types";

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
  TranslatedQuery as BuiltQuery,
  ComputeSelect,
  FilterCompute,
  QueryStringCollection,
} from "../../base/FilterBuilder/models/filters/translation"

export { escapeODataString } from "../../base/FilterBuilder/utils";
export { defaultTranslators } from "../../base/FilterBuilder/translation";