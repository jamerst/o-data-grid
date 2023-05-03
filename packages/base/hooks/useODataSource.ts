import React from "react"
import { GridApiCommon } from "@mui/x-data-grid"

import { FilterBuilderApi } from "../FilterBuilder/models"
import { ODataGridBaseProps } from "../types";

export const useODataSource = (props: ODataGridBaseProps, gridApiRef: React.MutableRefObject<GridApiCommon>, filterBuilderApiRef: React.MutableRefObject<FilterBuilderApi>) => {
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

  // setLoading(true);

  // select all fields for visible columns
  const fields = new Set(
    props.columns
      .filter(c => visibleColumns.includes(c.field) && c.expand === undefined && c.filterOnly !== true && c.type !== "actions")
      .map(c => c.select ?? c.field)
  );

  if (props.alwaysSelect) {
    props.alwaysSelect.forEach((c) => fields.add(c));
  }

  if (filterSelects) {
    filterSelects.forEach((s) => fields.add(s));
  }

  const expands = props.columns
    .filter(c => visibleColumns.includes(c.field) && c.expand)
    .map(c => c.expand!)
    .reduce((a: Expand[], b) => Array.isArray(b) ? a.concat(b) : [...a, b], []);

  const query = new URLSearchParams();
  if (fields.size > 0) {
    query.append("$select", Array.from(fields).join(","));
  }

  if (expands.length > 0) {
    query.append("$expand", ExpandToQuery(expands));
  }

  query.append("$top", paginationModel.pageSize.toString());
  query.append("$skip", (paginationModel.page * paginationModel.pageSize).toString());

  if (fetchCount.current) {
    query.append("$count", "true");
  }

  if (queryString) {
    for (const key in queryString) {
      query.append(key, queryString[key]);
    }
  }

  if (filter) {
    query.append("$filter", filter);
  } else if (props.$filter) {
    query.append("$filter", props.$filter);
  }

  if (compute) {
    query.append("$compute", compute);
  }

  if (sortModel && sortModel.length > 0) {
    const sortCols = sortModel
      .map(s => ({ col: props.columns.find(c => c.field === s.field), sort: s.sort }))
      .filter(c => c.col)
      .map(c => `${c.col!.sortField ?? c.col!.field}${c.sort === "desc" ? " desc" : ""}`);

    if (sortCols.length > 0) {
      query.append("$orderby", sortCols.join(","));
    }
  }

  const response = await fetch(props.url + "?" + query.toString(), props.requestOptions);
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
    setLoading(false);
    firstLoad.current = false;
    pendingFilter.current = false;
    fetchCount.current = false;
  } else {
    console.error(`API request failed: ${response.url}, HTTP ${response.status}`);
  }
}