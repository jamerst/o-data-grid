import Immutable from "immutable";
import { SelectOption, ValueOption } from "../types";
import { v4 as uuid } from "uuid";
import { defaultLocale, rootGroupUuid } from "./constants";
import { Group, StateTree, StateClause, TreeGroup } from "./types";

import { GroupClause, ConditionClause, FilterBuilderLocaleText } from "./types"

export const getDefaultCondition = (field: string): ConditionClause => ({
  field: field,
  op: "eq",
  value: null,
  id: uuid()
})

export const getDefaultGroup = (): GroupClause => ({
  connective: "and",
  id: uuid()
});

export const getSelectOption = (option: ValueOption): SelectOption => {
  if (typeof option === "string") {
    return { value: option, label: option };
  } else if (typeof option === "number") {
    return { value: option.toString(), label: option.toString() }
  } else {
    return option;
  }
}

export const getLocaleText = (key: keyof FilterBuilderLocaleText, locale: FilterBuilderLocaleText | undefined) =>
  locale !== undefined && locale[key] ? locale[key]! : defaultLocale[key];

export const deserialise = (obj: Group): [StateTree, StateClause] => {
  const [treeGroup, clauses] = groupObjToMap(obj, rootGroupUuid);

  return [
    Immutable.Map<string, string | TreeGroup>({
      [rootGroupUuid]: treeGroup
    }),
    clauses
  ];
}

const groupObjToMap = (obj: Group, id: string, clauses?: StateClause): [TreeGroup, StateClause] => {
  let children = Immutable.Map<string, TreeGroup | string>();

  if (!clauses) {
    clauses = Immutable.Map<string, GroupClause | ConditionClause>();
  }

  clauses = clauses.set(id, {
    id: id,
    ...obj
  });

  obj.children.forEach((child) => {
    const childId = uuid();
    clauses = clauses!.set(childId, {
      id: childId,
      ...child
    });

    const g = child as Group;
    if (g.connective) {
      const result = groupObjToMap(g, childId, clauses);

      children = children.set(childId, result[0]);
      clauses = clauses.merge(result[1]);
    } else {
      children = children.set(childId, childId);
    }
  });

  return [{ id: id, children: children }, clauses]
}