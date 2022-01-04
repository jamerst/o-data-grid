import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box } from "@mui/system";
import { o, OdataQuery } from "odata"

import { ResponsiveValues, useResponsive } from "../hooks";

import FilterBuilder from "../FilterBuilder/components/FilterBuilder";

import { Expand, ODataGridBaseColDef, ODataResponse, ODataGridBaseProps, IGridSortModel, IGridProps, IGridRowModel } from "../types";

import { ExpandToQuery, Flatten, GroupArrayBy, GetPageNumber, GetPageSizeOrDefault } from "../utils";

import { defaultPageSize } from "../constants";
import { Group, QueryStringCollection } from "../FilterBuilder/types";

const ODataGridBase = <ComponentProps extends IGridProps,
  SortModel extends IGridSortModel,
  ColDef,>(props: ODataGridBaseProps<ComponentProps, SortModel, ColDef>) => {

  const [pageNumber, setPageNumber] = useState<number>(GetPageNumber());
  const [pageSize, setPageSize] = useState<number>(GetPageSizeOrDefault(props.defaultPageSize));
  const [rows, setRows] = useState<IGridRowModel[]>([])
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortModel, setSortModel] = useState<SortModel | undefined>(props.defaultSortModel);

  const [filter, setFilter] = useState<string>("");
  const [queryString, setQueryString] = useState<QueryStringCollection | undefined>();

  const [visibleColumns, setVisibleColumns] = useState<ODataGridBaseColDef<ColDef>[]>(props.columns.filter(c => c.hide !== true));
  const [columnHideOverrides, setColumnHideOverrides] = useState<{ [key: string]: boolean }>({});

  const firstLoad = useRef<boolean>(true);
  const fetchCount = useRef<boolean>(true);
  const pendingFilter = useRef<boolean>(false);

  const r = useResponsive();

  const fetchData = useCallback(async () => {
    if (
      !filter
      && props.disableFilterBuilder !== true
      && props.filterBuilderProps?.disableHistory !== true
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
      visibleColumns
        .filter(c => c.expand === undefined && c.filterOnly !== true)
        .map(c => c.select ?? c.field)
    );

    // add id field if specified
    if (props.idField) {
      fields.add(props.idField);
    }

    if (props.alwaysSelect) {
      props.alwaysSelect.forEach((c) => fields.add(c));
    }

    // group all expands by the navigation field
    const groupedExpands = GroupArrayBy(
      visibleColumns
        .filter(c => !!c.expand)
        .map(c => c.expand!),
      (e) => e.navigationField
    );

    // construct a single expand for each navigation field, combining nested query options
    const expands: Expand[] = [];
    groupedExpands.forEach((e, k) => {
      expands.push({
        navigationField: k,
        top: e[0].top,
        orderBy: e[0].orderBy,
        count: e.some(e2 => e2.count),
        select: Array.from(new Set(e.filter(e2 => e2.select).map(e2 => e2.select))).join(","),
      });
    });

    const $select = Array.from(fields).join(",");
    const $expand = expands.map(e => ExpandToQuery(e)).join(",");
    const $top = pageSize;
    const $skip = pageNumber * pageSize;

    let query: OdataQuery = {
      $select,
      $expand,
      $top,
      $skip,
      $count: fetchCount.current,
      ...queryString
    }

    if (filter) {
      query.$filter = filter;
    } else if (props.$filter) {
      query.$filter = props.$filter;
    }

    if (sortModel && sortModel.length > 0) {
      query.$orderby = sortModel.map(s => {
        const sortCol = props.columns.find(c => c.field === s.field);
        return `${sortCol!.sortField ?? sortCol!.field}${s.sort === "desc" ? " desc" : ""}`;
      }).join(",");
    }

    const rawResponse = await o(props.url)
      .get()
      .fetch(query);

    const response = rawResponse as Response;

    if (response?.ok ?? false) {
      let data = await response.json() as ODataResponse;

      // flatten object so that the DataGrid can access all the properties
      // i.e. { Person: { name: "John" } } becomes { "Person/name": "John" }
      let rows = data.value.map(v => Flatten(v, "/"));

      // extract id if data does not contain the "id" field already
      // DataGrid requires each row to have a unique "id" property
      if (props.idField) {
        rows = rows.map(r => { return { ...r, id: r[props.idField!] } });
      }

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
      queryString,
      props.url,
      props.idField,
      props.alwaysSelect,
      props.columns,
      props.$filter,
      props.disableFilterBuilder,
      props.filterBuilderProps?.disableHistory
    ]
  );


  const handleBuilderSubmit = useCallback((f: string, s: Group | undefined, q: QueryStringCollection | undefined) => {
    pendingFilter.current = true;
    fetchCount.current = true;

    if (props.filterBuilderProps?.onSubmit) {
      props.filterBuilderProps.onSubmit(f, s, q);
    }

    setFilter(f);
    setQueryString(q);
    setPageNumber(0);

    return { oDataGrid: { sortModel: sortModel } };
  }, [props.filterBuilderProps, sortModel]);

  const handleBuilderRestore = useCallback((f: string, s: Group | undefined, q: QueryStringCollection | undefined, state: any) => {
    fetchCount.current = true;

    if (props.filterBuilderProps?.onRestoreState) {
      props.filterBuilderProps.onRestoreState(f, s, q, state);
    }

    if (props.disableHistory !== true) {
      if (state.oDataGrid?.sortModel) {
        setSortModel(state.oDataGrid.sortModel as SortModel);
      } else {
        setSortModel(props.defaultSortModel);
      }
    }

    setFilter(f);
    setQueryString(q);
  }, [props.filterBuilderProps, props.disableHistory, props.defaultSortModel]);

  useEffect(() => {
    fetchData()
  }, [fetchData]);

  const { onColumnVisibilityChange, onSortModelChange } = props;

  const handleColumnVisibility = useCallback((params: any, event, details) => {
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(params, event, details);
    }

    if (visibleColumns) {
      if (params.isVisible) {
        // add to visibleColumns if column is now visible
        const index = props.columns.findIndex(c => c.field === params.field);
        if (index !== -1) {
          setColumnHideOverrides({ ...columnHideOverrides, [params.field]: false });

          setVisibleColumns([...visibleColumns, props.columns[index]]);
        } else {
          console.error(`Column ${params.field} not found`);
        }
      } else {
        // remove from visibleColumns if no longer visible
        const index = visibleColumns.findIndex(c => c.field === params.field);

        if (index !== -1) {
          setColumnHideOverrides({ ...columnHideOverrides, [params.field]: true });

          const newColumns = [...visibleColumns];
          newColumns.splice(index, 1);
          setVisibleColumns(newColumns);
        } else {
          console.error(`Column ${params.field} not found`);
        }
      }
    }
  }, [visibleColumns, props.columns, onColumnVisibilityChange, columnHideOverrides]);

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
        if (e.state.oDataGrid?.sortModel) {
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

  const handlePageSizeChange = useCallback((page: number) => {
    setPageSize(page);
  }, []);


  const columns = useMemo(() => props.columns.filter(c => c.filterOnly !== true).map((c) => {
    let hide: boolean | undefined;
    const override = columnHideOverrides[c.field];
    if (override !== undefined) {
      hide = override;
    } else if (typeof c.hide === "boolean") {
      hide = c.hide;
    } else if (c.hide) {
      const responsive = c.hide as ResponsiveValues<boolean>
      hide = r(responsive);
    }

    return { ...c, hide: hide };
  }), [props.columns, r, columnHideOverrides]);

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

        columns={columns}

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

        onColumnVisibilityChange={handleColumnVisibility}

        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
      />
    </Fragment>
  )
};

export default ODataGridBase;