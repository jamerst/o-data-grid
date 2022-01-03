import React from "react"
import { RecoilRoot } from "recoil";

import FilterRoot from "./FilterRoot";

import { ExternalBuilderProps, FieldDef } from "../types"

export type FilterBuilderProps = ExternalBuilderProps & {
  schema: FieldDef[]
}

const FilterBuilder = (props: FilterBuilderProps) => {
  return (
    <RecoilRoot override>
      <FilterRoot props={props}/>
    </RecoilRoot>
  );
}

export default FilterBuilder;