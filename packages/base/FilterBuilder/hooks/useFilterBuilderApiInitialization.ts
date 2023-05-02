import { useImperativeHandle, useRef } from "react";

import { FilterBuilderApi } from "../models";

export const useFilterBuilderApiInitialization = (inputApiRef: React.Ref<FilterBuilderApi> | undefined) => {
  const apiRef = useRef() as React.MutableRefObject<FilterBuilderApi>;
  if (!apiRef.current) {
    apiRef.current = {};
  }

  useImperativeHandle(inputApiRef, () => apiRef.current, [apiRef]);

  return apiRef;
}