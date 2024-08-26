import Immutable from "immutable";

import { ConditionClause, GroupClause, Operation, TreeGroup } from "./models/filters"
import { FilterBuilderLocaleText } from "./models";

export const rootGroupId = "root-group";
export const rootConditionId = "root-condition";

export const allOperators: Operation[] = ["eq", "ne", "gt", "lt", "ge", "le", "contains", "null", "notnull"];
export const numericOperators: Operation[] = ["eq", "ne", "gt", "lt", "ge", "le"];

export const initialClauses = Immutable.Map<string, GroupClause | ConditionClause>({
  [rootGroupId]: {
    id: rootGroupId,
    connective: "and",
    negated: false
  },
  [rootConditionId]: {
    id: rootConditionId,
    field: "",
    op: "eq",
    value: null,
    default: true
  }
})

export const initialTree = Immutable.Map<string, TreeGroup | string>({
  [rootGroupId]: {
    id: rootGroupId,
    children: Immutable.Map({ [rootConditionId]: rootConditionId })
  }
})

export const defaultLocale: Required<FilterBuilderLocaleText> = {
  and: "And",
  or: "Or",

  negated: "Not",

  addCondition: "Add Condition",
  addGroup: "Add Group",

  field: "Field",
  operation: "Operation",
  value: "Value",
  collectionOperation: "Operation",
  collectionField: "Field",

  search: "Search",
  reset: "Reset",

  opAny: "Has at least one",
  opAll: "All have",
  opCount: "Count",

  opEq: "=",
  opNe: "≠",
  opGt: ">",
  opLt: "<",
  opGe: "≥",
  opLe: "≤",
  opContains: "Contains",
  opNull: "Is Blank",
  opNotNull: "Is Not Blank"
}