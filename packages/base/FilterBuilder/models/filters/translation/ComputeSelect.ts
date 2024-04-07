/**
 * Translation result which adds to the $select and $compute clauses of the OData query
 */
export type ComputeSelect = {
  compute: string,
  select: string[]
}