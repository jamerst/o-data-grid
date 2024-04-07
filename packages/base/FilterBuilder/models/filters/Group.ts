import { Connective } from "./Connective"
import { Clause } from "./Clause"
import { SerialisedCondition } from "./Condition"

/**
 * A group of filter conditions or nested filter groups
 */
export type GroupClause = Clause & {
  connective: Connective,
  negated: boolean
}

/**
 * The serialised structure of a group (includes the tree structure of children)
 */
export type SerialisedGroup = Omit<GroupClause, "id"> & {
  children: (SerialisedGroup | SerialisedCondition)[]
}

/**
 * Representation of a group in the state tree
 */
export type TreeGroup = Clause & {
  children: TreeChildren
}

export type TreeChildren = Immutable.Map<string, TreeGroup | string>;