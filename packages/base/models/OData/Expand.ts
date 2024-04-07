/**
 * An expression to add to the $expand clause to include related entities
 */
export type Expand = {
  /**
   * Field name to expand
   */
  navigationField: string,

  /**
   * Nested $select clause for expanded entity
   */
  select?: string,

  /**
   * Nested $expand clause for expanded entity
   */
  expand?: Expand[] | Expand,

  /**
   * Nested $orderby clause for expanded entity collection
   */
  orderBy?: string,

  /**
   * Nested $top clause for expanded entity collection
   */
  top?: number,

  /**
   * Nested $count option for expanded entity collection
   */
  count?: boolean
}