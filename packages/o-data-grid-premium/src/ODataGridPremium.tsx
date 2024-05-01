import React from "react";
import { DataGridPremium } from "@mui/x-data-grid-premium";

import ODataGridBase from "../../base/components/ODataGridBase";

import { ODataGridPremiumProps } from "./ODataGridPremiumProps";

const ODataGridRaw = (props: ODataGridPremiumProps, ref: React.Ref<HTMLDivElement>) => (
  <ODataGridBase
    {...props}
    component={DataGridPremium}
    ref={ref}
    pagination
  />
)

const ODataGridPremium = React.memo(React.forwardRef(ODataGridRaw));

export default ODataGridPremium;