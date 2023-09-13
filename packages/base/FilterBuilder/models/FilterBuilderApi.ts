import { Event } from "../events/Event";
import { OnFilterChangeEventArgs } from "../events/OnFilterChangeEventArgs";
import { SerialisedGroup } from "./filters";
import { TranslatedQueryResult } from "./filters/translation";

export interface FilterBuilderApi {
  filter?: TranslatedQueryResult,
  setFilter: (filter: SerialisedGroup | undefined) => void,
  onFilterChange: Event<OnFilterChangeEventArgs>
}