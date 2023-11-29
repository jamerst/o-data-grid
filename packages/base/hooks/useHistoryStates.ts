import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { DataGridProps, GridApiCommon, GridSortModel, gridPaginationModelSelector, gridSortModelSelector, GridInitialState } from "@mui/x-data-grid"

import { FilterBuilderApi } from "../FilterBuilder/models"
import { ODataGridBaseProps } from "../types";
import { defaultPageSize as _defaultPageSize } from "../constants";
import { useMountEffect } from "../hooks";
import { SerialisedGroup } from "../FilterBuilder/models/filters";

export const useHistoryStates = <ComponentProps extends DataGridProps, TDate, TInitialState extends GridInitialState>(props: ODataGridBaseProps<ComponentProps, TDate, TInitialState>,
  gridApiRef: React.MutableRefObject<GridApiCommon>,
  filterBuilderApiRef: React.MutableRefObject<FilterBuilderApi>
) => {
  const stateRestored = useRef(false);

  const defaultPageSize = useMemo(
    () => props.initialState?.pagination?.paginationModel?.pageSize ?? _defaultPageSize,
    [props.initialState]
  );

  //#region Create history states
  const getHistoryState = useCallback(() => ({
    filterBuilder: filterBuilderApiRef.current.filter,
    oDataGrid: {
      sortModel: gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId)
    }
  }), [filterBuilderApiRef, gridApiRef]);

  const pushState = useCallback(() => {
    // prevent state being overwritten straight after restoring
    if (stateRestored.current) {
      stateRestored.current = false;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);

    const pageStr = params.get("page");
    if (pageStr) {
      const page = parseInt(pageStr, 10) - 1;
      // update if already exists and is different to settings
      if (page !== paginationModel.page) {
        if (paginationModel.page !== 0) {
          params.set("page", (paginationModel.page + 1).toString());
        } else {
          // remove if first page
          params.delete("page");
        }
      }
    } else if (paginationModel.page !== 0) {
      // add if doesn't already exist and not on first page
      params.set("page", (paginationModel.page + 1).toString());
    }

    const sizeStr = params.get("page-size");
    if (sizeStr) {
      const size = parseInt(sizeStr, 10);
      if (size !== paginationModel.pageSize) {
        if (paginationModel.pageSize !== defaultPageSize) {
          params.set("page-size", paginationModel.pageSize.toString());
        } else {
          params.delete("page-size");
        }
      }
    } else if (paginationModel.pageSize !== defaultPageSize) {
      params.set("page-size", paginationModel.pageSize.toString());
    }

    const search = params.toString();
    const url = search
      ? `${window.location.pathname}?${search}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    const state = getHistoryState();

    window.history.pushState(state, "", url);
  }, [gridApiRef, defaultPageSize, getHistoryState]);

  const timeout = useRef<number | null>(null);
  const pushStateDebounced = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(pushState, 50);
  }, [pushState]);

  useEffect(() => {
    if (props.disableHistory || !gridApiRef.current?.subscribeEvent || !filterBuilderApiRef.current?.onFilterChange) {
      return;
    }

    const listener = () => pushStateDebounced();

    // store cleanup methods returned by subscribe methods for calling later
    const cleanup = [
      filterBuilderApiRef.current.onFilterChange.on(listener),
      gridApiRef.current.subscribeEvent("paginationModelChange", listener),
      gridApiRef.current.subscribeEvent("sortModelChange", listener),
    ];

    return () => cleanup.forEach(c => c());
  }, [props.disableHistory, filterBuilderApiRef, gridApiRef, pushStateDebounced]);
  //#endregion

  //#region Restore state from history
  const restoreState = useCallback((state: ODataGridState) => {
    if (state.filter !== false) {
      filterBuilderApiRef.current.setFilter(state.filter);
    }

    if (state.sortModel !== false) {
      gridApiRef.current.setSortModel(state.sortModel);
    }

    // set page after sort model - changing sort model will reset page
    if (state.page !== false) {
      gridApiRef.current.setPage(state.page);
    }

    if (state.pageSize !== false) {
      gridApiRef.current.setPageSize(state.pageSize)
    }
  }, [filterBuilderApiRef, gridApiRef]);

  const restoreFromBrowserState = useCallback((state: any, firstLoad: boolean) => {
    stateRestored.current = true;

    const newState: ODataGridState = {
      filter: false,
      sortModel: false,
      page: false,
      pageSize: false
    };

    const fromInitialState = !firstLoad && state?.initialState === true;

    if (fromInitialState && props.initialState?.filterBuilder?.filterModel) {
      newState.filter = props.initialState.filterBuilder.filterModel;
    } else if (state?.filterBuilder) {
      newState.filter = state.filterBuilder.serialised;
    } else if (filterBuilderApiRef.current.filter && !firstLoad) {
      newState.filter = undefined;
    }

    if (fromInitialState && props.initialState?.sorting?.sortModel) {
      newState.sortModel = props.initialState.sorting.sortModel;
    } else if (state?.oDataGrid?.sortModel) {
      newState.sortModel = state.oDataGrid.sortModel;
    } else if (gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId)) {
      // remove sort model if one is currently set
      newState.sortModel = [];
    }

    const params = new URLSearchParams(window.location.search);
    const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
    if (fromInitialState && props.initialState?.pagination?.paginationModel?.page) {
      newState.page = props.initialState.pagination.paginationModel.page;
    } else {
      const pageStr = params.get("page");
      if (pageStr) {
        newState.page = parseInt(pageStr, 10) - 1;
      } else if (paginationModel.page !== 0) {
        newState.page = 0;
      }
    }

    if (fromInitialState && props.initialState?.pagination?.paginationModel?.pageSize) {
      newState.pageSize = props.initialState.pagination.paginationModel.pageSize;
    } else {
      const sizeStr = params.get("page-size");
      if (sizeStr) {
        newState.pageSize = parseInt(sizeStr, 10);
      } else if (paginationModel.pageSize !== defaultPageSize) {
        newState.pageSize = defaultPageSize;
      }
    }

    restoreState(newState);

  }, [defaultPageSize, filterBuilderApiRef, gridApiRef, props.initialState, restoreState]);

  useEffect(() => {
    if (props.disableHistory !== true) {
      const handlePopState = (e: PopStateEvent) => restoreFromBrowserState(e.state, false);

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [restoreFromBrowserState, props.disableHistory]);

  useMountEffect(() => {
    // set flag if history entry does not contain any state and the initial state prop is being used
    // used to restore the initial state when this history state is popped
    if (!window.history.state?.filterBuilder && (props.initialState?.filterBuilder?.filterModel || props.initialState?.sorting?.sortModel || props.initialState?.pagination?.paginationModel)) {
      window.history.replaceState({ ...window.history.state, initialState: true }, "");
    }

    restoreFromBrowserState(window.history.state, true);
  });
  //#endregion
}

type ODataGridState = {
  filter: SerialisedGroup | undefined | false,
  sortModel: GridSortModel | false,
  page: number | false,
  pageSize: number | false
}