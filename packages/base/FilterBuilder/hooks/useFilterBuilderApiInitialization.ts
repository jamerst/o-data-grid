import { useImperativeHandle, useRef } from "react";

import { FilterBuilderApi } from "../models";
import { Event } from "../events/Event";
import { SerialisedGroup } from "../models/filters";

export const useFilterBuilderApiInitialization = (inputApiRef: React.Ref<FilterBuilderApi> | undefined) => {
  const apiRef = useRef() as React.MutableRefObject<FilterBuilderApi>;
  if (!apiRef.current) {
    apiRef.current = {
      onFilterChange: new Event<SerialisedGroup>()
    };
  }

  useImperativeHandle(inputApiRef, () => apiRef.current, [apiRef]);

  return apiRef;
}