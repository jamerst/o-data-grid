import React from "react"
import { ODataGridProps } from "./ODataGridProps"
import ODataGridBase from "../../base/components/ODataGridBase"
import { DataGrid } from "@mui/x-data-grid"

const ODataGrid = (props: ODataGridProps) => (
  <ODataGridBase
    {...props}
    component={DataGrid}
  />
)

export default ODataGrid;