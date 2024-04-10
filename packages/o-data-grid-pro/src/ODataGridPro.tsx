import React from "react";
import { DataGridPro } from "@mui/x-data-grid-pro";

import ODataGridBase from "../../base/components/ODataGridBase";

import { ODataGridProProps } from "./ODataGridProProps";

const ODataGridRaw = (props: ODataGridProProps, ref: React.Ref<HTMLDivElement>) => (
  <ODataGridBase
    {...props}
    component={DataGridPro}
    ref={ref}
  />
)

const ODataGridPro = React.memo(React.forwardRef(ODataGridRaw));

export default ODataGridPro;