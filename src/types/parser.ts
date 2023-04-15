/**
 * Expression type definition.
 *
 * @property {string} root - The root XPath expression.
 * @property {string} [pagination] - The optional pagination XPath expression.
 * @property {Record<string, string>} queries - A dictionary of query names and their XPath expressions.
 */
export type Expression = {
  root: string;
  pagination?: string;
  queries: Record<string, string>;
};
