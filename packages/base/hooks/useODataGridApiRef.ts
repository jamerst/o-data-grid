import { MutableRefObject, useRef } from "react";
import { ODataGridApi } from "../models";

export const useODataGridApiRef = () => useRef({}) as MutableRefObject<ODataGridApi>;