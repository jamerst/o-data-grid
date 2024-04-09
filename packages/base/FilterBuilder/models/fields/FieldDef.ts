import { FormControlProps, SelectProps, TextFieldProps } from "@mui/material";
import { GridColDef, GridSingleSelectColDef } from "@mui/x-data-grid";
import { DatePickerProps, DateTimePickerProps, PickerValidDate } from "@mui/x-date-pickers";

import { FilterCompute, QueryStringCollection } from "../filters/translation";
import { Operation } from "../filters/";

/**
 * Utility type to get the filter field definition from a DataGrid column definition type
 */
type FieldDefFromColDef<TDate extends PickerValidDate, T extends GridColDef, K extends keyof T = never> =
  Pick<T, "field" | "headerName" | "type" | "filterable" | K> & {
    /**
     * Group for the field in the Autocomplete dropdown
     */
    autocompleteGroup?: string

    /**
     * If string comparisons are case sensitive
     */
    caseSensitive?: boolean,

    /**
     * If field is a collection (e.g. a one-to-many relation)
     */
    collection?: boolean,

    /**
     * Field definitions of the collection records
     */
    collectionFields?: CollectionFieldDef<TDate>[],

    /**
     * Field name to apply filter to (if different from field)
     */
    filterField?: string,

    /**
     * Supported filter operations
     */
    filterOperators?: Operation[],

    /**
     * Type of the field to be filtered (if different from type)
     */
    filterType?: string,

    /**
     * Perform a custom translation of the filter for this field
     * @param op Filter operation
     * @param value Filter value
     * @returns OData filter string, FilterCompute or false if unable to translate
     */
    getCustomFilterString?: (op: Operation, value: unknown) => string | FilterCompute | false,

    /**
     * Add custom query string parameters to the request when a filter is added for this field
     * @param op Filter operation
     * @param value Filter value
     * @returns Query string values to append to request
     */
    getCustomQueryString?: (op: Operation, value: unknown) => QueryStringCollection,

    /**
     * Label to use for field (if different from headerName or field)
     */
    label?: string,

    /**
     * If field is nullable
     */
    nullable?: boolean,

    /**
     * Provide a custom component for the filter value input
     * @param value Current filter value
     * @param setValue Function to set filter value
     * @returns React component for custom filter value input
     */
    renderCustomInput?: (value: any, setValue: (v: unknown) => void) => React.ReactElement,

    /**
     * Provide a custom component for the filter inputs (operation and value fields)
     * @param value Current filter value
     * @param setValue Function to set filter value
     * @returns React component for custom filter inputs
     */
    renderCustomFilter?: (value: any, setValue: (v: unknown) => void) => React.ReactElement,
  };

export type TextFieldDef<TDate extends PickerValidDate> = FieldDefFromColDef<TDate, GridColDef> & {
  textFieldProps?: TextFieldProps
}

export type SelectControlProps = {
  selectProps?: SelectProps,
  formControlProps?: FormControlProps,
  label?: string
}

export type SingleSelectFieldDef<TDate extends PickerValidDate> = FieldDefFromColDef<TDate, GridSingleSelectColDef, "valueOptions" | "getOptionValue" | "getOptionLabel"> & {
  selectProps?: SelectControlProps,
}

export type DateFieldDef<TDate extends PickerValidDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "date",
  datePickerProps?: DatePickerProps<TDate>,
}

export type DateTimeFieldDef<TDate extends PickerValidDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "dateTime",
  dateTimePickerProps?: DateTimePickerProps<TDate>,
}

export type BooleanFieldDef<TDate extends PickerValidDate> = FieldDefFromColDef<TDate, GridColDef> & {
  type: "boolean",
  selectProps?: SelectControlProps
}

/**
 * Definition for a filterable field in FilterBuilder
 */
export type FieldDef<TDate extends PickerValidDate> = TextFieldDef<TDate>
  | SingleSelectFieldDef<TDate>
  | DateFieldDef<TDate>
  | DateTimeFieldDef<TDate>
  | BooleanFieldDef<TDate>;

export type CollectionFieldDef<TDate extends PickerValidDate> = Omit<FieldDef<TDate>, "headerName" | "collection" | "collectionFields">;