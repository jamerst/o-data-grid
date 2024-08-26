import Immutable from "immutable";
import { nanoid } from "nanoid/non-secure";

import { defaultLocale, rootGroupId } from "./constants";

import { ConditionClause, GroupClause, SerialisedGroup, StateTree, StateClause, TreeGroup } from "./models/filters";
import { FilterBuilderLocaleText } from "./models"

const getId = () => nanoid(15);

/**
 * Create a new condition for a given field
 * @param field Field name
 * @returns New ConditionClause for field
 */
export const getDefaultCondition = (field: string): ConditionClause => ({
  field: field,
  op: "eq",
  value: null,
  id: getId()
})

/**
 * Create a new group
 * @returns New GroupClause
 */
export const getDefaultGroup = (): GroupClause => ({
  connective: "and",
  id: getId(),
  negated: false
});

export const getLocaleText = (key: keyof FilterBuilderLocaleText, locale: FilterBuilderLocaleText | undefined) =>
  locale !== undefined && locale[key] ? locale[key]! : defaultLocale[key];

/**
 * Get the tree and clause state from the serialised representation of a filter
 * @param obj SerialisedGroup to deserialise
 * @returns Tree and clause state from object
 */
export const deserialise = (obj: SerialisedGroup): [StateTree, StateClause] => {
  const [treeGroup, clauses] = groupObjToMap(obj, rootGroupId);

  return [
    Immutable.Map<string, string | TreeGroup>({
      [rootGroupId]: treeGroup
    }),
    clauses
  ];
}

const groupObjToMap = (obj: SerialisedGroup, id: string, clauses?: StateClause): [TreeGroup, StateClause] => {
  let children = Immutable.Map<string, TreeGroup | string>();

  if (!clauses) {
    clauses = Immutable.Map<string, GroupClause | ConditionClause>();
  }

  // create clause for group
  clauses = clauses.set(id, {
    id: id,
    ...obj
  });

  // create clauses and entries in tree for children
  obj.children.forEach((child) => {
    const childId = getId();
    clauses = clauses!.set(childId, {
      id: childId,
      ...child
    });

    const g = child as SerialisedGroup;
    if (g.connective) {
      // child is a group
      const result = groupObjToMap(g, childId, clauses);

      children = children.set(childId, result[0]);
      clauses = clauses.merge(result[1]);
    } else {
      // child is a condition
      children = children.set(childId, childId);
    }
  });

  return [{ id: id, children: children }, clauses]
}

export const escapeODataString = (val?: string) => val?.replace("'", "''");