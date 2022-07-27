import React, { Fragment, useMemo } from "react"
import { useRecoilValue } from "recoil";
import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { CollectionFieldDef, CollectionOperation, FieldDef, Operation } from "../types";

import { propsState, schemaState } from "../state"
import { SelectOption, ValueOption } from "../../types";
import { getLocaleText, getSelectOption } from "../utils";
import { allOperators, numericOperators } from "../constants";


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

  const schema = useRecoilValue(schemaState);
  const builderProps = useRecoilValue(propsState);

  const dateAdapter = useMemo(() => builderProps.localizationProviderProps?.dateAdapter, [builderProps]);

  const fieldDef = useMemo(() => {
    if (!field && schema.length < 1) {
      return null;
    }

    let f: FieldDef<TDate>;
    if (field) {
      f = schema.find(c => c.field === field) ?? schema[0];
    } else {
      f = schema[0]
    }

    if (!f) {
      return null;
    }

    let filterField = field;
    let colField: CollectionFieldDef<TDate> | undefined;
    let type = f.filterType ?? f.type;
    let options = f.valueOptions;
    let ops = f.filterOperators ?? allOperators;
    if (f.collection === true && f.collectionFields) {
      if (collectionField) {
        colField = f.collectionFields.find(c => c.field === collectionField) ?? f.collectionFields[0];
      } else {
        colField = f.collectionFields[0];
      }

      filterField = colField.field;
      type = colField.type;
      options = colField.valueOptions;

      if (collectionOp !== "count") {
        ops = colField.filterOperators ?? allOperators;
      } else {
        ops = numericOperators;
        type = "number"
      }
    }

    // get value options into a single type
    let valueOptions: SelectOption[] | undefined;
    if (type === "singleSelect" && typeof options === "function") {
      valueOptions = options({ field: filterField }).map((v) => getSelectOption(v));
    } else if (type === "singleSelect" && options) {
      valueOptions = (options as ValueOption[]).map((v) => getSelectOption(v));
    }

    return {
      ...f,
      fieldLabel: f.label ?? f.headerName ?? f.field,
      type: type,
      ops: ops,
      valueOptions: valueOptions,
      colField: colField
    };
  }, [field, collectionField, collectionOp, schema]);

  const fieldOptions = useMemo(() => schema
    .filter(c => c.filterable !== false)
    .map(c => ({ label: c.label ?? c.headerName ?? c.field, field: c.field, group: c.autocompleteGroup ?? "" }))
    .sort((a, b) => builderProps.autocompleteGroups ?
      builderProps.autocompleteGroups.indexOf(a.group) - builderProps.autocompleteGroups.indexOf(b.group)
      : a.group.localeCompare(b.group)),
    [schema, builderProps]
  );

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
        fieldDef.renderCustomFilter ?
          fieldDef.renderCustomFilter(value, onValueChange)
          :
          <Grid item xs={12} md>
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
                    value={value ?? ""}
                    renderInput={(params) => <TextField fullWidth size="small" {...builderProps.textFieldProps} {...fieldDef.textFieldProps} {...params} />}
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
                    value={value ?? ""}
                    renderInput={(params) => <TextField fullWidth size="small" {...builderProps.textFieldProps} {...fieldDef.textFieldProps} {...params} />}
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
                fieldDef.type === "singleSelect" && fieldDef.valueOptions &&
                <FormControl fullWidth size="small" {...fieldDef.selectProps?.formControlProps}>
                  <InputLabel id={`${clauseId}_label-select-value`}>{fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}</InputLabel>
                  <Select
                    label={fieldDef.selectProps?.label ?? getLocaleText("value", builderProps.localeText)}
                    value={value ?? ""}
                    onChange={(e) => onValueChange(e.target.value)}
                    labelId={`${clauseId}_label-select-value`}
                  >
                    {fieldDef.valueOptions!.map((o, i) =>
                      (<MenuItem value={o.value} key={`${clauseId}_${field}_select_${i}`}>{o.label}</MenuItem>)
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
