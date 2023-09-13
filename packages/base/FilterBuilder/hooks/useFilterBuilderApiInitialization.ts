import { useImperativeHandle, useRef } from "react";

import { FilterBuilderApi } from "../models";
import { Event } from "../events/Event";
import { OnFilterChangeEventArgs } from "../events/OnFilterChangeEventArgs";

export const useFilterBuilderApiInitialization = (inputApiRef: React.Ref<FilterBuilderApi> | undefined) => {
  const apiRef = useRef() as React.MutableRefObject<FilterBuilderApi>;
  if (!apiRef.current) {
    apiRef.current = {
      onFilterChange: new Event<OnFilterChangeEventArgs>(),
      setFilter: (filter) => console.error("FilterBuilderApi.setFilter not yet initialised", filter)
    };
  }

  useImperativeHandle(inputApiRef, () => apiRef.current, [apiRef]);

  return apiRef;
}