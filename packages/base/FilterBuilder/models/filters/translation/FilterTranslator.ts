import { FieldDef } from "../../fields";
import { Operation } from "../";
import { PickerValidDate } from "@mui/x-date-pickers";

export type FilterTranslatorCollection<TDate extends PickerValidDate> = {
  [key in Operation | "default"]?: FilterTranslator<TDate>
}

/**
 * Interface for function to translate a condition to an OData filter string
 */
export type FilterTranslator<TDate extends PickerValidDate> = (params: FilterTranslatorParams<TDate>) => string | false;

export type FilterTranslatorParams<TDate extends PickerValidDate> = {
  schema: FieldDef<TDate>,
  field: string,
  op: Operation,
  value: any
}