import { atom } from "jotai"

import { initialTree } from "./constants";
import { FieldDef } from "./models/fields";
import { FilterBuilderProps } from "./models";
import Immutable from "immutable";
import { ConditionClause, GroupClause } from "./models/filters";
import { PickerValidDate } from "@mui/x-date-pickers";

export const schemaAtom = atom<FieldDef<PickerValidDate>[]>([]);

export const clausesAtom = atom(Immutable.Map<string, GroupClause | ConditionClause>());

export const treeAtom = atom(initialTree);

export const propsAtom = atom<FilterBuilderProps<PickerValidDate>>({
  schema: []
});