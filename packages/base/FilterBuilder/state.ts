import { atom } from "recoil"

import { ExternalBuilderProps, FieldDef } from "./types"
import { initialTree, initialClauses } from "./constants";

export const schemaState = atom<FieldDef[]>({
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

export const propsState = atom<ExternalBuilderProps>({
  key: "props",
  default: {}
});