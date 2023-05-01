import { SerialisedGroup } from "./filters";

export interface FilterBuilderApi {
  filter?: SerialisedGroup,
  setFilter?: (filter: SerialisedGroup) => void
}