import React, { Fragment, useMemo } from "react"
import { useRecoilValue } from "recoil";
import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, TextField, TextFieldProps } from "@mui/material";
import { ValueOptions } from "@mui/x-data-grid";
import { DatePicker, DatePickerProps, DatePickerSlotsComponentsProps, DateTimePicker, DateTimePickerProps, DateTimePickerSlotsComponentsProps, LocalizationProvider } from "@mui/x-date-pickers";

import { propsState, schemaState } from "../state"
import { getLocaleText } from "../utils";
import { allOperators, numericOperators } from "../constants";

import { FieldDef, CollectionFieldDef, SingleSelectFieldDef, DateFieldDef, DateTimeFieldDef, TextFieldDef, SelectControlProps, BooleanFieldDef } from "../models/fields";
import { CollectionOperation, Operation } from "../models/filters";


type FilterInputsProps = {
  clauseId: string,
  field: string,
  onFieldChange: (oldField: string, currentOp: Operation, newField: string) => void,
  op: Operation,
  onOpChange: (op: Operation) => void,
  value?: string,
  onValueChange: (v: any) => void,
  collectionOp?: CollectionOperation,
  onCollectionOpChange: (op: CollectionOperation) => void,
  collectionField?: string,
  onCollectionFieldChange: (field: string, oldField: string | undefined, currentOp: Operation, newField: string | undefined) => void,
}

