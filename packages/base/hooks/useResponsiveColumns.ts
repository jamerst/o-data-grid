import { useCallback, useState, useMemo } from "react"
import { DataGridProps, GridColumnVisibilityModel } from "@mui/x-data-grid"

import { ODataGridBaseProps } from "../types";
import { ResponsiveValues, useResponsive } from "../hooks";

export const useResponsiveColumns = <ComponentProps extends DataGridProps, TDate,>(props: ODataGridBaseProps<ComponentProps, TDate>) => {
  const [columnVisibilityOverride, setColumnVisibilityOverride] = useState<GridColumnVisibilityModel>({});

  const { columns, columnVisibilityModel, onColumnVisibilityModelChange } = props;

  const r = useResponsive();
  const visibility = useMemo(
    () => {
      const v: GridColumnVisibilityModel = {};
      if (columnVisibilityModel) {
        for (const field in columnVisibilityModel) {
          if (field in columnVisibilityOverride) {
            v[field] = columnVisibilityOverride[field]; // use override if set
          } else if (typeof columnVisibilityModel[field] === "boolean") {
            v[field] = columnVisibilityModel[field] as boolean;
          } else {
            v[field] = r(columnVisibilityModel[field] as ResponsiveValues<boolean>)!;
          }
        }
      } else {
        columns.filter(c => c.filterOnly !== true).forEach(c => {
          if (c.field in columnVisibilityOverride) {
            v[c.field] = columnVisibilityOverride[c.field];
          }
        });
      }

      columns.filter(c => c.filterOnly === true).forEach(c => {
        v[c.field] = false;
      });

      return v;
    },
    [columnVisibilityModel, r, columns, columnVisibilityOverride]
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