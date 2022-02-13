import React from "react"
import { ODataGridProProps } from "./ODataGridProProps"
import ODataGridBase from "../../base/components/ODataGridBase"
import { DataGridPro } from "@mui/x-data-grid-pro"

const ODataGridPro = (props: ODataGridProProps) => (
  <ODataGridBase
    {...props}
    component={DataGridPro}
  />
)

export default ODataGridPro;