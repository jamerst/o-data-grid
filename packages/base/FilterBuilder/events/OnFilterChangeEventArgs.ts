import { TranslatedQueryResult } from "../models/filters/translation"

export type OnFilterChangeEventArgs = {
  /**
   * The new filter
   */
  filter: TranslatedQueryResult | undefined,
  /**
   * If page should be reset back to first as a result of change
   */
  resetPage: boolean
}