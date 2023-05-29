import { useImperativeHandle, useRef } from "react";

import { FilterBuilderApi } from "../models";
import { Event } from "../events/Event";
import { TranslatedQueryResult } from "../models/filters/translation";

export const useFilterBuilderApiInitialization = (inputApiRef: React.Ref<FilterBuilderApi> | undefined) => {
  const apiRef = useRef() as React.MutableRefObject<FilterBuilderApi>;
  if (!apiRef.current) {
    apiRef.current = {
      onFilterChange: new Event<TranslatedQueryResult | undefined, object>(),
      setFilter: () => undefined
    };
  }

  useImperativeHandle(inputApiRef, () => apiRef.current, [apiRef]);

  return apiRef;
}