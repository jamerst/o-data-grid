import React from "react"
import { RecoilRoot } from "recoil";

import FilterRoot from "./FilterRoot";

import { ExternalBuilderProps, FieldDef } from "../types"

export type FilterBuilderProps<TDate = any> = ExternalBuilderProps<TDate> & {
  schema: FieldDef<TDate>[]
}

const FilterBuilder = <TDate,>(props: FilterBuilderProps<TDate>) => {
  return (
    <RecoilRoot override>
      <FilterRoot props={props}/>
    </RecoilRoot>
  );
}

export default FilterBuilder;