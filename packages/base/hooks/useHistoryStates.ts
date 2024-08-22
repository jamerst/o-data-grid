import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { DataGridProps, GridApiCommon, GridSortModel, gridPaginationModelSelector, gridSortModelSelector, GridInitialState } from "@mui/x-data-grid"
import { useLocation, useNavigate } from "react-router-dom"

import { FilterBuilderApi } from "../FilterBuilder/models"
import { ODataGridBaseProps } from "../models";
import { useMountEffect } from "../hooks";
import { SerialisedGroup } from "../FilterBuilder/models/filters";
import { PickerValidDate } from "@mui/x-date-pickers";

/**
 * Create entries in the browser history for interactions with the DataGrid and
 * FilterBuilder, and automatically restore the state from the history entries
 * when navigating backwards/forwards
 * @param props ODataGrid props
 * @param gridApiRef DataGrid API object
 * @param filterBuilderApiRef FilterBuilder API object
 */
export const useHistoryStates = <ComponentProps extends DataGridProps, TDate extends PickerValidDate, TInitialState extends GridInitialState>(props: ODataGridBaseProps<ComponentProps, TDate, TInitialState>,
  gridApiRef: React.MutableRefObject<GridApiCommon>,
  filterBuilderApiRef: React.MutableRefObject<FilterBuilderApi>
) => {
  const stateRestored = useRef(false);
  const fromMountEffect = useRef(false);
  fromMountEffect.current = false; // reset flag on every render to ensure subsequent interactions do push a history state

  const statePushed = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const defaultPageSize = useMemo(
    () => props.initialState?.pagination?.paginationModel?.pageSize,
    [props.initialState]
  );

  const stateKey = useMemo(() => props.historyStateKey ?? "oDataGrid", [props.historyStateKey]);

  //#region Create history states
  const getHistoryState = useCallback(() => ({
    [stateKey]: {
      filterBuilder: filterBuilderApiRef.current?.filter,
      sortModel: gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId)
    }
  }), [filterBuilderApiRef, gridApiRef, stateKey]);

  const pushState = useCallback(() => {
    // prevent state being pushed on mount when DataGrid state is being set (e.g. setting page number from query string)
    if (fromMountEffect.current) {
      return;
    }

    // prevent state being overwritten straight after restoring
    if (stateRestored.current) {
      stateRestored.current = false;
      return;
    }

    //#region Set query string parameters for pagination
    const params = new URLSearchParams(location.search);
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
    //#endregion

    const search = params.toString();
    const url = search
      ? `${location.pathname}?${search}${location.hash}`
      : `${location.pathname}${location.hash}`;

    const state = getHistoryState();

    statePushed.current = true;
    navigate(url, { state: state });
  }, [gridApiRef, defaultPageSize, getHistoryState, location, navigate]);

  const timeout = useRef<number | null>(null);
  const pushStateDebounced = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    timeout.current = setTimeout(pushState, 50);
  }, [pushState]);

  useEffect(() => {
    // attach to events for FilterBuilder and DataGrid to trigger history entry creation
    if (props.disableHistory || !gridApiRef.current?.subscribeEvent) {
      return;
    }

    const listener = () => pushStateDebounced();

    // store cleanup methods returned by subscribe methods for calling later
    const cleanup = [
      gridApiRef.current.subscribeEvent("paginationModelChange", listener),
      gridApiRef.current.subscribeEvent("sortModelChange", listener),
    ];

    if (filterBuilderApiRef.current?.onFilterChange) {
      cleanup.push(filterBuilderApiRef.current.onFilterChange.on(listener));
    }

    return () => cleanup.forEach(c => c());
  }, [props.disableHistory, filterBuilderApiRef, gridApiRef, pushStateDebounced]);
  //#endregion

  //#region Restore state from history
  const restoreState = useCallback((state: ODataGridState) => {
    // set the state of the FilterBuilder and DataGrid using the API objects
    if (state.filter !== false && filterBuilderApiRef.current?.setFilter) {
      filterBuilderApiRef.current.setFilter(state.filter);
    }

    if (state.sortModel !== false) {
      gridApiRef.current.setSortModel(state.sortModel);
    }

    // set page after sort model - changing sort model will reset page number
    if (state.page !== false) {
      gridApiRef.current.setPage(state.page);
    }

    if (state.pageSize !== false) {
      gridApiRef.current.setPageSize(state.pageSize)
    }
  }, [filterBuilderApiRef, gridApiRef]);

  const restoreFromBrowserState = useCallback((state: any, firstLoad: boolean) => {
    // get the component state from the browser history entry state object and restore it

    if (statePushed.current) {
      statePushed.current = false;
      return;
    }

    stateRestored.current = true;

    const newState: ODataGridState = {
      filter: false,
      sortModel: false,
      page: false,
      pageSize: false
    };


    if (!state && props.initialState?.filterBuilder?.filterModel) {
      newState.filter = props.initialState.filterBuilder.filterModel;
    } else if (state?.filterBuilder) {
      newState.filter = state.filterBuilder.serialised;
    } else if (filterBuilderApiRef.current.filter && !firstLoad) {
      newState.filter = undefined;
    }

    if (!state && props.initialState?.sorting?.sortModel) {
      newState.sortModel = props.initialState.sorting.sortModel;
    } else if (state?.sortModel) {
      newState.sortModel = state.sortModel;
    } else if (gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId).length && !firstLoad) {
      // remove sort model if one is currently set
      newState.sortModel = [];
    }

    const params = new URLSearchParams(location.search);
    const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
    if (!state && props.initialState?.pagination?.paginationModel?.page) {
      newState.page = props.initialState.pagination.paginationModel.page;
    } else {
      const pageStr = params.get("page");
      if (pageStr) {
        const page = parseInt(pageStr, 10) - 1;
        if (page !== paginationModel.page) {
          newState.page = page;
        }
      } else if (paginationModel.page !== 0) {
        newState.page = 0;
      }
    }

    if (!state && props.initialState?.pagination?.paginationModel?.pageSize) {
      newState.pageSize = props.initialState.pagination.paginationModel.pageSize;
    } else {
      const sizeStr = params.get("page-size");
      if (sizeStr) {
        const pageSize = parseInt(sizeStr, 10);
        if (pageSize !== paginationModel.pageSize) {
          newState.pageSize = pageSize;
        }
      } else if (defaultPageSize && paginationModel.pageSize !== defaultPageSize) {
        newState.pageSize = defaultPageSize;
      }
    }

    restoreState(newState);
  }, [defaultPageSize, filterBuilderApiRef, gridApiRef, props.initialState, restoreState, location]);

  useEffect(() => {
    if (props.disableHistory !== true && !fromMountEffect.current) {
      restoreFromBrowserState(location.state ? location.state[stateKey] : undefined, false);
    }
  }, [restoreFromBrowserState, props.disableHistory, stateKey, location]);

  useMountEffect(() => {
    fromMountEffect.current = true;

    restoreFromBrowserState(location.state ? location.state[stateKey] : undefined, true);

    if (!location.state || !(stateKey in location.state)) {
      // reset flag if actually first load (and not navigating back from another page to a history state with
      // component state stored in it)

      // prevents issues where first interaction won't push a history state, or duplicate states being pushed when
      // navigating back
      stateRestored.current = false;
    }

  });
  //#endregion
}

type ODataGridState = {
  filter: SerialisedGroup | undefined | false,
  sortModel: GridSortModel | false,
  page: number | false,
  pageSize: number | false
}