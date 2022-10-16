import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box } from "@mui/system";

import { ResponsiveValues, useResponsive } from "../hooks";

import FilterBuilder from "../FilterBuilder/components/FilterBuilder";

import { ODataResponse, ODataGridBaseProps, IGridSortModel, IGridProps, ColumnVisibilityModel, Expand, ODataRowModel } from "../types";

import { ExpandToQuery, Flatten, GetPageNumber, GetPageSizeOrDefault } from "../utils";

import { defaultPageSize } from "../constants";
import { QueryStringCollection, FilterParameters } from "../FilterBuilder/types";
import { GridColumnVisibilityModel } from "@mui/x-data-grid";

const ODataGridBase = <ComponentProps extends IGridProps,
  SortModel extends IGridSortModel,
  ColDef,
  TRow,
  TDate,>(props: ODataGridBaseProps<ComponentProps, SortModel, ColDef, TRow, TDate>) => {

  const [pageNumber, setPageNumber] = useState<number>(GetPageNumber());
  const [pageSize, setPageSize] = useState<number>(GetPageSizeOrDefault(props.defaultPageSize));
  const [rows, setRows] = useState<ODataRowModel<TRow>[]>([])
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortModel, setSortModel] = useState<SortModel | undefined>(props.defaultSortModel);

  const [filter, setFilter] = useState<string>("");
  const [filterSelects, setFilterSelects] = useState<string[] | undefined>();
  const [compute, setCompute] = useState<string | undefined>();
  const [queryString, setQueryString] = useState<QueryStringCollection | undefined>();

  const [visibleColumns, setVisibleColumns] = useState<string[]>(props.columns
    .filter(c => (props.columnVisibilityModel && props.columnVisibilityModel[c.field] !== false) || c.hide !== true)
    .map(c => c.field)
  );
  const [columnVisibilityOverride, setColumnVisibilityOverride] = useState<ColumnVisibilityModel>({});

  const firstLoad = useRef<boolean>(true);
  const fetchCount = useRef<boolean>(true);
  const pendingFilter = useRef<boolean>(false);

  const r = useResponsive();

  const fetchData = useCallback(async () => {
    if (
      !filter
      && props.disableFilterBuilder !== true
      && props.filterBuilderProps?.disableHistory !== true
      && window.history.state
      && window.history.state.filterBuilder
      && window.history.state.filterBuilder.reset !== true
    ) {
      // stop fetch if there is no filter but there is one in history which will be/has been restored
      // this prevents a race condition between the initial data load and the query being restored
      return;
    }

    setLoading(true);

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

    query.append("$top", pageSize.toString());
    query.append("$skip", (pageNumber * pageSize).toString());

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
  },
    [
      pageNumber,
      pageSize,
      visibleColumns,
      sortModel,
      filter,
      filterSelects,
      compute,
      queryString,
      props.url,
      props.alwaysSelect,
      props.columns,
      props.$filter,
      props.disableFilterBuilder,
      props.filterBuilderProps?.disableHistory,
      props.requestOptions
    ]
  );


  const handleBuilderSubmit = useCallback((params: FilterParameters) => {
    pendingFilter.current = true;
    fetchCount.current = true;

    if (props.filterBuilderProps?.onSubmit) {
      props.filterBuilderProps.onSubmit(params);
    }

    setCompute(params.compute);
    setFilter(params.filter);
    setFilterSelects(params.select);
    setQueryString(params.queryString);
    setPageNumber(0);

    return { oDataGrid: { sortModel: sortModel } };
  }, [props.filterBuilderProps, sortModel]);

  const handleBuilderRestore = useCallback((params: FilterParameters, state: any) => {
    fetchCount.current = true;

    if (props.filterBuilderProps?.onRestoreState) {
      props.filterBuilderProps.onRestoreState(params, state);
    }

    if (props.disableHistory !== true) {
      if (state?.oDataGrid?.sortModel) {
        setSortModel(state.oDataGrid.sortModel as SortModel);
      } else {
        setSortModel(props.defaultSortModel);
      }
    }

    setCompute(params.compute);
    setFilter(params.filter);
    setFilterSelects(params.select);
    setQueryString(params.queryString);
  }, [props.filterBuilderProps, props.disableHistory, props.defaultSortModel]);

  useEffect(() => {
    fetchData()
  }, [fetchData]);

  const { onColumnVisibilityModelChange, onSortModelChange } = props;

  const handleSortModelChange = useCallback((model: SortModel, details) => {
    if (onSortModelChange) {
      onSortModelChange(model, details);
    }

    setSortModel(model);

    if (props.disableHistory !== true) {
      window.history.pushState({ ...window.history.state, oDataGrid: { sortModel: model } }, "");
    }
  }, [onSortModelChange, props.disableHistory]);

  useEffect(() => {
    let changed = false;

    const params = new URLSearchParams(window.location.search);

    // update page query string parameter
    const pageStr = params.get("page");
    if (pageStr) {
      const page = parseInt(pageStr, 10) - 1;
      // update if already exists and is different to settings
      if (page !== pageNumber) {
        if (pageNumber !== 0) {
          params.set("page", (pageNumber + 1).toString());
        } else {
          // remove if first page
          params.delete("page");
        }

        changed = true;
      }
    } else if (pageNumber !== 0) {
      // add if doesn't already exist and not on first page
      params.set("page", (pageNumber + 1).toString());
      changed = true;
    }

    // update page-size query string parameter
    const sizeStr = params.get("page-size");
    if (sizeStr) {
      const size = parseInt(sizeStr, 10);
      if (size !== pageSize) {
        if (pageSize !== (props.defaultPageSize ?? defaultPageSize)) {
          params.set("page-size", pageSize.toString());
        } else {
          params.delete("page-size");
        }

        changed = true;
      }
    } else if (pageSize !== (props.defaultPageSize ?? defaultPageSize)) {
      params.set("page-size", pageSize.toString());
      changed = true;
    }

    // only run if modified and not the first load
    if (changed && !firstLoad.current) {
      const search = params.toString();
      const url = search ? `${window.location.pathname}?${search}${window.location.hash}` : `${window.location.pathname}${window.location.hash}`;

      // replace the state instead of pushing if a state has already been pushed by a filter
      if (pendingFilter.current) {
        window.history.replaceState(window.history.state, "", url);
      } else {
        window.history.pushState(window.history.state, "", url);
      }
    }
  }, [pageNumber, pageSize, props.defaultPageSize]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);

      const pageVal = params.get("page");
      if (pageVal) {
        const page = parseInt(pageVal, 10) - 1;
        setPageNumber(page);
      } else if (pageNumber !== 0) {
        // reset to first page if not provided and not already on first page
        setPageNumber(0);
      }

      const sizeVal = params.get("page-size");
      if (sizeVal) {
        const size = parseInt(sizeVal, 10) - 1;
        setPageSize(size);
      } else if (pageSize !== props.defaultPageSize ?? defaultPageSize) {
        // reset to default if not provided and not already default
        setPageSize(props.defaultPageSize ?? defaultPageSize);
      }

      if (props.disableHistory !== true && props.disableFilterBuilder === true) {
        // only restore sort model from history if history is enabled and FilterBuilder is disabled
        // if FilterBuilder is enabled sort model restoration is handled in handleBuilderRestore
        if (e.state?.oDataGrid?.sortModel) {
          setSortModel(e.state.oDataGrid.sortModel as SortModel);
        } else {
          setSortModel(props.defaultSortModel);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pageNumber, pageSize, props.defaultPageSize, props.defaultSortModel, props.disableHistory, props.disableFilterBuilder]);

  const handlePageChange = useCallback((page: number) => {
    setPageNumber(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
  }, []);


  const visibility = useMemo(
    () => {
      const v: ColumnVisibilityModel = {};
      if (props.columnVisibilityModel) {
        for (const field in props.columnVisibilityModel) {
          if (field in columnVisibilityOverride) {
            v[field] = columnVisibilityOverride[field];
          } else if (typeof props.columnVisibilityModel[field] === "boolean") {
            v[field] = props.columnVisibilityModel[field] as boolean;
          } else {
            v[field] = r(props.columnVisibilityModel[field] as ResponsiveValues<boolean>) as boolean;
          }
        }
      } else {
        props.columns.filter(c => c.filterOnly !== true).forEach(c => {
          if (c.field in columnVisibilityOverride) {
            v[c.field] = columnVisibilityOverride[c.field];
          } else if (typeof c.hide === "boolean") {
            v[c.field] = !(c.hide as boolean);
          } else if (c.hide) {
            v[c.field] = !r(c.hide as ResponsiveValues<boolean>);
          }
        })
      }

      props.columns.filter(c => c.filterOnly === true).forEach(c => {
        v[c.field] = false;
      })

      return v;
    },
    [props.columnVisibilityModel, r, props.columns, columnVisibilityOverride]
  );

  const handleColumnVisibilityModelChange = useCallback((model: GridColumnVisibilityModel, details) => {
    if (onColumnVisibilityModelChange) {
      onColumnVisibilityModelChange(model, details);
    }

    // find the field which has been changed
    const column = Object.keys(model).find((key) => visibility[key] !== model[key]);
    if (column) {
      const visible = model[column];

      setColumnVisibilityOverride((v) => ({ ...v, [column]: visible }));
      if (visible) {
        setVisibleColumns((v) => [...v, column]);
      }
      else {
        setVisibleColumns((v) => v.filter(c => c !== column));
      }
    }
  }, [onColumnVisibilityModelChange, visibility]);

  const gridColumns = useMemo(() => props.columns.filter(c => c.filterOnly !== true), [props.columns]);

  const GridComponent = props.component;

  return (
    <Fragment>
      {
        props.$filter === undefined && props.disableFilterBuilder !== true &&
        <Box mb={2}>
          <FilterBuilder
            {...props.filterBuilderProps}
            schema={props.columns}
            onSubmit={handleBuilderSubmit}
            onRestoreState={handleBuilderRestore}
          />
        </Box>
      }

      <GridComponent
        autoHeight
        ref={React.createRef()}

        {...props}

        columns={gridColumns}

        rows={rows}
        rowCount={rowCount}

        pagination
        paginationMode="server"
        page={pageNumber}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disableColumnFilter

        loading={loading}

        columnVisibilityModel={visibility}
        onColumnVisibilityModelChange={handleColumnVisibilityModelChange}

        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
      />
    </Fragment>
  )
};

export default ODataGridBase;