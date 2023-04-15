import React from "react";
import { DatePickerProps, DateTimePickerProps, LocalizationProviderProps } from "@mui/x-date-pickers";
import { AutocompleteProps, FormControlProps, SelectProps, TextFieldProps } from "@mui/material";
import { GridValueOptionsParams } from "@mui/x-data-grid";
import { ValueOption } from "../types";

export type ExternalBuilderProps<TDate = any> = {
  searchMenuItems?: ({ label: string, onClick: () => void })[],
  onSubmit?: (params: FilterParameters) => (void | any),
  onRestoreState?: (params: FilterParameters, state?: any) => void,
  localeText?: FilterBuilderLocaleText,

  autocompleteGroups?: string[],

  autocompleteProps?: AutocompleteProps<any, any, any, any>,
  datePickerProps?: DatePickerProps<TDate>,
  dateTimePickerProps?: DateTimePickerProps<TDate>,
  localizationProviderProps?: LocalizationProviderProps<TDate>,
  selectProps?: SelectProps,
  textFieldProps?: TextFieldProps,

  disableHistory?: boolean,

  filter?: SerialisedGroup
}

export type FilterParameters = {
  compute?: string,
  filter: string,
  queryString?: QueryStringCollection,
  select?: string[],
  serialised?: SerialisedGroup,
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

export type BaseFieldDef<TDate> = {
  field: string,
  autocompleteGroup?: string,
  caseSensitive?: boolean,

  datePickerProps?: DatePickerProps<TDate>,
  dateTimePickerProps?: DateTimePickerProps<TDate>,

  filterable?: boolean,
  filterField?: string,
  filterOperators?: Operation[],
  filterType?: string,

  getCustomFilterString?: (op: Operation, value: any) => string | FilterCompute | boolean,
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

export type FieldDef<TDate = any> = BaseFieldDef<TDate> & {
  headerName?: string,
  collection?: boolean,
  collectionFields?: CollectionFieldDef<TDate>[],
}

export type CollectionFieldDef<TDate = any> = BaseFieldDef<TDate>;

export type FilterCompute = {
  filter: string,
  compute: string | ComputeSelect
}

export type ComputeSelect = {
  compute: string,
  select: string[]
}

export type QueryStringCollection = {
  [key: string]: string
}

export type FilterTranslatorCollection<TDate> = {
  [key in Operation | "default"]?: FilterTranslator<TDate>
}

export type FilterTranslator<TDate> = (params: FilterTranslatorParams<TDate>) => string | boolean;

export type FilterTranslatorParams<TDate> = {
  schema: BaseFieldDef<TDate>,
  field: string,
  op: Operation,
  value: any
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

export type SerialisedGroup = Omit<GroupClause, "id"> & {
  children: (SerialisedGroup | SerialisedCondition)[]
}

export type SerialisedCondition = Omit<ConditionClause, "id" | "default">;