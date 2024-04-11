import { useRef } from "react";

import { InternalODataGridApi } from "../models";

export const useInternalODataGridApiRef = () => {
  const apiRef = useRef() as React.MutableRefObject<InternalODataGridApi>;
  if (!apiRef.current) {
    apiRef.current = {
      reload: () => {
        console.error("InternalODataGridApi.reload not yet initialised");
        return Promise.resolve();
      }
    };
  }

  return apiRef;
}