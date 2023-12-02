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

export const isDifferent = (a: TranslatedQuery<SerialisedGroup> | undefined, b: TranslatedQuery<SerialisedGroup> | undefined) =>
  !!a !== !!b
  || a?.compute !== b?.compute
  || a?.filter !== b?.filter
  || a?.queryString !== b?.queryString
  || a?.select !== b?.select;