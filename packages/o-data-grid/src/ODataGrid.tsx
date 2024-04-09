import React from "react"
import { ODataGridProps } from "./ODataGridProps"
import ODataGridBase from "./base/components/ODataGridBase"
import { DataGrid } from "@mui/x-data-grid"

const ODataGridRaw = (props: ODataGridProps, ref: React.Ref<HTMLDivElement>) => (
  <ODataGridBase
    {...props}
    component={DataGrid}
    ref={ref}
  />
)

const ODataGrid = React.memo(React.forwardRef(ODataGridRaw));

export default ODataGrid;