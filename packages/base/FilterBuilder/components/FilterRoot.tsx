import React, { Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useSetRecoilState } from "recoil";
import { ArrowDropDown } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, MenuItem, MenuList, Paper, Popover } from "@mui/material";

import FilterGroup from "./FilterGroup";

import { clauseState, propsState, schemaState, treeState } from "../state"

import { initialClauses, initialTree, rootConditionUuid, rootGroupUuid } from "../constants"
import { FilterBuilderProps } from "./FilterBuilder";
import { UseODataFilter, UseODataFilterWithState } from "../hooks";
import { useMountEffect } from "../../hooks";
import { ConditionClause, SerialisedGroup, QueryStringCollection, FilterBuilderApi } from "../types";
import { deserialise } from "../utils";

type FilterRootProps<TDate> = {
  props: FilterBuilderProps<TDate>
}

const FilterRoot = <TDate,>({ props }: FilterRootProps<TDate>) => {
  const setClauses = useSetRecoilState(clauseState);
  const setProps = useSetRecoilState(propsState);
  const setSchema = useSetRecoilState(schemaState);
  const setTree = useSetRecoilState(treeState);

  const odataFilter = UseODataFilter();
  const odataFilterWithState = UseODataFilterWithState();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const { onSubmit, onRestoreState, disableHistory, apiRef: inputApiRef } = props;

  const apiRef = useRef() as React.MutableRefObject<FilterBuilderApi>;
  console.debug("FilterRoot", apiRef.current);
  if (apiRef.current === undefined) {
    console.debug("setting");
    apiRef.current = {};
  }

  useImperativeHandle(inputApiRef, () => apiRef.current, [apiRef]);

  const submit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      const result = odataFilter();

      if (result.filter) {
        apiRef.current.filter = result.serialised;
        const returned = onSubmit({ ...result, filter: result.filter });

        if (disableHistory !== true) {
          window.history.pushState(
            {
              ...window.history.state,
              ...returned,
              filterBuilder: {
                filter: result.filter,
                compute: result.compute,
                select: result.select,
                serialised: result.serialised,
                queryString: result.queryString
              }
            },
            ""
          );
        }
      }
    }
  }, [onSubmit, odataFilter, disableHistory]);

  const reset = useCallback(() => {
    setClauses(initialClauses.update(rootConditionUuid, (c) => ({ ...c as ConditionClause, field: props.schema[0].field })));
    setTree(initialTree);

    if (onSubmit) {
      onSubmit({ filter: "" });
    }

    if (disableHistory !== true) {
      window.history.pushState({
        ...window.history.state,
        filterBuilder: {
          reset: true
        }
      }, "");
    }
  }, [setClauses, setTree, onSubmit, props.schema, disableHistory]);

  const handleReset = useCallback(() => reset(), [reset]);

  useEffect(() => {
    setSchema(props.schema);
  }, [props.schema, setSchema]);

  const restoreDefault = useCallback(() => {
    setClauses(initialClauses.update(rootConditionUuid, (c) => ({ ...c as ConditionClause, field: props.schema[0].field })));
    setTree(initialTree);
  }, [props.schema, setClauses, setTree]);

  const restoreState = useCallback((state: any, isPopstate: boolean) => {
    let filter = "", serialised, queryString, compute, select;

    if (state?.filterBuilder) {
      if (state.filterBuilder.reset === true && isPopstate === true) {
        restoreDefault();
      }

      compute = state.filterBuilder.compute as string;
      filter = state.filterBuilder.filter as string;
      select = state.filterBuilder.select as string[];
      serialised = state.filterBuilder.serialised as SerialisedGroup;
      queryString = state.filterBuilder.queryString as QueryStringCollection;
    } else {
      restoreDefault();
    }

    if (filter && serialised) {
      const [tree, clauses] = deserialise(serialised);

      setClauses(clauses);
      setTree(tree);
    }

    if (onRestoreState) {
      onRestoreState({ compute, filter, queryString, select, serialised}, state);
    }
  }, [onRestoreState, restoreDefault, setClauses, setTree]);

  const restoreFilter = useCallback((serialised: SerialisedGroup) => {
    const [tree, clauses] = deserialise(serialised);

    setClauses(clauses);
    setTree(tree);

    if (onRestoreState) {
      const result = odataFilterWithState(clauses, tree);

      onRestoreState({ ...result, filter: result.filter ?? "" });
    }
  }, [setClauses, setTree, onRestoreState, odataFilterWithState]);

  useEffect(() => {
    if (disableHistory !== true) {
      const handlePopState = (e: PopStateEvent) => { restoreState(e.state, true); };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [disableHistory, restoreState]);

  useEffect(() => {
    apiRef.current.setFilter = restoreFilter;
  }, [restoreFilter]);

  // useEffect(() => {
  //   if (propsFilter) {
  //     restoreFilter(propsFilter);
  //   } else {
  //     restoreDefault(3);
  //   }
  // }, [propsFilter, restoreFilter, restoreDefault]);

  useMountEffect(() => {
    setProps(props);

    // restore query from history state if enabled
    if (disableHistory !== true && window.history.state && window.history.state.filterBuilder) {
      restoreState(window.history.state, false);
    // } else if (propsFilter) {
    //   restoreFilter(propsFilter);
    } else {
      restoreDefault();
    }
  });

  return (
    <Fragment>
      <form onSubmit={submit}>
        <FilterGroup
          clauseId={rootGroupUuid}
          path={[]}
          root
        />

        <Grid container spacing={1}>
          <Grid item>
            <ButtonGroup variant="contained" color="primary">
              <Button type="submit">Search</Button>
              {
                props.searchMenuItems &&
                <Button
                  size="small"
                  onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setAnchor(e.currentTarget)}
                  aria-controls={anchor !== null ? "search-menu": undefined}
                  aria-expanded={anchor !== null ? "true": undefined}
                  aria-haspopup="menu"
                >
                  <ArrowDropDown/>
                </Button>
              }
            </ButtonGroup>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleReset}>Reset</Button>
          </Grid>
        </Grid>
        {
          props.searchMenuItems &&
          <Popover
            anchorEl={anchor}
            open={anchor !== null}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            onClose={() => setAnchor(null)}
            transitionDuration={100}
          >
            <Paper>
              <MenuList id="search-menu">
                {props.searchMenuItems.map((item, i) => (
                  <MenuItem
                    key={`searchMenu_${i}`}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </MenuItem>))}
              </MenuList>
            </Paper>
          </Popover>
        }
      </form>

    </Fragment>
  );
}

export default FilterRoot;