import { useCallback } from "react";
import { useRecoilValue, waitForAll } from "recoil"
import { rootGroupUuid } from "./constants";
import { clauseState, schemaState, treeState } from "./state"
import { BaseFieldDef, SerialisedCondition, ConditionClause, FieldDef, SerialisedGroup, GroupClause, Operation, QueryStringCollection, StateClause, StateTree, TreeGroup } from "./types";

export const UseODataFilter = () => {
  const schema = useRecoilValue(schemaState);
  const [clauses, tree] = useRecoilValue(waitForAll([clauseState, treeState]));

  return useCallback(() => {
    return buildGroup(schema, clauses, tree, rootGroupUuid, []) as BuiltQuery<SerialisedGroup>;
  }, [schema, clauses, tree]);
}

export const UseODataFilterWithState = () => {
  const schema = useRecoilValue(schemaState);

  return useCallback((clauses: StateClause, tree: StateTree) => {
    return buildGroup(schema, clauses, tree, rootGroupUuid, []) as BuiltQuery<SerialisedGroup>;
  }, [schema])
}

type BuiltInnerQuery = {
  filter?: string,
  queryString?: QueryStringCollection
}

type BuiltQuery<T> = BuiltInnerQuery & {
  serialised: T
}

const buildGroup = (schema: FieldDef[], clauses: StateClause, tree: StateTree, id: string, path: string[]): (BuiltQuery<SerialisedGroup> | boolean) => {
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
      serialised: { connective: clause.connective, children: childClauses.map(c => c.serialised) },
      queryString: childClauses.reduce((x, c) => ({ ...x, ...c.queryString }), {})
    };
  } else if (childClauses.length === 1) {
    return {
      filter: childClauses[0].filter,
      serialised: { connective: clause.connective, children: [childClauses[0].serialised] },
      queryString: childClauses[0].queryString
    }
  } else {
    console.error("Group has no children");
    return false;
  }
}

const buildCondition = (schema: FieldDef[], clauses: StateClause, id: string): (BuiltQuery<SerialisedCondition> | boolean) => {
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
    if (typeof innerResult === "string") {
      return {
        filter: innerResult,
        serialised: condition
      };
    } else {
      return {
        serialised: condition,
        queryString: innerResult
      }
    }
  } else {
    return false;
  }
}

const buildInnerCondition = (schema: BaseFieldDef, field: string, op: Operation, value: any): string | QueryStringCollection | boolean => {
  if (schema.getCustomQueryString) {
    return schema.getCustomQueryString(op, value);
  }

  if (schema.getCustomFilterString) {
    return schema.getCustomFilterString(op, value)
  }

  if (op === "contains") {
    if ((schema.type && schema.type !== "string") || typeof value !== "string") {
      console.warn(`Warning: operation "contains" is only supported for fields of type "string"`);
      return false;
    }
    if (schema.caseSensitive === true) {
      return `contains(${field}, '${value}')`;
    } else {
      return `contains(tolower(${field}), tolower('${value}'))`;
    }
  } else if (op === "null") {
    return `${field} eq null`;
  } else if (op === "notnull") {
    return `${field} ne null`;
  } else {
    if (schema.type === "date") {
      return `date(${field}) ${op} ${value}`;
    } else if (schema.type === "datetime") {
      return `${field} ${op} ${value}`;
    } else if (schema.type === "boolean") {
      return `${field} ${op} ${value}`;
    } else if (!schema.type || schema.type === "string" || typeof value === "string") {
      if (schema.caseSensitive === true) {
        return `${field} ${op} '${value}'`;
      } else {
        return `tolower(${field}) ${op} tolower('${value}')`;
      }
    } else {
      return `${field} ${op} ${value}`;
    }
  }
}