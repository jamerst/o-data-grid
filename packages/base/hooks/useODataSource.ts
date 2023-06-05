import React, { useCallback, useEffect, useRef, useState } from "react"
import { DataGridProps, GridApiCommon, gridPaginationModelSelector, gridSortModelSelector } from "@mui/x-data-grid"

import { FilterBuilderApi } from "../FilterBuilder/models"
import { ODataGridBaseProps, ODataResponse, ODataRowModel } from "../types";
import { ExpandToQuery, Flatten } from "../utils";

export const useODataSource = <ComponentProps extends DataGridProps, TRow, TDate,>(props: ODataGridBaseProps<ComponentProps, TDate>,
  gridApiRef: React.MutableRefObject<GridApiCommon>,
  filterBuilderApiRef: React.MutableRefObject<FilterBuilderApi>
) => {
  const fetchCount = useRef(true);
  const fetchedColumns = useRef<string[]>([]);
  const forceFetch = useRef(false);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ODataRowModel<TRow>[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const { alwaysSelect, columns, columnVisibilityModel, $filter, url, requestOptions } = props;
  const getRows = useCallback(async () => {
    // if (
    //   !filter
    //   && props.disableFilterBuilder !== true
    //   && props.filterBuilderProps?.disableHistory !== true
    //   && window.history.state
    //   && window.history.state.filterBuilder
    //   && window.history.state.filterBuilder.reset !== true
    // ) {
    //   // stop fetch if there is no filter but there is one in history which will be/has been restored
    //   // this prevents a race condition between the initial data load and the query being restored
    //   return;
    // }

    const responsiveColumns = columnVisibilityModel
    ? Object.keys(columnVisibilityModel).filter(k => typeof columnVisibilityModel[k] !== "boolean")
    : [];

    // only select columns that are visible or are responsive
    const columnsToFetch = gridApiRef.current.getVisibleColumns()
      .filter(c => c.type !== "actions")
      .map(c => c.field)
      .concat(responsiveColumns);

    // prevent fetch if only column visibility changed and same columns as last time - happens when columns change
    // visibility due to responsiveness
    if (!forceFetch.current && !columnsToFetch.some(c => !fetchedColumns.current.includes(c))) {
      return;
    }

    forceFetch.current = false;
    setLoading(true);

    fetchedColumns.current = columnsToFetch;

    // select all fields for visible columns
    const fields = new Set(
      columns
        .filter(c => columnsToFetch.includes(c.field) && c.expand === undefined && c.filterOnly !== true && c.type !== "actions")
        .map(c => c.select ?? c.field)
    );

    if (alwaysSelect) {
      alwaysSelect.forEach((c) => fields.add(c));
    }

    const filterSelect = filterBuilderApiRef.current.filter?.select;
    if (filterSelect?.length) {
      filterSelect.forEach((s) => fields.add(s));
    }

    const expands = columns
      .filter(c => columnsToFetch.includes(c.field) && c.expand)
      .flatMap(c => Array.isArray(c.expand) ? c.expand! : [c.expand!]);

    const query = new URLSearchParams();
    if (fields.size > 0) {
      query.append("$select", Array.from(fields).join(","));
    }

    if (expands.length > 0) {
      query.append("$expand", ExpandToQuery(expands));
    }

    const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
    query.append("$top", paginationModel.pageSize.toString());
    query.append("$skip", (paginationModel.page * paginationModel.pageSize).toString());

    if (fetchCount.current) {
      query.append("$count", "true");
    }

    const queryString = filterBuilderApiRef.current.filter?.queryString;
    if (queryString) {
      for (const key in queryString) {
        query.append(key, queryString[key]);
      }
    }

    const filter = filterBuilderApiRef.current.filter?.filter;
    if (filter) {
      query.append("$filter", filter);
    } else if ($filter) {
      query.append("$filter", $filter);
    }

    const compute = filterBuilderApiRef.current.filter?.compute;
    if (compute) {
      query.append("$compute", compute);
    }

    const sortModel = gridSortModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
    if (sortModel && sortModel.length > 0) {
      const sortCols = sortModel
        .map(s => ({ col: columns.find(c => c.field === s.field), sort: s.sort }))
        .filter(c => c.col)
        .map(c => `${c.col!.sortField ?? c.col!.field}${c.sort === "desc" ? " desc" : ""}`);

      if (sortCols.length > 0) {
        query.append("$orderby", sortCols.join(","));
      }
    }

    const response = await fetch(url + "?" + query.toString(), requestOptions);
    if (response.ok) {
      const data = await response.json() as ODataResponse<TRow>;

      // flatten object so that the DataGrid can access all the properties
      // i.e. { Person: { name: "John" } } becomes { "Person/name": "John" }
      // keep the original object in the "result" property so that it can still be accessed via strong typing
      const rows: ODataRowModel<TRow>[] = data.value.map((v) => ({ result: v, ...Flatten(v, "/") }));

      if (data["@odata.count"]) {
        setRowCount(data["@odata.count"]);
      }

      setRows(rows);
      // gridApiRef.current.setRows(rows);

      setLoading(false);
      // firstLoad.current = false;
      // pendingFilter.current = false;
      fetchCount.current = false;
    } else {
      console.error(`API request failed: ${response.url}, HTTP ${response.status}`);
    }
  }, [filterBuilderApiRef, gridApiRef, alwaysSelect, columns, columnVisibilityModel, $filter, requestOptions, url]);

  const timeout = useRef<number | null>(null);
  const getRowsDebounced = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(getRows, 50);
  }, [getRows]);

  const firstRender = useRef(true);
  useEffect(() => {
    const onFilterChange = () => {
      const paginationModel = gridPaginationModelSelector(gridApiRef.current.state, gridApiRef.current.instanceId);
      if (paginationModel.page !== 0) {
        gridApiRef.current.setPaginationModel({ ...paginationModel, page: 0 });
      }

      forceFetch.current = true;
      getRowsDebounced();
    };

    const listener = (force: boolean) => {
      if (force) {
        forceFetch.current = true;
      }

      getRowsDebounced();
    }

    const cleanup = [
      filterBuilderApiRef.current.onFilterChange.on(onFilterChange),
      gridApiRef.current.subscribeEvent("columnVisibilityModelChange", () => listener(false)),
      gridApiRef.current.subscribeEvent("paginationModelChange", () => listener(true)),
      gridApiRef.current.subscribeEvent("sortModelChange", () => listener(true)),
    ];

    if (firstRender.current) {
      getRowsDebounced();
      firstRender.current = false;
    }

    return () => cleanup.forEach(c => c());
  }, [filterBuilderApiRef, gridApiRef, getRowsDebounced]);

  return { loading, rows, rowCount };
}