import { atom } from "recoil"

import { initialTree, initialClauses } from "./constants";
import { FieldDef } from "./models/fields";
import { FilterBuilderProps } from "./models";

export const schemaState = atom<FieldDef<unknown>[]>({
  key: "schema",
  default: []
});

export const clauseState = atom({
  key: "filterClauses",
  default: initialClauses
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