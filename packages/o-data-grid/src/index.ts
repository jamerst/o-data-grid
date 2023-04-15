import { GridColDef, GridActionsColDef } from "@mui/x-data-grid";

import ODataGrid from "./ODataGrid";
import { ODataGridBaseColDef, ODataRowModel } from "../../base/types";
import FilterBuilder from "../../base/FilterBuilder/components/FilterBuilder";
import { allOperators, numericOperators } from "../../base/FilterBuilder/constants";

export {
  ODataGrid,
  FilterBuilder,
  allOperators,
  numericOperators
}

export type { ODataGridProps } from "./ODataGridProps";
export type ODataGridColDef<TRow = any, V = any, F = any, TDate = any>
  = ODataGridBaseColDef<GridColDef<ODataRowModel<TRow>, V, F>, TDate>
  | ODataGridBaseColDef<GridActionsColDef<ODataRowModel<TRow>, V, F>, TDate>;
    // supposedly GridActionsColDef has been removed according to the migration guide, but it hasn't and is still
    // needed?

export type { SelectOption, ValueOption, ODataColumnVisibilityModel } from "../../base/types";
export type {
  CollectionFieldDef,
  CollectionOperation,
  ComputeSelect,
  Connective,
  ExternalBuilderProps as FilterBuilderProps,
  FilterBuilderLocaleText,
  FilterCompute,
  FilterParameters,
  FieldDef,
  QueryStringCollection,
  SerialisedGroup,
  SerialisedCondition,
} from "../../base/FilterBuilder/types";

export { escapeODataString } from "../../base/FilterBuilder/utils";
export { defaultTranslators } from "../../base/FilterBuilder/translation";