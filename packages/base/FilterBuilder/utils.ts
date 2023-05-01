import Immutable from "immutable";
import { v4 as uuid } from "uuid";

import { defaultLocale, rootGroupUuid } from "./constants";

import { ConditionClause, GroupClause, SerialisedGroup, StateTree, StateClause, TreeGroup } from "./models/filters";
import { FilterBuilderLocaleText } from "./models"

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

export const getLocaleText = (key: keyof FilterBuilderLocaleText, locale: FilterBuilderLocaleText | undefined) =>
  locale !== undefined && locale[key] ? locale[key]! : defaultLocale[key];

export const deserialise = (obj: SerialisedGroup): [StateTree, StateClause] => {
  const [treeGroup, clauses] = groupObjToMap(obj, rootGroupUuid);

  return [
    Immutable.Map<string, string | TreeGroup>({
      [rootGroupUuid]: treeGroup
    }),
    clauses
  ];
}

const groupObjToMap = (obj: SerialisedGroup, id: string, clauses?: StateClause): [TreeGroup, StateClause] => {
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

    const g = child as SerialisedGroup;
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

export const escapeODataString = (val?: string) => val?.replace("'", "''");