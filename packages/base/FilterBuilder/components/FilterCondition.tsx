import React, { useCallback, useMemo } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Grid, IconButton } from "@mui/material";
import { Remove } from "@mui/icons-material";

import FilterInputs from "./FilterInputs";

import { CollectionOperation, ConditionClause, Operation, TreeGroup } from "../types"

import { clauseState, schemaState, treeState } from "../state"

import { numericOperators } from "../constants";


type FilterConditionProps = {
  clauseId: string,
  path: string[],
}

const FilterCondition = ({ clauseId, path }: FilterConditionProps) => {
  const [clauses, setClauses] = useRecoilState(clauseState);
  const setTree = useSetRecoilState(treeState);

  const schema = useRecoilValue(schemaState);

  const condition = useMemo(() => clauses.get(clauseId) as ConditionClause, [clauses, clauseId]);

  const changeField = useCallback((oldField: string, currentOp: Operation, newField: string) => {
    const oldFieldDef = schema.find(c => c.field === oldField);
    const newFieldDef = schema.find(c => c.field === newField);

    setClauses(old => old.update(clauseId, c => {
      const condition = { ...c as ConditionClause };
      condition.field = newField;
      condition.default = false;

      if (oldFieldDef && newFieldDef) {
        // reset value if fields have different types
        if (oldFieldDef.type !== newFieldDef.type) {
          condition.value = "";
        }

        // reset operator if new field doesn't support current operator
        if (newFieldDef.filterOperators && !newFieldDef.filterOperators.includes(currentOp)) {
          condition.op = newFieldDef.filterOperators[0] ?? "eq";
        }

        // set collection field if new field is a collection
        if (newFieldDef.collection === true && newFieldDef.collectionFields) {
          condition.collectionField = newFieldDef.collectionFields[0].field;
          condition.collectionOp = "any";

          if (newFieldDef.collectionFields[0].filterOperators) {
            condition.op = newFieldDef.collectionFields[0].filterOperators[0];
          }
          else {
            condition.op = "eq";
          }
        } else { // clear collection fields if new field is not a collection
          condition.collectionField = undefined;
          condition.collectionOp = undefined;
        }
      }

      return condition;
    }));
  }, [schema, setClauses, clauseId]);

  const changeOp = useCallback((o: Operation) => {
    setClauses(old => old.update(clauseId, c => ({ ...c as ConditionClause, op: o, default: false })));
  }, [setClauses, clauseId]);

  const changeValue = useCallback((v: any) => {
    setClauses(old => old.update(clauseId, c => ({ ...c as ConditionClause, value: v, default: false })));
  }, [setClauses, clauseId]);

  const changeCollectionOp = useCallback((o: CollectionOperation) => {
    setClauses(old => old.update(clauseId, c => {
      const condition = { ...c as ConditionClause, collectionOp: o, default: false };

      // reset field operator if switching to count operator and current op is not valid
      if (o === "count" && !numericOperators.includes(condition.op)) {
        condition.op = "eq";
      }

      return condition;
    }));
  }, [setClauses, clauseId]);

  const changeCollectionField = useCallback((field: string, oldColField: string | undefined, currentOp: Operation, newColField: string | undefined) => {
    const fieldDef = schema.find(c => c.field === field);

    setClauses(old => old.update(clauseId, c => {
      const condition = { ...c as ConditionClause };
      condition.collectionField = newColField;
      condition.default = false;

      if (fieldDef && fieldDef.collectionFields && oldColField && newColField) {
        const oldColFieldDef = fieldDef.collectionFields.find(c => c.field === oldColField);
        const newColFieldDef = fieldDef.collectionFields.find(c => c.field === newColField);

        // reset value if fields have different types
        if (oldColFieldDef!.type !== newColFieldDef!.type) {
          condition.value = "";
        }

        // reset operator if new field doesn't support current operator
        if (newColFieldDef!.filterOperators && !newColFieldDef!.filterOperators.includes(currentOp)) {
          condition.op = newColFieldDef!.filterOperators[0] ?? "eq";
        }
      }

      return condition;
    }));
  }, [schema, setClauses, clauseId]);

  const remove = useCallback(() => {
    // if not root group
    if (path.length > 2) {
      setTree(oldTree => oldTree.withMutations((old) => {
        // delete self
        old.deleteIn([...path, clauseId]);

        // get path to parent node (i.e. remove "children" from end of path)
        const parentPath = [...path];
        parentPath.splice(-1, 1);

        do {
          const node = old.getIn(parentPath) as TreeGroup;
          // delete parent if now empty
          if (node && node.children.count() < 1) {
            old.deleteIn(parentPath);
          } else { // not the only child, so only remove self and stop
            old.deleteIn([...path, clauseId]);
            break;
          }

          parentPath.splice(-2, 2); // move up in path to next parent
        } while (parentPath.length > 2) // keep removing empty groups until root is reached
      }))
    } else {
      setTree(old => old.deleteIn([...path, clauseId]));
    }

    setClauses(old => old.remove(clauseId));
  }, [setClauses, setTree, clauseId, path])

  if (!condition) {
    return null;
  }

  return (
    <Grid container spacing={1}>
      <FilterInputs
        clauseId={clauseId}
        field={condition.field}
        onFieldChange={changeField}
        op={condition.op}
        onOpChange={changeOp}
        value={condition.value}
        onValueChange={changeValue}
        collectionOp={condition.collectionOp}
        onCollectionOpChange={changeCollectionOp}
        collectionField={condition.collectionField}
        onCollectionFieldChange={changeCollectionField}
      />
      <Grid item xs="auto">
        <IconButton onClick={remove}>
          <Remove />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default FilterCondition;