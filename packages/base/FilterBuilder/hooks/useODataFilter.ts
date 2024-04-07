import { useCallback } from "react";
import { useAtomValue } from "jotai"

import { rootGroupUuid } from "../constants";
import { clausesAtom, treeAtom } from "../atoms"
import { defaultTranslators } from "../translation";

import { FieldDef } from "../models/fields";
import { ConditionClause, GroupClause, Operation, SerialisedCondition, SerialisedGroup, StateClause, StateTree, TreeGroup } from "../models/filters";
import { TranslatedInnerQuery, TranslatedQuery, FilterTranslator } from "../models/filters/translation";

/**
 * Get a function to translate the current filter state into an OData filter string
 * @param schema Field definitions
 * @returns Memoised function to translate the current filter state into an OData filter string
 */
export const useODataFilter = <TDate,>(schema: FieldDef<unknown>[]) => {
  const clauses = useAtomValue(clausesAtom);
  const tree = useAtomValue(treeAtom);

  return useCallback(() => {
    return translateGroup<TDate>(schema, clauses, tree, rootGroupUuid, []) as TranslatedQuery<SerialisedGroup> | undefined;
  }, [schema, clauses, tree]);
}

/**
 * Get a function to translate a provided filter state into an OData filter string
 * @param schema Field definitions
 * @returns Memoised function to translate provided filter state into an OData filter string
 */
export const useODataFilterWithState = <TDate,>(schema: FieldDef<unknown>[]) => {
  return useCallback((clauses: StateClause, tree: StateTree) => {
    return translateGroup<TDate>(schema, clauses, tree, rootGroupUuid, []) as TranslatedQuery<SerialisedGroup> | undefined;
  }, [schema])
}

/**
 * Translate a GroupClause into an OData filter string
 * @param schema Field definitions
 * @param clauses Filter clauses state variable
 * @param tree Filter tree state variable
 * @param id ID of group to translate
 * @param path Path in tree to group
 * @returns Group translated into an OData filter string, undefined if group is a default group (from the initial state
 * of the filter builder), false if translation fails
 */
const translateGroup = <TDate,>(schema: FieldDef<TDate>[], clauses: StateClause, tree: StateTree, id: string, path: string[]): (TranslatedQuery<SerialisedGroup> | false | undefined) => {
  const clause = clauses.get(id) as GroupClause;
  const treeNode = tree.getIn([...path, id]) as TreeGroup;

  if (!treeNode) {
    console.error(`Tree node ${[...path, id].join("->")} not found`);
    return false;
  }

  const translatedChildren = treeNode.children
    .toArray()
    .map((c) => {
      if (typeof c[1] === "string") {
        return translateCondition(schema, clauses, c[0]);
      } else {
        return translateGroup(schema, clauses, tree, c[0], [...path, id, "children"]);
      }
    });

  if (translatedChildren.length === 1 && translatedChildren[0] === undefined) {
    return undefined;
  }

  const childClauses = translatedChildren
    .filter(c => !!c) as (TranslatedQuery<SerialisedGroup> | TranslatedQuery<SerialisedCondition>)[];

  if (childClauses.length > 1 || clause.negated) {
    return {
      filter: `${clause.negated ? "not" : ""}(${childClauses.filter(c => c.filter).map(c => c.filter).join(` ${clause.connective} `)})`,
      compute: `${childClauses.filter(c => c.compute).map(c => c.compute).join(",")}`,
      select: childClauses.filter(c => c.select).flatMap(c => c.select!),
      serialised: { connective: clause.connective, negated: clause.negated, children: childClauses.map(c => c.serialised) },
      queryString: childClauses.reduce((x, c) => ({ ...x, ...c.queryString }), {})
    };
  } else if (childClauses.length === 1) {
    return {
      filter: childClauses[0].filter,
      compute: childClauses[0].compute,
      select: childClauses[0].select,
      serialised: { connective: clause.connective, negated: clause.negated, children: [childClauses[0].serialised] },
      queryString: childClauses[0].queryString
    }
  } else {
    console.error(`Group has no children: ${id}`);
    return false;
  }
}

/**
 * Translate a ConditionClause into an OData filter string
 * @param schema Field definitions
 * @param clauses Filter clauses state
 * @param id ID of condition to translate
 * @returns Condition translated into an OData filter string, undefined if condition is a default condition (from initial
 * state of filter builder), false if translation fails
 */
const translateCondition = <TDate,>(schema: FieldDef<TDate>[], clauses: StateClause, id: string): (TranslatedQuery<SerialisedCondition> | false | undefined) => {
  const clause = clauses.get(id) as ConditionClause;

  let condition: SerialisedCondition | undefined = undefined;
  if (!clause) {
    console.error(`Clause not found: ${id}`);
    return false;
  } else if (clause.default) {
    return undefined; // don't translate default clauses
  } else {
    condition = {
      field: clause.field,
      op: clause.op,
      collectionOp: clause.collectionOp,
      collectionField: clause.collectionField,
      value: clause.value
    }
  }

  const def = schema.find(d => d.field === clause.field);

  if (!def) {
    console.error(`Schema entry not found for field "${clause.field}"`);
    return false;
  }

  const filterField = def.filterField ?? def.field;

  let innerResult;
  if (clause.collectionOp) {
    if (clause.collectionOp === "count") {
      innerResult = {
        filter: `${filterField}/$count ${clause.op} ${clause.value}`
      };
    } else {
      const collectionDef = def.collectionFields!.find(d => d.field === clause.collectionField!);
      innerResult = translateInnerCondition(collectionDef!, "x/" + clause.collectionField!, clause.op, clause.value);
    }
  } else {
    innerResult = translateInnerCondition(def, filterField, clause.op, clause.value);
  }

  if (typeof innerResult !== "boolean") {
    if (innerResult.filter) {
      return {
        filter: innerResult.filter,
        compute: innerResult.compute,
        select: innerResult.select,
        serialised: condition
      }
    } else {
      return {
        serialised: condition,
        queryString: innerResult.queryString
      };
    }
  } else {
    return false;
  }
}

/**
 * Translate a condition into an OData filter string
 * @param schema Field definition of condition to translate
 * @param field Field name
 * @param op Condition operation
 * @param value Condition value
 * @returns OData filter string for condition, false if translation fails
 */
const translateInnerCondition = <TDate,>(schema: FieldDef<TDate>, field: string, op: Operation, value: any): TranslatedInnerQuery | false => {
  if (schema.getCustomQueryString) {
    return {
      queryString: schema.getCustomQueryString(op, value)
    };
  }

  if (schema.getCustomFilterString) {
    const result = schema.getCustomFilterString(op, value);

    if (typeof result === "string") {
      return {
        filter: result
      }
    } else if (typeof result !== "boolean") {
      const compute = result.compute;
      if (typeof compute === "string") {
        return {
          filter: result.filter,
          compute: compute
        };
      } else {
        return {
          filter: result.filter,
          compute: compute.compute,
          select: compute.select
        };
      }
    } else {
      return result;
    }
  }

  let translator: FilterTranslator<TDate>;
  if (op in defaultTranslators) {
    translator = defaultTranslators[op]!;
  } else {
    translator = defaultTranslators["default"]!;
  }

  const result = translator({ schema, field, op, value });

  if (typeof result === "string") {
    return {
      filter: result
    };
  } else {
    return result;
  }
}