import { useCallback } from "react";
import { useRecoilValue, waitForAll } from "recoil"
import { rootGroupUuid } from "./constants";
import { clauseState, schemaState, treeState } from "./state"
import { defaultTranslators } from "./translation";
import { BaseFieldDef, SerialisedCondition, ConditionClause, FieldDef, SerialisedGroup, GroupClause, Operation, QueryStringCollection, StateClause, StateTree, TreeGroup, FilterTranslator } from "./types";

export const UseODataFilter = <TDate,>() => {
  const schema = useRecoilValue(schemaState);
  const [clauses, tree] = useRecoilValue(waitForAll([clauseState, treeState]));

  return useCallback(() => {
    return buildGroup<TDate>(schema, clauses, tree, rootGroupUuid, []) as BuiltQuery<SerialisedGroup>;
  }, [schema, clauses, tree]);
}

export const UseODataFilterWithState = <TDate,>() => {
  const schema = useRecoilValue(schemaState);

  return useCallback((clauses: StateClause, tree: StateTree) => {
    return buildGroup<TDate>(schema, clauses, tree, rootGroupUuid, []) as BuiltQuery<SerialisedGroup>;
  }, [schema])
}

type BuiltInnerQuery = {
  filter?: string,
  compute?: string,
  select?: string[],
  queryString?: QueryStringCollection
}

type BuiltQuery<T> = BuiltInnerQuery & {
  serialised: T
}

const buildGroup = <TDate,>(schema: FieldDef<TDate>[], clauses: StateClause, tree: StateTree, id: string, path: string[]): (BuiltQuery<SerialisedGroup> | boolean) => {
  const clause = clauses.get(id) as GroupClause;
  const treeNode = tree.getIn([...path, id]) as TreeGroup;

  if (!treeNode) {
    console.error(`Tree node ${[...path, id].join("->")} not found`);
    return false;
  }

  const childClauses = treeNode.children
    .toArray()
    .map((c) => {
      if (typeof c[1] === "string") {
        return buildCondition(schema, clauses, c[0]);
      } else {
        return buildGroup(schema, clauses, tree, c[0], [...path, id, "children"]);
      }
    })
    .filter(c => c !== false) as (BuiltQuery<SerialisedGroup> | BuiltQuery<SerialisedCondition>)[];

  if (childClauses.length > 1) {
    return {
      filter: `(${childClauses.filter(c => c.filter).map(c => c.filter).join(` ${clause.connective} `)})`,
      compute: `${childClauses.filter(c => c.compute).map(c => c.compute).join(",")}`,
      select: childClauses.filter(c => c.select).flatMap(c => c.select!),
      serialised: { connective: clause.connective, children: childClauses.map(c => c.serialised) },
      queryString: childClauses.reduce((x, c) => ({ ...x, ...c.queryString }), {})
    };
  } else if (childClauses.length === 1) {
    return {
      filter: childClauses[0].filter,
      compute: childClauses[0].compute,
      select: childClauses[0].select,
      serialised: { connective: clause.connective, children: [childClauses[0].serialised] },
      queryString: childClauses[0].queryString
    }
  } else {
    console.error("Group has no children");
    return false;
  }
}

const buildCondition = <TDate,>(schema: FieldDef<TDate>[], clauses: StateClause, id: string): (BuiltQuery<SerialisedCondition> | boolean) => {
  const clause = clauses.get(id) as ConditionClause;

  let condition: SerialisedCondition | undefined = undefined;
  if (!clause || clause.default === true) {
    console.error(`Clause not found: ${id}`);
    return false;
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
      innerResult = buildInnerCondition(collectionDef!, "x/" + clause.collectionField!, clause.op, clause.value);
    }
  } else {
    innerResult = buildInnerCondition(def, filterField, clause.op, clause.value);
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

const buildInnerCondition = <TDate,>(schema: BaseFieldDef<TDate>, field: string, op: Operation, value: any): BuiltInnerQuery | boolean => {
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

  const result = translator(schema, field, op, value);

  if (typeof result === "string") {
    return {
      filter: result
    };
  } else {
    return result;
  }
}