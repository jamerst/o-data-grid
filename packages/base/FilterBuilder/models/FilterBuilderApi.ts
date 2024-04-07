import { Event } from "../events/Event";
import { OnFilterChangeEventArgs } from "../events/OnFilterChangeEventArgs";
import { SerialisedGroup } from "./filters";
import { TranslatedQueryResult } from "./filters/translation";

/**
 * API object for interacting with FilterBuilder and retrieving state
 */
export interface FilterBuilderApi {
  /**
   * Translation result from current filter, includes both OData query strings and serialised filter state
   */
  filter?: TranslatedQueryResult,

  /**
   * Set the current state of the FilterBuilder from a serialised filter
   * @param filter Serialised filter to set
   */
  setFilter: (filter: SerialisedGroup | undefined) => void,

  /**
   * Event raised when filter model is changed
   */
  onFilterChange: Event<OnFilterChangeEventArgs>
}