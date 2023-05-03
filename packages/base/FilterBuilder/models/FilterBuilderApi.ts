import { Event } from "../events/Event";
import { SerialisedGroup } from "./filters";

export interface FilterBuilderApi {
  filter?: SerialisedGroup,
  setFilter?: (filter: SerialisedGroup) => void,
  onFilterChange: Event<SerialisedGroup>
}