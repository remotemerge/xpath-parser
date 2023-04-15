import type { Expression } from './types/parser';

/**
 * This class is used to parse HTML content using XPath expressions.
 *
 * @class XPathParser
 */
export default class XPathParser {
  // init options
  private options = {
    queryFirst: false,
  };

  // init DOM node
  private domContent: Node;

  /**
   * Initialize Node from DOM Node or HTML string.
   *
   * @param {Node|string} content - A DOM Node or an HTML string.
   */
  constructor(content: Node | string) {
    this.domContent = content instanceof Node ? content : new DOMParser().parseFromString(content, 'text/html');
  }

  /**
   * Evaluate an XPath expression in the specified Node and return the result.
   *
   * @param {string} expression - The XPath expression to evaluate.
   * @return {XPathResult} The result of evaluating the XPath expression.
   */
  evaluate(expression: string): XPathResult {
    const resultType = this.options.queryFirst
      ? XPathResult.FIRST_ORDERED_NODE_TYPE
      : XPathResult.ORDERED_NODE_ITERATOR_TYPE;
    return document.evaluate(expression, this.domContent, null, resultType, null);
  }

  /**
   * Extract the text value from a given DOM Node.
   *
   * @param {Node|null} node - The DOM Node to extract the text value from.
   * @return {string} The text value of the DOM Node.
   */
  getValue(node: Node | null): string {
    return (node instanceof Attr ? node.value : node instanceof HTMLElement ? node.textContent : '')?.trim() || '';
  }

  /**
   * Evaluate the expression and return the first matching result.
   *
   * @param {string} expression - The XPath expression to evaluate.
   * @return {string} The first matching result of evaluating the XPath expression.
   */
  queryFirst(expression: string): string {
    // override options
    this.options.queryFirst = true;
    return this.getValue(this.evaluate(expression).singleNodeValue);
  }

  /**
   * Evaluate the expression and return all matching results.
   *
   * @param {string} expression - The XPath expression to evaluate.
   * @return {string[]} An array of all the matching results of evaluating the XPath expression.
   */
  queryList(expression: string): string[] {
    const response: string[] = [];
    const evaluate = this.evaluate(expression);
    let node;
    while ((node = evaluate.iterateNext())) {
      response.push(this.getValue(node));
    }
    return response;
  }

  /**
   * Evaluate the expressions and return the matching result in the associative format.
   *
   * @param {Expression[]} expressions - An object with XPath expressions as values.
   * @return {Record<string, string>} An object with the results of evaluating the XPath expressions as key-value pairs.
   */
  multiQuery(expressions: Expression['queries']): Record<string, string> {
    // response format
    const response: Record<string, string> = {};

    Object.keys(expressions).forEach((key) => {
      response[key] = this.queryFirst(expressions[key]);
    });

    return response;
  }

  /**
   * This method selects all matching parent nodes and runs sub queries on child nodes and generate an associative array result.
   *
   * @param {Expression} expression - An object that specifies the XPath expressions to use for the root node, child nodes, and pagination.
   * @return {Record<string, string>[]} An array of objects with the results of evaluating the XPath expressions as key-value pairs, and optionally, a pagination URL.
   */
  subQuery(expression: Expression): { paginationUrl?: string; results: Record<string, string>[] } {
    // extract root DOM
    const rootDom = this.evaluate(expression.root);
    const results: Record<string, string>[] = [];
    let nodeDom: Node | null = null;

    while ((nodeDom = rootDom.iterateNext())) {
      // reset dom root
      this.domContent = nodeDom;
      const record: Record<string, string> = {};

      Object.entries(expression.queries).forEach(([key, value]) => {
        record[key] = this.queryFirst(value);
      });

      results.push(record);
    }

    // init response
    const response: { paginationUrl?: string; results: Record<string, string>[] } = { results };
    if (expression.pagination) {
      response.paginationUrl = this.queryFirst(expression.pagination);
    }

    return response;
  }

  /**
   * This method tries to match a given expression every second up to a maximum number of seconds.
   *
   * @param {string} expression - The XPath expression to match.
   * @param {number} maxSeconds - The maximum number of seconds to keep trying. Default is 10.
   * @return {Promise<{ found: boolean; message: string }>} A Promise that resolves with an object containing a boolean indicating whether the expression was found, and a message with the first match if it was found, or rejects with a TimeoutError if the expression was not found within the maximum number of seconds.
   */
  async waitXPath(expression: string, maxSeconds = 10): Promise<{ found: boolean; message: string }> {
    // init the timer
    let timer = 1;

    return new Promise((resolve, reject) => {
      // refresh every second
      const refreshId = setInterval(() => {
        // try first match
        const firstMatch = this.queryFirst(expression);
        if (firstMatch) {
          // clear interval
          clearInterval(refreshId);
          resolve({ found: true, message: firstMatch });
        }

        // check if timeout
        if (timer++ >= maxSeconds) {
          clearInterval(refreshId);
          const error = new Error(`Timeout! Max ${maxSeconds} seconds are allowed.`);
          error.name = 'TimeoutError';
          reject(error);
        }
      }, 1000);
    });
  }
}
