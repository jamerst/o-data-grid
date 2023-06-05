import React, { useCallback, useEffect, useRef } from "react"
import { DataGridProps, GridApiCommon, GridSortModel, gridPaginationModelSelector, gridSortModelSelector } from "@mui/x-data-grid"

import { FilterBuilderApi } from "../FilterBuilder/models"
import { ODataGridBaseProps } from "../types";
import { defaultPageSize } from "../constants";

export const useHistoryStates = <ComponentProps extends DataGridProps, TDate,>(props: ODataGridBaseProps<ComponentProps, TDate>,
  gridApiRef: React.MutableRefObject<GridApiCommon>,
  filterBuilderApiRef: React.MutableRefObject<FilterBuilderApi>
) => {
  const stateRestored = useRef(false);

  //#region Create history states
  const getHistoryState = useCallback(() => ({
    filterBuilder: filterBuilderApiRef.current.filter,
    oDataGrid: {
      sortModel: gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId)
    }
  }), [filterBuilderApiRef, gridApiRef]);

  const _defaultPageSize = props.initialState?.pagination?.paginationModel?.pageSize ?? defaultPageSize;

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
        if (paginationModel.pageSize !== _defaultPageSize) {
          params.set("page-size", paginationModel.pageSize.toString());
        } else {
          params.delete("page-size");
        }
      }
    } else if (paginationModel.pageSize !== _defaultPageSize) {
      params.set("page-size", paginationModel.pageSize.toString());
    }

    const search = params.toString();
    const url = search
      ? `${window.location.pathname}?${search}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    const state = getHistoryState();

    window.history.pushState(state, "", url);
  }, [gridApiRef, _defaultPageSize, getHistoryState]);

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

    const cleanup = [
      filterBuilderApiRef.current.onFilterChange.on(listener),
      gridApiRef.current.subscribeEvent("paginationModelChange", listener),
      gridApiRef.current.subscribeEvent("sortModelChange", listener),
    ];

    return () => cleanup.forEach(c => c());
  }, [props.disableHistory, filterBuilderApiRef, gridApiRef, pushStateDebounced]);
  //#endregion

  //#region Restore state from history
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      stateRestored.current = true;

      const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
      const sortModel = gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);

      const params = new URLSearchParams(window.location.search);

      const pageStr = params.get("page");
      if (pageStr) {
        const page = parseInt(pageStr, 10) - 1;
        gridApiRef.current.setPage(page);
      } else if (paginationModel.page !== 0) {
        gridApiRef.current.setPage(0);
      }

      const sizeStr = params.get("page-size");
      if (sizeStr) {
        const size = parseInt(sizeStr, 10);
        gridApiRef.current.setPageSize(size);
      } else if (paginationModel.pageSize !== _defaultPageSize) {
        gridApiRef.current.setPageSize(_defaultPageSize);
      }

      if (e.state?.filterBuilder) {
        filterBuilderApiRef.current.setFilter(e.state.filterBuilder.serialised);
      } else if (filterBuilderApiRef.current.filter) {
        filterBuilderApiRef.current.setFilter(undefined);
      }

      if (e.state?.oDataGrid?.sortModel) {
        gridApiRef.current.setSortModel(e.state.oDataGrid.sortModel as GridSortModel)
      } else if (sortModel) {
        gridApiRef.current.setSortModel([]);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [gridApiRef, filterBuilderApiRef, _defaultPageSize]);
  //#endregion
}