import React from "react"
import { ODataGridProps } from "types"
import ODataGridBase from "./ODataGridBase"
import { DataGrid } from "@mui/x-data-grid"

const ODataGrid = (props: ODataGridProps) => (
  <ODataGridBase
    {...props}
    component={DataGrid}
  />
)

export default ODataGrid;