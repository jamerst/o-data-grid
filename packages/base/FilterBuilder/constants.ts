import Immutable from "immutable";

import { ConditionClause, GroupClause, Operation, TreeGroup } from "./models/filters"
import { FilterBuilderLocaleText } from "./models";

export const rootGroupUuid = "17c63a07-397b-4f03-a74b-2f935dcc6c8a";
export const rootConditionUuid = "18c1713a-2480-40c0-b60f-220a3fd4b117";

export const allOperators: Operation[] = ["eq", "ne", "gt", "lt", "ge", "le", "contains", "null", "notnull"];
export const numericOperators: Operation[] = ["eq", "ne", "gt", "lt", "ge", "le"];

export const initialClauses = Immutable.Map<string, GroupClause | ConditionClause>({
  [rootGroupUuid]: {
    id: rootGroupUuid,
    connective: "and"
  },
  [rootConditionUuid]: {
    id: rootConditionUuid,
    field: "",
    op: "eq",
    value: null,
    default: true
  }
})

export const initialTree = Immutable.Map<string, TreeGroup | string>({
  [rootGroupUuid]: {
    id: rootGroupUuid,
    children: Immutable.Map({ [rootConditionUuid]: rootConditionUuid })
  }
})

export const defaultLocale: Required<FilterBuilderLocaleText> = {
  and: "And",
  or: "Or",

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