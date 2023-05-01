import { CollectionOperation } from "./CollectionOperation";
import { Operation } from "./Operation";
import { Clause } from "./Clause";

export type ConditionClause = Clause & {
  field: string,
  op: Operation;
  collectionOp?: CollectionOperation,
  collectionField?: string,
  value: any,
  default?: boolean
}

export type SerialisedCondition = Omit<ConditionClause, "id" | "default">;