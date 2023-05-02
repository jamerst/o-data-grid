import { AutocompleteProps, SelectProps, TextFieldProps } from "@mui/material";
import { DatePickerProps, DateTimePickerProps, LocalizationProviderProps } from "@mui/x-date-pickers";

import { FilterBuilderLocaleText } from "."
import { FieldDef } from "./fields";
import { SerialisedGroup } from "./filters";
import { TranslatedQuery } from "./filters/translation";

export type FilterBuilderProps<TDate> = {
  schema: FieldDef<TDate>[],

  searchMenuItems?: ({ label: string, onClick: () => void })[],
  onSubmit?: (query: TranslatedQuery<SerialisedGroup> | null) => (void | any),
  onRestoreState?: (query: TranslatedQuery<SerialisedGroup> | null, state?: any) => void,
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