import { SerialisedGroup } from "../Group"
import { QueryStringCollection } from "./QueryStringCollection"

/**
 * The translation result of the FilterBuilder state, with the $filter, $compute and $select clauses, and custom query
 * string values
 */
export type TranslatedInnerQuery = {
  filter?: string,
  compute?: string,
  select?: string[],
  queryString?: QueryStringCollection
}

/**
 * The translation result of the FilterBuilder state, including the serialised state
 */
export type TranslatedQuery<T> = TranslatedInnerQuery & {
  serialised: T
}

/**
 * The translation result of the FilterBuilder state
 */
export type TranslatedQueryResult = TranslatedQuery<SerialisedGroup> & {
  filter: string
};

export const isDifferent = (a: TranslatedQuery<SerialisedGroup> | undefined, b: TranslatedQuery<SerialisedGroup> | undefined) =>
  !!a !== !!b
  || a?.compute !== b?.compute
  || a?.filter !== b?.filter
  || a?.queryString !== b?.queryString
  || a?.select !== b?.select;