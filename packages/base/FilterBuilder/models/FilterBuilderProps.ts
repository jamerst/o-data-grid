import { AutocompleteProps, SelectProps, TextFieldProps } from "@mui/material";
import { DatePickerProps, DateTimePickerProps, LocalizationProviderProps } from "@mui/x-date-pickers";

import { FilterBuilderApi, FilterBuilderLocaleText } from "."
import { FieldDef } from "./fields";
import { TranslatedQueryResult } from "./filters/translation";
import { SerialisedGroup } from "./filters";

export type FilterBuilderProps<TDate> = {
  /**
   * Filterable field definitions
   */
  schema: FieldDef<TDate>[],

  /**
   * The initial state of the filter builder when mounted
   */
  initialState?: FilterBuilderInitialState,

  /**
   * Options to add to dropdown menu next to search button
   */
  searchMenuItems?: ({ label: string, onClick: () => void })[],

  /**
   * Function to be called when filter is submitted
   * @param query Filter state translated to OData query
   */
  onSubmit?: (query: TranslatedQueryResult | undefined) => void,
  /**
   * Function to be called when the FilterBuilder state is restored from a history entry
   * @param query Filter state translated to OData query
   * @param state State object that was restored
   */
  onRestoreState?: (query: TranslatedQueryResult | undefined, state?: any) => void,

  /**
   * Localisation text
   */
  localeText?: FilterBuilderLocaleText,

  /**
   * Group names for the filter field dropdown
   */
  autocompleteGroups?: string[],

  /**
   * Props to pass to the Autocomplete components (for the field and collection field dropdowns)
   */
  autocompleteProps?: AutocompleteProps<any, any, any, any>,
  /**
   * Props to pass to the DatePicker component for the filter value
   */
  datePickerProps?: DatePickerProps<TDate>,
  /**
   * Props to pass to the DateTimePicker component for the filter value
   */
  dateTimePickerProps?: DateTimePickerProps<TDate>,
  /**
   * LocalizationProviderProps for DatePicker and DateTimePicker
   */
  localizationProviderProps?: LocalizationProviderProps<TDate>,
  /**
   * Props to pass to the Select component for the filter value
   */
  selectProps?: SelectProps,
  /**
   * Props to pass to the TextField component for the filter value
   */
  textFieldProps?: TextFieldProps,

  /**
   * Disable history state creation when set to true
   */
  disableHistory?: boolean,

  /**
   * Ref for API object which allows interacting with FilterBuilder programmatically
   */
  apiRef?: React.MutableRefObject<FilterBuilderApi>
}

type FilterInitialState = {
  filterModel?: SerialisedGroup
}

export type FilterBuilderInitialState = {
  filterBuilder?: FilterInitialState
}