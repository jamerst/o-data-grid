import { FilterTranslatorCollection } from "./types";
import { escapeODataString } from "./utils";

export const defaultTranslators: FilterTranslatorCollection = {
  "contains": (schema, field, op, value) => {
    if ((schema.type && schema.type !== "string") || typeof value !== "string") {
      console.warn(`Warning: operation "contains" is only supported for fields of type "string"`);
      return false;
    }
    if (schema.caseSensitive === true) {
      return `contains(${field}, '${escapeODataString(value)}')`;
    } else {
      return `contains(tolower(${field}), tolower('${escapeODataString(value)}'))`;
    }
  },

  "null": (schema, field, op, value) => {
    return `${field} eq null`;
  },

  "notnull": (schema, field, op, value) => {
    return `${field} ne null`;
  },

  "default": (schema, field, op, value) => {
    if (schema.type === "date") {
      return `date(${field}) ${op} ${value}`;
    } else if (schema.type === "datetime") {
      return `${field} ${op} ${value}`;
    } else if (schema.type === "boolean") {
      return `${field} ${op} ${value}`;
    } else if (!schema.type || schema.type === "string" || typeof value === "string") {
      if (schema.caseSensitive === true) {
        return `${field} ${op} '${escapeODataString(value)}'`;
      } else {
        return `tolower(${field}) ${op} tolower('${escapeODataString(value)}')`;
      }
    } else {
      return `${field} ${op} ${value}`;
    }
  }
}