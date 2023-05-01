import { Connective } from "./Connective"
import { Clause } from "./Clause"
import { SerialisedCondition } from "./Condition"

export type GroupClause = Clause & {
  connective: Connective
}

export type SerialisedGroup = Omit<GroupClause, "id"> & {
  children: (SerialisedGroup | SerialisedCondition)[]
}

export type TreeGroup = Clause & {
  children: TreeChildren
}

export type TreeChildren = Immutable.Map<string, TreeGroup | string>;