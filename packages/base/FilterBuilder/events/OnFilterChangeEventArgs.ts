import { TranslatedQueryResult } from "../models/filters/translation"

export type OnFilterChangeEventArgs = {
  filter: TranslatedQueryResult | undefined,
  resetPage: boolean
}