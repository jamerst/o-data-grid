import { ConditionClause } from "./Condition";
import { GroupClause, TreeGroup } from "./Group";

export type StateClause = Immutable.Map<string, GroupClause | ConditionClause>;
export type StateTree = Immutable.Map<string, string | TreeGroup>;