import { QueryStringCollection } from "./QueryStringCollection"

export type BuiltInnerQuery = {
  filter?: string,
  compute?: string,
  select?: string[],
  queryString?: QueryStringCollection
}

export type BuiltQuery<T> = BuiltInnerQuery & {
  serialised: T
}