const FilterInputs = <TDate,>({
  clauseId,
  field,
  onFieldChange,
  op,
  onOpChange,
  value,
  onValueChange,
  collectionOp,
  onCollectionOpChange,
  collectionField,
  onCollectionFieldChange
}: FilterInputsProps) => {

  const schema = useRecoilValue(schemaState) as FieldDef<TDate>[];
  const builderProps = useRecoilValue(propsState);

  const dateAdapter = useMemo(() => builderProps.localizationProviderProps?.dateAdapter, [builderProps]);

  // create augmented fieldDef with pre-computed data (e.g. extract props for form components based on field type)
  const fieldDef = useMemo(() => {
    if (!field && schema.length < 1) {
      return null;
    }

    const f = findFieldDef(field, schema);

    const fieldDef = getAugmentedFieldDef(f);
    fieldDef.colField = f.collection === true && collectionField && f.collectionFields?.length
      ? getAugmentedFieldDef(findFieldDef(collectionField, f.collectionFields))
      : undefined;

    if (fieldDef.colField) {
      fieldDef.type = fieldDef.colField.type;
      fieldDef.options = fieldDef.colField.options;

      if (collectionOp !== "count") {
        fieldDef.ops = fieldDef.colField.filterOperators ?? allOperators;
      } else {
        fieldDef.ops = numericOperators;
        fieldDef.type = "number";
      }
    }

    return fieldDef;
  }, [field, collectionField, collectionOp, schema]);

  const fieldOptions = useMemo(() => schema
    .filter(c => c.filterable !== false && c.type !== "actions")
    .map(c => ({ label: c.label ?? c.headerName ?? c.field, field: c.field, group: c.autocompleteGroup ?? "" }))
    .sort((a, b) => builderProps.autocompleteGroups ?
      builderProps.autocompleteGroups.indexOf(a.group) - builderProps.autocompleteGroups.indexOf(b.group)
      : a.group.localeCompare(b.group)),
    [schema, builderProps]
  );

  const dateValue = useMemo(() => {
    if (fieldDef && (fieldDef.type === "date" || fieldDef.type === "datetime")) {
      if (typeof value === "string") {
        return new dateAdapter!().date(value);
      } else {
        return value as TDate;
      }
    } else {
      return null;
    }
  }, [fieldDef, value, dateAdapter]);

  const datePickerSlotProps = useMemo(() => ({
    textField: { fullWidth: true, size: "small", ...builderProps.textFieldProps, ...fieldDef?.textFieldProps }
  }), [builderProps, fieldDef]);

  if (schema.length < 1 || !fieldDef) {
    return null;
  }

  return (
    <Fragment>
      <Grid item xs={12} md={fieldDef.collection ? true : 4}>
        <Autocomplete
          size="small"
          {...builderProps.autocompleteProps}
          options={fieldOptions}
          renderInput={(params) => <TextField label={getLocaleText("field", builderProps.localeText)} {...builderProps.textFieldProps} {...params} />}
          value={{ label: fieldDef.fieldLabel, field: fieldDef.field, group: fieldDef.autocompleteGroup }}
          onChange={(_, val) => onFieldChange(fieldDef.field, op, val.field)}
          disableClearable
          isOptionEqualToValue={(option, value) => option.field === value.field}
          groupBy={(option) => option.group}
        />
      </Grid>
      {
        fieldDef.collection === true &&
        <Grid item xs={12} md>
          <FormControl fullWidth size="small">
            <InputLabel id={`${clauseId}_label-collection-op`}>{getLocaleText("collectionOperation", builderProps.localeText)}</InputLabel>
            <Select
              label={getLocaleText("collectionOperation", builderProps.localeText)}
              {...builderProps.selectProps}
              value={collectionOp}
              onChange={(e) => onCollectionOpChange(e.target.value as CollectionOperation)}
              labelId={`${clauseId}_label-collection-op`}
            >
              <MenuItem value="any">{getLocaleText("opAny", builderProps.localeText)}</MenuItem>
              <MenuItem value="all">{getLocaleText("opAll", builderProps.localeText)}</MenuItem>
              <MenuItem value="count">{getLocaleText("opCount", builderProps.localeText)}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      }
      {
        fieldDef.collection === true && collectionOp !== "count" &&
        <Grid item xs={12} md>
          <Autocomplete
            size="small"
            {...builderProps.autocompleteProps}
            options={fieldDef.collectionFields?.map(c => ({ label: c.label, field: c.field })) ?? []}
            renderInput={(params) => <TextField label={getLocaleText("collectionField", builderProps.localeText)} {...builderProps.textFieldProps} {...params} />}
            value={{ label: fieldDef.colField?.label, field: collectionField }}
            onChange={(_, val) => onCollectionFieldChange(field, collectionField, op, val.field)}
            disableClearable
            isOptionEqualToValue={(option, value) => option.field === value.field}
          />
        </Grid>
      }
      {
        fieldDef.renderCustomFilter
          ? fieldDef.renderCustomFilter(value, onValueChange)
          : <Grid item xs={12} md>
            <FormControl fullWidth size="small">
              <InputLabel id={`${clauseId}_label-op`}>Operation</InputLabel>
              <Select
                {...builderProps.selectProps}
                value={op}
                onChange={(e) => onOpChange(e.target.value as Operation)}
                labelId={`${clauseId}_label-op`}
                label="Operation"
              >
                <MenuItem value="eq" disabled={!fieldDef.ops.includes("eq")}>{getLocaleText("opEq", builderProps.localeText)}</MenuItem>
                <MenuItem value="ne" disabled={!fieldDef.ops.includes("ne")}>{getLocaleText("opNe", builderProps.localeText)}</MenuItem>
                <MenuItem value="gt" disabled={!fieldDef.ops.includes("gt")}>{getLocaleText("opGt", builderProps.localeText)}</MenuItem>
                <MenuItem value="lt" disabled={!fieldDef.ops.includes("lt")}>{getLocaleText("opLt", builderProps.localeText)}</MenuItem>
                <MenuItem value="ge" disabled={!fieldDef.ops.includes("ge")}>{getLocaleText("opGe", builderProps.localeText)}</MenuItem>
                <MenuItem value="le" disabled={!fieldDef.ops.includes("le")}>{getLocaleText("opLe", builderProps.localeText)}</MenuItem>
                <MenuItem value="contains" disabled={!fieldDef.ops.includes("contains")}>{getLocaleText("opContains", builderProps.localeText)}</MenuItem>
                <MenuItem value="null" disabled={!fieldDef.ops.includes("null")}>{getLocaleText("opNull", builderProps.localeText)}</MenuItem>
                <MenuItem value="notnull" disabled={!fieldDef.ops.includes("notnull")}>{getLocaleText("opNotNull", builderProps.localeText)}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
      }
      {
        !fieldDef.renderCustomFilter &&
        <Grid item xs>
          {
            op !== "null" && op !== "notnull" &&
            (fieldDef.renderCustomInput ? fieldDef.renderCustomInput(value, onValueChange) :
            <Fragment>
              {
                fieldDef.type === "date" &&
                <LocalizationProvider dateAdapter={dateAdapter!} {...builderProps.localizationProviderProps}>
                  <DatePicker
                    label={getLocaleText("value", builderProps.localeText)}
                    {...builderProps.datePickerProps}
                    {...fieldDef.datePickerProps}
                    value={dateValue}
                    slotProps={datePickerSlotProps as DatePickerSlotsComponentsProps<TDate>}
                    onChange={(date) => onValueChange(new dateAdapter!().formatByString(date, "YYYY-MM-DD"))}
                  />
                </LocalizationProvider>
              }
              {
                fieldDef.type === "datetime" &&
                <LocalizationProvider dateAdapter={dateAdapter!} {...builderProps.localizationProviderProps}>
                  <DateTimePicker
                    label={getLocaleText("value", builderProps.localeText)}
                    {...fieldDef.dateTimePickerProps}
                    value={dateValue}
                    slotProps={datePickerSlotProps as DateTimePickerSlotsComponentsProps<TDate>}
                    onChange={(date) => onValueChange(new dateAdapter!().toISO(date))}
                  />
                </LocalizationProvider>
              }
              {
                fieldDef.type === "boolean" &&
                <FormControl fullWidth size="small" {...fieldDef.selectProps?.formControlProps}>
                  <InputLabel id={`${clauseId}_label-bool-value`}>{fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}</InputLabel>
                  <Select
                    label={fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}
                    {...builderProps.selectProps}
                    {...fieldDef.selectProps?.selectProps}
                    value={value ?? true}
                    onChange={(e) => onValueChange(e.target.value)}
                    labelId={`${clauseId}_label-bool-value`}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                    {fieldDef.nullable && <MenuItem value="null">Unknown</MenuItem>}
                  </Select>
                </FormControl>
              }
              {
                fieldDef.type === "singleSelect" && fieldDef.options &&
                <FormControl fullWidth size="small" {...fieldDef.selectProps?.formControlProps}>
                  <InputLabel id={`${clauseId}_label-select-value`}>{fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}</InputLabel>
                  <Select
                    label={fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}
                    value={value ?? ""}
                    onChange={(e) => onValueChange(e.target.value)}
                    labelId={`${clauseId}_label-select-value`}
                  >
                    {fieldDef.options!.map((o, i) =>
                      (<MenuItem value={getOptionValue(o)} key={`${clauseId}_${field}_select_${i}`}>{getOptionLabel(o)}</MenuItem>)
                    )}
                  </Select>
                </FormControl>
              }
              {
                (!fieldDef.type || fieldDef.type === "string" || fieldDef.type === "number") &&
                <TextField
                  size="small"
                  fullWidth
                  label={getLocaleText("value", builderProps.localeText)}
                  {...builderProps.textFieldProps}
                  {...fieldDef.textFieldProps}
                  value={value ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onValueChange(fieldDef.type === "number" ? parseFloat(e.target.value) : e.target.value)}
                  type={fieldDef.type === "number" ? "number" : "text"}
                />
              }
            </Fragment>)
          }
        </Grid>
      }
    </Fragment>
  )
};
export default React.memo(FilterInputs);

