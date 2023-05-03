import { FieldDef } from "../../fields";
import { Operation } from "../";

export type FilterTranslatorCollection<TDate> = {
  [key in Operation | "default"]?: FilterTranslator<TDate>
}

export type FilterTranslator<TDate> = (params: FilterTranslatorParams<TDate>) => string | false;

export type FilterTranslatorParams<TDate> = {
  schema: FieldDef<TDate>,
  field: string,
  op: Operation,
  value: any
}