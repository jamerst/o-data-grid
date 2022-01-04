import React from "react";
import { DatePickerProps, DateTimePickerProps, LocalizationProviderProps } from "@mui/lab";
import { AutocompleteProps, FormControlProps, SelectProps, TextFieldProps } from "@mui/material";
import { GridValueOptionsParams } from "@mui/x-data-grid";
import { ValueOption } from "../types";

export type ExternalBuilderProps = {
  searchMenuItems?: ({ label: string, onClick: () => void })[],
  onSubmit?: (filter: string, serialised: Group | undefined, queryString: QueryStringCollection | undefined) => (void | any),
  onRestoreState?: (filter: string, serialised: Group | undefined, queryString: QueryStringCollection | undefined, state: any) => void,
  localeText?: FilterBuilderLocaleText,

  autocompleteGroups?: string[],

  autocompleteProps?: AutocompleteProps<any, any, any, any>,
  datePickerProps?: DatePickerProps,
  dateTimePickerProps?: DateTimePickerProps,
  localizationProviderProps?: LocalizationProviderProps,
  selectProps?: SelectProps,
  textFieldProps?: TextFieldProps,

  disableHistory?: boolean
}

export type FilterBuilderLocaleText = {
  and?: string,
  or?: string,

  addCondition?: string,
  addGroup?: string,

  field?: string,
  operation?: string,
  value?: string,
  collectionOperation?: string,
  collectionField?: string,

  search?: string,
  reset?: string

  opAny?: string,
  opAll?: string,
  opCount?: string,

  opEq?: string,
  opNe?: string,
  opGt?: string,
  opLt?: string,
  opGe?: string,
  opLe?: string,
  opContains?: string,
  opNull?: string,
  opNotNull?: string
}

export type BaseFieldDef = {
  field: string,
  autocompleteGroup?: string,
  caseSensitive?: boolean,

  datePickerProps?: DatePickerProps,
  dateTimePickerProps?: DateTimePickerProps,

  filterable?: boolean,
  filterField?: string,
  filterOperators?: Operation[],
  filterType?: string,

  getCustomFilterString?: (op: Operation, value: any) => string,
  getCustomQueryString?: (op: Operation, value: any) => QueryStringCollection,

  label?: string,
  nullable?: boolean,

  selectProps?: { selectProps?: SelectProps, formControlProps?: FormControlProps, label?: string },
  sortField?: string,
  textFieldProps?: TextFieldProps,

  renderCustomInput?: (value: any, setValue: (v: any) => void) => React.ReactNode,
  renderCustomFilter?: (value: any, setValue: (v: any) => void) => React.ReactNode,

  type?: string,
  valueOptions?: ValueOption[] | ((params: GridValueOptionsParams) => ValueOption[]),
}

export type FieldDef = BaseFieldDef & {
  headerName?: string,
  collection?: boolean,
  collectionFields?: CollectionFieldDef[],
}

export type CollectionFieldDef = BaseFieldDef;

export type QueryStringCollection = {
  [key: string]: string
}

export type Connective = "and" | "or"

export type Operation = "eq" | "ne" | "gt" | "lt" | "ge" | "le" | "contains" | "null" | "notnull"

export type CollectionOperation = "any" | "all" | "count"

type Clause = {
  id: string
}

export type GroupClause = Clause & {
  connective: Connective
}

export type ConditionClause = Clause & {
  field: string,
  op: Operation;
  collectionOp?: CollectionOperation,
  collectionField?: string,
  value: any,
  default?: boolean
}

export type TreeGroup = Clause & {
  children: TreeChildren
}

export type TreeChildren = Immutable.Map<string, TreeGroup | string>;

export type StateClause = Immutable.Map<string, GroupClause | ConditionClause>;
export type StateTree = Immutable.Map<string, string | TreeGroup>;

export type Group = Omit<GroupClause, "id"> & {
  children: (Group | Condition)[]
}

export type Condition = Omit<ConditionClause, "id" | "default">