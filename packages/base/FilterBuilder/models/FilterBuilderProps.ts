import { AutocompleteProps, SelectProps, TextFieldProps } from "@mui/material";
import { DatePickerProps, DateTimePickerProps, LocalizationProviderProps } from "@mui/x-date-pickers";

import { FilterBuilderLocaleText } from "."
import { FieldDef } from "./fields";
import { TranslatedQueryResult } from "./filters/translation";
import { SerialisedGroup } from "./filters";

export type FilterBuilderProps<TDate> = {
  schema: FieldDef<TDate>[],

  initialState?: FilterBuilderInitialState,

  searchMenuItems?: ({ label: string, onClick: () => void })[],
  onSubmit?: (query: TranslatedQueryResult | undefined) => void,
  onRestoreState?: (query: TranslatedQueryResult | undefined, state?: any) => void,
  localeText?: FilterBuilderLocaleText,

  autocompleteGroups?: string[],

  autocompleteProps?: AutocompleteProps<any, any, any, any>,
  datePickerProps?: DatePickerProps<TDate>,
  dateTimePickerProps?: DateTimePickerProps<TDate>,
  localizationProviderProps?: LocalizationProviderProps<TDate>,
  selectProps?: SelectProps,
  textFieldProps?: TextFieldProps,

  disableHistory?: boolean
}

type FilterInitialState = {
  filterModel?: SerialisedGroup
}

export type FilterBuilderInitialState = {
  filterBuilder?: FilterInitialState
}