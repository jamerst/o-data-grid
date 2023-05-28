import { Event } from "../events/Event";
import { SerialisedGroup } from "./filters";
import { TranslatedQuery } from "./filters/translation";

export interface FilterBuilderApi {
  filter?: TranslatedQuery<SerialisedGroup>,
  setFilter?: (filter: SerialisedGroup) => void,
  onFilterChange: Event<TranslatedQuery<SerialisedGroup> | undefined, object>
}