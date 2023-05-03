import { SerialisedGroup } from "../Group"
import { QueryStringCollection } from "./QueryStringCollection"

export type TranslatedInnerQuery = {
  filter?: string,
  compute?: string,
  select?: string[],
  queryString?: QueryStringCollection
}

export type TranslatedQuery<T> = TranslatedInnerQuery & {
  serialised: T
}

export type TranslatedQueryResult = TranslatedQuery<SerialisedGroup> & {
  filter: string
};