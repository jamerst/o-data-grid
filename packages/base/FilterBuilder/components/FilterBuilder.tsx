import React from "react";

import FilterRoot from "./FilterRoot";

import { FilterBuilderProps } from "../models";

const FilterBuilder = <TDate,>(props: FilterBuilderProps<TDate>) => {
  return (
    <FilterRoot props={props} />
  );
}

// const FilterBuilder = React.forwardRef(FilterBuilderInner);

export default FilterBuilder;

// Redeclare forwardRef to support generic components
// Sourced from https://stackoverflow.com/a/58473012/6725789
// declare module "react" {
//   function forwardRef<T, P = unknown>(
//     render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
//   ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
// }