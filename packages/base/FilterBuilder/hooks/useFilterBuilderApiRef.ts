import { MutableRefObject, useRef } from "react";
import { FilterBuilderApi } from "../models";

export const useFilterBuilderApiRef = () => useRef({}) as MutableRefObject<FilterBuilderApi>;