import { ComputeSelect } from "./ComputeSelect"

/**
 * Translation result for a filter that also adds to the $select and $compute clauses
 */
export type FilterCompute = {
  filter: string,
  compute: string | ComputeSelect
}