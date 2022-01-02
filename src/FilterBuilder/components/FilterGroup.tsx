import React, { useCallback, useMemo } from "react"
import { useRecoilValue, useSetRecoilState, waitForAll } from "recoil";
import Immutable from "immutable";
import { Button, ButtonGroup, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Add } from "@mui/icons-material";

import FilterCondition from "./FilterCondition";

import { Connective, GroupClause, TreeChildren, TreeGroup } from "../types"

import { clauseState, propsState, schemaState, treeState } from "../state"

import { getDefaultCondition, getDefaultGroup, getLocaleText } from "../utils";

import makeStyles from "makeStyles";
import { useResponsive } from "hooks";


const useStyles = makeStyles()((theme) => ({
  group: {
    borderWidth: 1,
    borderColor: theme.palette.mode === "dark" ? "rgb(81,81,81)" : "rgb(224,224,224)",
    borderRadius: theme.shape.borderRadius,
    borderStyle: "solid",
    padding: theme.spacing(2),
  },
  child: {
    position: "relative",
    "&:not(:last-of-type)::before": {
      content: "''",
      display: "block",
      position: "absolute",
      width: 2,
      height: "100%",
      background: theme.palette.primary.main,
      left: theme.spacing(-1),
    },
    "&:first-of-type::before": {
      height: `calc(100% + ${theme.spacing(2)})`,
      top: 0
    },
    "&::after": {
      content: "''",
      display: "block",
      position: "absolute",
      left: theme.spacing(-1),
      top: `calc(${theme.spacing(1)} + 1px)`,
      width: theme.spacing(2),
      height: "50%",
      borderWidth: 2,
      borderStyle: "solid",
      borderColor: theme.palette.primary.main,
      borderRight: "none",
      borderTop: "none",
      borderBottomLeftRadius: theme.shape.borderRadius
    }
  }
}));


type FilterGroupProps = {
  clauseId: string,
  path: string[],
  root?: boolean
}

const FilterGroup = ({ clauseId, path, root }: FilterGroupProps) => {
  const { classes } = useStyles();
  const r = useResponsive();

  const [tree, clauses] = useRecoilValue(waitForAll([treeState, clauseState]));
  const setTree = useSetRecoilState(treeState);
  const setClauses = useSetRecoilState(clauseState);
  const schema = useRecoilValue(schemaState);
  const builderProps = useRecoilValue(propsState);

  const group = useMemo(() => clauses.get(clauseId) as GroupClause, [clauses, clauseId]);
  const treeGroup = useMemo(() => tree.getIn([...path, clauseId]) as TreeGroup, [tree, path, clauseId]);

  const childrenPath = useMemo(() => [...path, clauseId, "children"], [path, clauseId]);

  const multiple = useMemo(() => treeGroup.children.count() > 1, [treeGroup]);

  const setConnective = useCallback((con: Connective) => {
    setClauses(clauses.update(clauseId, c => ({...c as GroupClause, connective: con})))
  }, [clauses, setClauses, clauseId]);

  const addGroup = useCallback(() => {
    const group = getDefaultGroup();
    const condition = getDefaultCondition(schema[0].field);

    setClauses(clauses
      .set(group.id, group)
      .set(condition.id, condition)
    );

    setTree(tree
      .updateIn(
        childrenPath,
        (list) => (list as TreeChildren).set(group.id, { id: group.id, children: Immutable.Map({ [condition.id]: condition.id }) })
      )
    );
  }, [clauses, setClauses, tree, setTree, childrenPath, schema]);

  const addCondition = useCallback(() => {
    const condition = getDefaultCondition(schema[0].field);

    setClauses(clauses.set(condition.id, condition));

    setTree(tree
      .updateIn(
        childrenPath,
        (list) => (list as TreeChildren).set(condition.id, condition.id)
      )
    );
  }, [clauses, setClauses, tree, setTree, childrenPath, schema]);

  const handleConnective = useCallback((event, val: Connective | null) => {
    if (val) {
      setConnective(val);
    }
  }, [setConnective]);

  return (
    <Grid item={!root} container marginBottom={1} paddingLeft={root ? 0 : 3} className={root ? "" : classes.group}>
      <Grid item container spacing={1} justifyContent={multiple ? "space-between" : "end"} alignItems={r({ xs: "flex-start", md: "center" })} marginBottom={2} direction={r({ xs: "column-reverse", md: "row" })}>
        {multiple && (
          <Grid item xs={12} md="auto">
            <ToggleButtonGroup
              value={group.connective}
              exclusive
              onChange={handleConnective}
              color="primary"
              aria-label={`${getLocaleText("and", builderProps.localeText)}/${getLocaleText("or", builderProps.localeText)}`}
              size="small"
            >
              <ToggleButton value="and">{getLocaleText("and", builderProps.localeText)}</ToggleButton>
              <ToggleButton value="or">{getLocaleText("or", builderProps.localeText)}</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        )}
        <Grid item xs={12} md="auto">
          <ButtonGroup variant="contained" size="small" color="secondary">
            <Button startIcon={<Add />} onClick={addCondition}>{getLocaleText("addCondition", builderProps.localeText)}</Button>
            <Button startIcon={<Add />} onClick={addGroup}>{getLocaleText("addGroup", builderProps.localeText)}</Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid item container xs direction="column" rowSpacing={2} columnSpacing={1} paddingLeft={multiple ? 3 : 0}>
        {treeGroup.children.toArray().map((c) => {
          if (typeof c[1] === "string") {
            return (
              <Grid item container xs className={multiple ? classes.child : ""} key={c[0]}>
                <FilterCondition
                  clauseId={c[0]}
                  path={childrenPath}
                />
              </Grid>
            );
          } else {
            return (
              <Grid item container xs className={multiple ? classes.child : ""} key={c[0]}>
                <FilterGroup
                  clauseId={c[0]}
                  path={childrenPath}
                />
              </Grid>
            );
          }
        })}
      </Grid>
    </Grid>
  )
}

export default FilterGroup;