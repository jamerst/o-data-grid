/**
 * Model for DataGrid rows - allows flattening for convenience whilst retaining strong typing
 */
export type ODataRowModel<T> = Record<string, any> & T;