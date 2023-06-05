import React, { Fragment, useCallback, useEffect, useState } from "react"
import { useSetRecoilState } from "recoil";
import { ArrowDropDown } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, MenuItem, MenuList, Paper, Popover } from "@mui/material";

import FilterGroup from "./FilterGroup";

import { clauseState, propsState, schemaState, treeState } from "../state"

import { initialClauses, initialTree, rootConditionUuid, rootGroupUuid } from "../constants"
import { deserialise } from "../utils";

import { useMountEffect } from "../../hooks";
import { useFilterBuilderApiInitialization, useODataFilter, useODataFilterWithState } from "../hooks";

import { FilterBuilderApi, FilterBuilderProps } from "../models";
import { ConditionClause, SerialisedGroup } from "../models/filters";
import { QueryStringCollection, TranslatedQueryResult } from "../models/filters/translation";

type FilterRootProps<TDate> = {
  props: FilterBuilderProps<TDate>
}

const FilterRootInner = <TDate,>({ props }: FilterRootProps<TDate>, ref?: React.ForwardedRef<FilterBuilderApi>) => {
  const setClauses = useSetRecoilState(clauseState);
  const setProps = useSetRecoilState(propsState);
  const setSchema = useSetRecoilState(schemaState);
  const setTree = useSetRecoilState(treeState);

  const odataFilter = useODataFilter();
  const odataFilterWithState = useODataFilterWithState();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const { onSubmit, onRestoreState, disableHistory } = props;

  const apiRef = useFilterBuilderApiInitialization(ref);

  const submit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = odataFilter();

    if (result?.filter) {
      const translatedResult: TranslatedQueryResult = { ...result, filter: result.filter };

      apiRef.current.filter = translatedResult;
      apiRef.current.onFilterChange.emit(translatedResult);

      if (onSubmit) {
        onSubmit(translatedResult);
      }
    } else {
      apiRef.current.filter = undefined;
      apiRef.current.onFilterChange.emit(undefined);

      if (onSubmit) {
        onSubmit(undefined);
      }
    }
  }, [onSubmit, odataFilter, apiRef]);

  const reset = useCallback(() => {
    setClauses(initialClauses.update(rootConditionUuid, (c) => ({ ...c as ConditionClause, field: props.schema[0].field })));
    setTree(initialTree);

    apiRef.current.filter = undefined;
    apiRef.current.onFilterChange.emit(undefined);

    if (onSubmit) {
      onSubmit(undefined);
    }
  }, [setClauses, setTree, onSubmit, props.schema, apiRef]);

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
      if (serialised) {
        onRestoreState({ compute, filter, queryString, select, serialised }, state);
      } else {
        onRestoreState(undefined, state);
      }
    }
  }, [onRestoreState, restoreDefault, setClauses, setTree]);

  const restoreFilter = useCallback((serialised: SerialisedGroup | undefined) => {
    if (!serialised) {
      restoreDefault();
      return;
    }

    const [tree, clauses] = deserialise(serialised);

    setClauses(clauses);
    setTree(tree);

    const result = odataFilterWithState(clauses, tree);

    if (result?.filter) {
      apiRef.current.onFilterChange.emit(result as TranslatedQueryResult);
      if (onRestoreState) {
        onRestoreState({ ...result, filter: result.filter ?? "" });
      }
    } else {
      apiRef.current.onFilterChange.emit(undefined);
      if (onRestoreState) {
        onRestoreState(undefined);
      }
    }
  }, [restoreDefault, setClauses, setTree, onRestoreState, odataFilterWithState, apiRef]);

  useEffect(() => {
    if (disableHistory !== true) {
      const handlePopState = (e: PopStateEvent) => { restoreState(e.state, true); };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [disableHistory, restoreState]);

  useEffect(() => {
    apiRef.current.setFilter = restoreFilter;
  }, [restoreFilter, apiRef]);

  useMountEffect(() => {
    setProps(props);

    // restore query from history state if enabled
    // if (disableHistory !== true && window.history.state && window.history.state.filterBuilder) {
    //   restoreState(window.history.state, false);
    // } else {
    //   restoreDefault();
    // }
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

const FilterRoot = React.forwardRef(FilterRootInner);
export default FilterRoot;