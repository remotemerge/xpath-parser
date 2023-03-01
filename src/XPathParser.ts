import { Expression } from './typings/parser';

export default class XPathParser {
  // init options
  private options = {
    queryFirst: false,
  };

  // init DOM node
  private domContent: Node;

  /**
   * Initialize Node from DOM Node or HTML string.
   * @param content - A DOM Node or an HTML string.
   */
  constructor(content: Node | string) {
    if (content instanceof Node) {
      this.domContent = content;
    } else {
      // init DOM parser
      const parser = new DOMParser();
      this.domContent = parser.parseFromString(content, 'text/html');
    }
  }

  /**
   * Evaluate an XPath expression in the specified Node
   * and return the result.
   * @param expression - The XPath expression to evaluate.
   * @return The result of evaluating the XPath expression.
   */
  evaluate(expression: string): XPathResult {
    return document.evaluate(
      expression,
      this.domContent,
      null,
      this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
  }

  /**
   * Extract the text value from a given DOM Node.
   * @param node - The DOM Node to extract the text value from.
   * @return The text value of the DOM Node.
   */
  getValue(node: Node | null): string {
    let formattedText = '';
    if (node instanceof Attr) {
      // node is attribute
      formattedText = node.value || '';
    } else if (node instanceof HTMLElement) {
      // node is html element
      formattedText = node.textContent || '';
    }
    return formattedText.trim();
  }

  /**
   * Evaluate the expression and return the first matching result.
   * @param expression - The XPath expression to evaluate.
   * @return The first matching result of evaluating the XPath expression.
   */
  queryFirst(expression: string): string {
    // override options
    this.options.queryFirst = true;
    const evaluate = this.evaluate(expression);
    return this.getValue(evaluate.singleNodeValue);
  }

  /**
   * Evaluate the expression and return all matching results.
   * @param expression - The XPath expression to evaluate.
   * @return An array of all the matching results of evaluating the XPath expression.
   */
  queryList(expression: string): Array<string> {
    const response = [];
    const evaluate = this.evaluate(expression);
    let node;
    while ((node = evaluate.iterateNext())) {
      const value = this.getValue(node);
      response.push(value);
    }
    return response;
  }

  /**
   * Evaluate the expressions and return the matching result
   * in the associative format.
   * @param expressions - An object with XPath expressions as values.
   * @return An object with the results of evaluating the XPath expressions as key-value pairs.
   */
  multiQuery(expressions: { [key: string]: string }): { [key: string]: string } {
    // response format
    const response: { [key: string]: string } = {};

    Object.keys(expressions).forEach((key) => {
      response[key] = this.queryFirst(expressions[key]);
    });
    return response;
  }

  /**
   * This method selects all matching parent nodes and
   * runs sub queries on child nodes and generate an
   * associative array result.
   * @param expression - An object that specifies the XPath expressions to use for the root node,
   * child nodes, and pagination.
   * @return An object that contains an array of objects with the results of evaluating the XPath
   * expressions as key-value pairs, and optionally, a pagination URL.
   */
  subQuery(
    expression: Expression = {
      root: '/html',
      pagination: '',
      queries: {},
    },
  ): { paginationUrl?: string; results: Array<{ [key: string]: string }> } {
    // extract root DOM
    const rootDom = this.evaluate(expression.root);

    const results = [];
    let nodeDom = null;
    while ((nodeDom = rootDom.iterateNext())) {
      // reset dom root
      this.domContent = nodeDom;
      const record: { [key: string]: string } = {};

      Object.keys(expression.queries).forEach((key) => {
        record[key] = this.queryFirst(expression.queries[key]);
      });
      results.push(record);
    }

    // init response
    const response = { results: results };

    // evaluate pagination
    if (expression.pagination) {
      Object.assign(response, {
        paginationUrl: this.queryFirst(expression.pagination),
      });
    }
    return response;
  }

  /**
   * This method tries to match a given expression every second up to
   * a maximum number of seconds.
   * @param expression - The XPath expression to match.
   * @param maxSeconds - The maximum number of seconds to keep trying.
   * @return A Promise that resolves with an object containing a boolean indicating whether
   * the expression was found, and a message with the first match if it was found, or rejects
   * with a TimeoutError if the expression was not found within the maximum number of seconds.
   */
  waitXPath(expression: string, maxSeconds = 10): Promise<{ found: boolean; message: string }> {
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
          return resolve({ found: true, message: firstMatch });
        }
        // check if timeout
        if (timer++ >= maxSeconds) {
          clearInterval(refreshId);
          const error = new Error(`Timeout! Max ${maxSeconds} seconds are allowed.`);
          error.name = 'TimeoutError';
          return reject(error);
        }
      }, 1000);
    });
  }
}
