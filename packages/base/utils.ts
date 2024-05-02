import { Expand } from "./models/OData";

/**
 * Convert an Expand object (or array of objects) to a clause to use in an OData $expand query parameter
 * @param e Expand(s) to convert
 * @returns OData expand clause string
 */
export const ExpandToQuery = (expand?: Expand[] | Expand): string => {
  if (expand === undefined) {
    return "";
  }

  if (!Array.isArray(expand)) {
    return ExpandToQuery([expand]);
  }

  // group all expands by the navigation field
  const groupedExpands = Map.groupBy(expand, (e) => e.navigationField);

  // construct a single expand for each navigation field, combining nested query options (where possible)
  const expands: Expand[] = [];
  groupedExpands.forEach((e, k) => {
    expands.push({
      navigationField: k,
      top: e.find(e2 => e2.top)?.top,
      orderBy: e.find(e2 => e2.orderBy)?.orderBy,
      count: e.some(e2 => e2.count),
      select: Array.from(new Set(e.filter(e2 => e2.select).map(e2 => e2.select))).join(","),
      expand: e.filter(e2 => e2.expand)
        .flatMap(c => Array.isArray(c.expand) ? c.expand! : [c.expand!])
    });
  });

  return expands.map(e => {
    let result = `${e.navigationField}`;

    const options = [
      { type: "select", value: e.select },
      { type: "expand", value: ExpandToQuery(e.expand) },
      { type: "orderby", value: e.orderBy },
      { type: "top", value: e.top },
      { type: "count", value: e.count }
    ];

    if (options.some(o => o.value)) {
      result += `(${options.filter(o => o.value).map(o => `$${o.type}=${o.value}`).join(";")})`
    }

    return result;

  }).join(",")
}

/**
 * Flatten nested objects inside an object, combining with the original object structure.
 * e.g. { Person: { Name: "John" } } becomes { Person: { Name: "John" }, "Person.Name": "John" }.
 * @param obj Object to flatten
 * @param sep Level separator (default ".")
 * @returns Flattened object
 */
export const Flatten = <T extends object,>(obj: T, sep = ".") => _flatten(obj, sep, "");

const _flatten = <T extends object,>(obj: T, sep: string, prefix: string) =>
  Object.keys(obj).reduce((x: Record<string, any>, k) => {
    const value = obj[k as keyof T]

    const pre = prefix.length ? prefix + sep : "";
    if (!Array.isArray(value)) {
      if (value !== null && typeof value === "object") {
        // flatten nested object and add keys to accumulator to flatten multiple levels
        Object.assign(x, _flatten(value, sep, pre + k));
      } else if (prefix.length) {
        // only assign if in nested object - no point overwriting original
        x[pre + k] = value;
      }
    }
    return x;
  }, prefix.length ? {} : obj) as T & Record<string, any>;