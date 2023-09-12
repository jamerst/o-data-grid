import { atom } from "recoil"

import { initialTree } from "./constants";
import { FieldDef } from "./models/fields";
import { FilterBuilderProps } from "./models";
import Immutable from "immutable";
import { ConditionClause, GroupClause } from "./models/filters";

export const schemaState = atom<FieldDef<unknown>[]>({
  key: "schema",
  default: []
});

export const clauseState = atom({
  key: "filterClauses",
  default: Immutable.Map<string, GroupClause | ConditionClause>()
});

export const treeState = atom({
  key: "filterTree",
  default: initialTree
});

export const propsState = atom<FilterBuilderProps<any>>({
  key: "props",
  default: {
    schema: []
  }
});