const getOptions = (fieldDef: SingleSelectFieldDef<unknown>) => {
  const _options = typeof fieldDef.valueOptions === "function"
    ? fieldDef.valueOptions({ field: fieldDef.field })
    : fieldDef.valueOptions;

  if (_options) {
    if (fieldDef.getOptionValue || fieldDef.getOptionLabel) {
      return _options.map(o => {
        if (typeof o === "object") {
          return {
            value: fieldDef.getOptionValue
              ? fieldDef.getOptionValue(o)
              : o.value,
            label: fieldDef.getOptionLabel
              ? fieldDef.getOptionLabel(o)
              : o.label
          }
        } else {
          return o;
        }
      });
    } else {
      return _options;
    }
  } else {
    return [];
  }
}

type AugmentedFieldDef<T extends FieldDef<TDate>, TDate> = T & {
  fieldLabel: string,
  type?: string,
  ops: Operation[],

  colField?: AugmentedFieldDef<CollectionFieldDef<TDate>, TDate>,

  textFieldProps?: TextFieldProps,

  options?: ValueOptions[],
  selectProps?: SelectControlProps,

  datePickerProps?: DatePickerProps<TDate>,
  dateTimePickerProps?: DateTimePickerProps<TDate>
}

const getAugmentedFieldDef = <T extends FieldDef<TDate>, TDate,>(fieldDef: T): AugmentedFieldDef<T, TDate> => {
  const result: AugmentedFieldDef<T, TDate> = {
    ...fieldDef,
    fieldLabel: fieldDef.label ?? fieldDef.headerName ?? fieldDef.field,
    type: fieldDef.filterType ?? fieldDef.type,
    ops: fieldDef.filterOperators ?? allOperators,
  };

  if (fieldDef.type === "singleSelect") {
    result.options = getOptions(fieldDef as SingleSelectFieldDef<TDate>);
    result.selectProps = (fieldDef as SingleSelectFieldDef<TDate>).selectProps;
  } else if (fieldDef.type === "date") {
    result.datePickerProps = (fieldDef as DateFieldDef<TDate>).datePickerProps;
  } else if (fieldDef.type === "dateTime") {
    result.dateTimePickerProps = (fieldDef as DateTimeFieldDef<TDate>).dateTimePickerProps;
  } else if (fieldDef.type === "boolean") {
    result.selectProps = (fieldDef as BooleanFieldDef<TDate>).selectProps;
  } else {
    result.textFieldProps = (fieldDef as TextFieldDef<TDate>).textFieldProps;
  }

  return result;
}

const findFieldDef = <TDate,>(field: string | undefined, fieldDefs: FieldDef<TDate>[]) =>
  field
    ? fieldDefs.find(f => f.field === field) ?? fieldDefs[0]
    : fieldDefs[0];

const getOptionValue = (option: ValueOptions) =>
  typeof option === "object"
    ? option.value
    : option;

const getOptionLabel = (option: ValueOptions) =>
typeof option === "object"
  ? option.label
  : option;