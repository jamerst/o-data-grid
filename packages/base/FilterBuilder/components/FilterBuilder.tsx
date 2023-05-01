import React from "react"
import { RecoilRoot } from "recoil";

import FilterRoot from "./FilterRoot";

import { FilterBuilderApi, FilterBuilderProps } from "../models";

const FilterBuilderInner = <TDate,>(props: FilterBuilderProps<TDate>, ref?: React.ForwardedRef<FilterBuilderApi>) => {
  return (
    <RecoilRoot override>
      <FilterRoot props={props} ref={ref} />
    </RecoilRoot>
  );
}

const FilterBuilder = React.forwardRef(FilterBuilderInner);

export default FilterBuilder;