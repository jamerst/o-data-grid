import { FormControlProps, SelectProps, TextFieldProps } from "@mui/material";
import { GridColDef, GridSingleSelectColDef } from "@mui/x-data-grid";
import { DatePickerProps, DateTimePickerProps } from "@mui/x-date-pickers";

import { FilterCompute, QueryStringCollection } from "../filters/translation";
import { Operation } from "../filters/";

type FieldDefFromColDef<TDate, T extends GridColDef, K extends keyof T = never> =
  Pick<T, "field" | "headerName" | "type" | "filterable" | K> & {
    autocompleteGroup?: string
    caseSensitive?: boolean,
    collection?: boolean,
    collectionFields?: CollectionFieldDef<TDate>[],

    filterField?: string,
    filterOperators?: Operation[],
    filterType?: string,

    getCustomFilterString?: (op: Operation, value: any) => string | FilterCompute | boolean,
    getCustomQueryString?: (op: Operation, value: any) => QueryStringCollection,

    label?: string,
    nullable?: boolean,

    renderCustomInput?: (value: any, setValue: (v: any) => void) => React.ReactNode,
    renderCustomFilter?: (value: any, setValue: (v: any) => void) => React.ReactNode,

    sortField?: string,
  };

export type TextFieldDef<TDate> = FieldDefFromColDef<TDate, GridColDef> & {
  textFieldProps?: TextFieldProps
}

export type SelectControlProps = {
  selectProps?: SelectProps,
  formControlProps?: FormControlProps,
  label?: string
}

export type SingleSelectFieldDef<TDate> = FieldDefFromColDef<TDate, GridSingleSelectColDef, "valueOptions" | "getOptionValue" | "getOptionLabel"> & {
  selectProps?: SelectControlProps,
}

export type DateFieldDef<TDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "date",
  datePickerProps?: DatePickerProps<TDate>,
}

export type DateTimeFieldDef<TDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "datetime",
  dateTimePickerProps?: DateTimePickerProps<TDate>,
}

export type BooleanFieldDef<TDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "boolean",
  selectProps?: SelectControlProps
}

export type FieldDef<TDate> = TextFieldDef<TDate>
  | SingleSelectFieldDef<TDate>
  | DateFieldDef<TDate>
  | DateTimeFieldDef<TDate>
  | BooleanFieldDef<TDate>;

export type CollectionFieldDef<TDate> = Omit<FieldDef<TDate>, "headerName" | "collection" | "collectionFields">;