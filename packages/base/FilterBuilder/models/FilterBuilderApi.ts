import { Event } from "../events/Event";
import { SerialisedGroup } from "./filters";
import { TranslatedQueryResult } from "./filters/translation";

export interface FilterBuilderApi {
  filter?: TranslatedQueryResult,
  setFilter: (filter: SerialisedGroup | undefined) => void,
  onFilterChange: Event<TranslatedQueryResult | undefined>
}