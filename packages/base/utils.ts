import { Expand } from "./types";

import { defaultPageSize } from "./constants";

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
  const groupedExpands = GroupArrayBy(expand, (e) => e.navigationField);

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
        // .map(e2 => e2.expand!)
        // .reduce((a: Expand[], b) => Array.isArray(b) ? a.concat(b) : [...a, b], [])
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
 * Group an array into multiple arrays linked by a common key value
 * @param arr Array to group
 * @param keySelector Function to select property to group by
 * @returns ES6 Map of keys to arrays of values
 */
export const GroupArrayBy = <TKey, T,>(arr: T[], keySelector: (e: T) => TKey) => arr
  .reduce((m, e) => m.set(keySelector(e), [...m.get(keySelector(e)) || [], e]), new Map<TKey, T[]>());

/**
 * Flatten an object to a single level, i.e. { Person: { Name: "John" } } becomes { "Person.Name": "John" }.
 * Arrays are kept as arrays, with their elements flattened.
 * @param obj Object to flatten
 * @param sep Level separator (default ".")
 * @returns Flattened object
 */

export const Flatten = (obj: any, sep = ".") => _flatten(obj, sep, "");

const _flatten = (obj: any, sep: string, prefix: string) =>
  Object.keys(obj).reduce((x: { [key: string]: any }, k) => {
    if (obj[k] !== null) {
      const pre = prefix.length ? prefix + sep : "";
      if (Array.isArray(obj[k])) {
        x[pre + k] = (obj[k] as Array<any>).map(i => Flatten(i, sep));
      } else if (typeof obj[k] === "object") {
        Object.assign(x, _flatten(obj[k], sep, pre + k));
      } else {
        x[pre + k] = obj[k];
      }
    }
    return x;
  }, {});

export const GetPageNumber = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("page")) {
    const pageVal = params.get("page");
    if (pageVal) {
      return parseInt(pageVal, 10) - 1;
    }
  }

  return 0;
}

export const GetPageSizeOrDefault = (defaultSize?: number) => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("page-size")) {
    const sizeVal = params.get("page-size");
    if (sizeVal) {
      return parseInt(sizeVal, 10);
    }
  }

  return defaultSize ?? defaultPageSize;
}