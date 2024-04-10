import React from "react";
import { DataGrid } from "@mui/x-data-grid";

import ODataGridBase from "../../base/components/ODataGridBase";

import { ODataGridProps } from "./ODataGridProps";

const ODataGridRaw = (props: ODataGridProps, ref: React.Ref<HTMLDivElement>) => (
  <ODataGridBase
    {...props}
    component={DataGrid}
    ref={ref}
  />
)

const ODataGrid = React.memo(React.forwardRef(ODataGridRaw));

export default ODataGrid;