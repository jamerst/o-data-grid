import { FilterTranslatorCollection } from "./models/filters/translation";
import { escapeODataString } from "./utils";

export const defaultTranslators: FilterTranslatorCollection<any> = {
  "contains": ({ schema, field, value }) => {
    const type = schema.filterType ?? schema.type;
    if ((type && type !== "string") || typeof value !== "string") {
      console.warn(`Warning: operation "contains" is only supported for fields of type "string"`);
      return false;
    }
    if (schema.caseSensitive === true) {
      return `contains(${field}, '${escapeODataString(value)}')`;
    } else {
      return `contains(tolower(${field}), tolower('${escapeODataString(value)}'))`;
    }
  },

  "null": ({ field }) => {
    return `${field} eq null`;
  },

  "notnull": ({ field }) => {
    return `${field} ne null`;
  },

  "default": ({ schema, field, op, value }) => {
    const type = schema.filterType ?? schema.type;

    if (type === "date") {
      if (!value) {
        return false;
      }

      return `date(${field}) ${op} ${value}`;
    } else if (type === "datetime") {
      if (!value) {
        return false;
      }

      return `${field} ${op} ${value}`;
    } else if (type === "boolean") {
      if (!value) {
        console.warn(`No value for field ${field}`);
        return false;
      }

      return `${field} ${op} ${value}`;
    } else if (!type || type === "string" || typeof value === "string") {
      if (schema.caseSensitive === true) {
        return `${field} ${op} '${escapeODataString(value)}'`;
      } else {
        return `tolower(${field}) ${op} tolower('${escapeODataString(value)}')`;
      }
    } else {
      if (!value) {
        console.warn(`No value for field ${field}`);
        return false;
      }

      return `${field} ${op} ${value}`;
    }
  }
}