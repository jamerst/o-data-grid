import React, { useImperativeHandle, useMemo } from "react";
import { Box } from "@mui/material";
import { DataGridProps, useGridApiRef, GridInitialState, GridValidRowModel } from "@mui/x-data-grid";

import { ODataGridBaseProps } from "../models";

import { useODataSource } from "../hooks/useODataSource";
import { useHistoryStates } from "../hooks/useHistoryStates";
import { useResponsiveColumns } from "../hooks/useResponsiveColumns";

import FilterBuilder from "../FilterBuilder/components/FilterBuilder";
import { useFilterBuilderApiRef } from "../FilterBuilder/hooks";
import { PickerValidDate } from "@mui/x-date-pickers";

const ODataGridBaseRaw = <ComponentProps extends DataGridProps,
  TRow extends GridValidRowModel,
  TDate extends PickerValidDate,
  TInitialState extends GridInitialState,>(props: ODataGridBaseProps<ComponentProps, TDate, TInitialState, TRow>, ref: React.Ref<HTMLDivElement>) => {
  const gridApiRef = useGridApiRef();
  const filterApiRef = useFilterBuilderApiRef();

  useImperativeHandle(props.apiRef, () => ({ ...gridApiRef.current, ...filterApiRef.current }), [gridApiRef, filterApiRef]);

  const { loading, rows, rowCount } = useODataSource(props, gridApiRef, filterApiRef);
  useHistoryStates(props, gridApiRef, filterApiRef);

  const [columnVisibilityModel, handleColumnVisibilityModelChange] = useResponsiveColumns(props);
  const gridColumns = useMemo(() => props.columns.filter(c => c.filterOnly !== true), [props.columns]);

  const GridComponent = props.component;

  return (
    <>
      {
        props.$filter === undefined && props.disableFilterBuilder !== true &&
        <Box mb={2}>
          <FilterBuilder
            {...props.filterBuilderProps}
            schema={props.columns}
            initialState={props.initialState}
            apiRef={filterApiRef}
          />
        </Box>
      }
      <GridComponent
        autoHeight
        ref={ref}

        {...props}

        apiRef={gridApiRef}

        columns={gridColumns}
        disableColumnFilter

        rows={rows}
        rowCount={rowCount}

        pagination
        paginationMode="server"

        loading={loading}

        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={handleColumnVisibilityModelChange}

        sortingMode="server"
      />
    </>
  )
};

const ODataGridBase = React.forwardRef(ODataGridBaseRaw);

export default ODataGridBase;