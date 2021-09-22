interface Expression {
  root: string;
  pagination?: string;
  queries: {
    [key: string]: string;
  };
}

export default class Hali {
  private options;
  private domContent;

  /**
   * Initialize Node from DOM Node or HTML string.
   * @param content
   */
  constructor(content: Node | string);

  /**
   * Evaluate an XPath expression in the specified Node
   * and return the result.
   * @param expression
   * @return XPathResult
   */
  evaluate(expression: string): XPathResult;

  /**
   * Extract the text value from a given DOM Node.
   * @param node
   * @return string
   */
  getValue(node: Node | null): string;

  /**
   * Evaluate the expression and return the first matching result
   * @param expression
   * @return string
   */
  queryFirst(expression: string): string;

  /**
   * Evaluate the expression and return all matching results
   * @param expression
   */
  queryList(expression: string): Array<string>;

  /**
   * Evaluate the expressions and return the matching result
   * in the associative format
   * @param expressions
   */
  multiQuery(expressions: { [key: string]: string }): {
    [key: string]: string;
  };

  /**
   * This method selects all matching parent nodes and
   * runs sub queries on child nodes and generate an
   * associative array result.
   * @param expression
   */
  subQuery(expression?: Expression): {
    paginationUrl?: string;
    results: Array<{
      [key: string]: string;
    }>;
  };

  /**
   * This method try to match given expression every second upto
   * max seconds provided.
   * @param expression
   * @param maxSeconds
   * @return Promise
   */
  waitXPath(
    expression: string,
    maxSeconds?: number,
  ): Promise<{
    found: boolean;
    message: string;
  }>;
}
export {};
