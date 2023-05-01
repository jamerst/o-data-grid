export type FilterBuilderLocaleText = {
  and?: string,
  or?: string,

  addCondition?: string,
  addGroup?: string,

  field?: string,
  operation?: string,
  value?: string,
  collectionOperation?: string,
  collectionField?: string,

  search?: string,
  reset?: string

  opAny?: string,
  opAll?: string,
  opCount?: string,

  opEq?: string,
  opNe?: string,
  opGt?: string,
  opLt?: string,
  opGe?: string,
  opLe?: string,
  opContains?: string,
  opNull?: string,
  opNotNull?: string
}
