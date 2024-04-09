import { useCallback, useState, useMemo } from "react"
import { DataGridProps, GridColumnVisibilityModel, GridInitialState } from "@mui/x-data-grid"

import { ODataGridBaseProps } from "../models";
import { ResponsiveValues, useResponsive } from "../hooks";
import { PickerValidDate } from "@mui/x-date-pickers";

/**
 * Add responsive column visibility support to DataGrid
 * @param props ODataGrid props
 * @returns Column visibility model to pass to DataGrid, and function to handle ColumnVisibilityModelChange event
 */
export const useResponsiveColumns = <ComponentProps extends DataGridProps, TDate extends PickerValidDate, TInitialState extends GridInitialState,>(props: ODataGridBaseProps<ComponentProps, TDate, TInitialState>) => {
  const [columnVisibilityOverride, setColumnVisibilityOverride] = useState<GridColumnVisibilityModel>({});

  const { columns, columnVisibilityModel, initialState, onColumnVisibilityModelChange } = props;

  const propModel = useMemo(() => columnVisibilityModel ?? initialState?.columns?.columnVisibilityModel,
    [columnVisibilityModel, initialState]
  );

  const r = useResponsive();
  const visibility = useMemo(
    () => {
      const v: GridColumnVisibilityModel = { ...columnVisibilityOverride };
      if (propModel) {
        for (const field in propModel) {
          if (field in columnVisibilityOverride) {
            continue;
          } else if (typeof propModel[field] === "boolean") {
            v[field] = propModel[field] as boolean;
          } else {
            v[field] = r(propModel[field] as ResponsiveValues<boolean>)!;
          }
        }
      }

      columns.filter(c => c.filterOnly === true).forEach(c => {
        v[c.field] = false;
      });

      return v;
    },
    [propModel, r, columns, columnVisibilityOverride]
  );

  const handleColumnVisibilityModelChange = useCallback((model: GridColumnVisibilityModel, details: any) => {
    if (onColumnVisibilityModelChange) {
      onColumnVisibilityModelChange(model, details);
    }

    // find the field which has been changed
    const column = Object.keys(model).find((key) => visibility[key] !== model[key]);
    if (column) {
      const visible = model[column];

      // set override for column - ignore responsive value if visibility manually changed
      setColumnVisibilityOverride((v) => ({ ...v, [column]: visible }));
    }
  }, [onColumnVisibilityModelChange, visibility]);

  return [visibility, handleColumnVisibilityModelChange];
}