import React from "react";

import FilterRoot from "./FilterRoot";

import { FilterBuilderApi, FilterBuilderProps } from "../models";

const FilterBuilderInner = <TDate,>(props: FilterBuilderProps<TDate>, ref?: React.ForwardedRef<FilterBuilderApi>) => {
  return (
    <FilterRoot props={props} ref={ref} />
  );
}

const FilterBuilder = React.forwardRef(FilterBuilderInner);

export default FilterBuilder;

// Redeclare forwardRef to support generic components
// Sourced from https://stackoverflow.com/a/58473012/6725789
declare module "react" {
  function forwardRef<T, P = unknown>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}