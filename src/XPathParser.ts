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
   * @param content
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
   * @param expression
   * @return XPathResult
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
   * @param node
   * @return string
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
   * Evaluate the expression and return the first matching result
   * @param expression
   * @return string
   */
  queryFirst(expression: string): string {
    // override options
    this.options.queryFirst = true;
    const evaluate = this.evaluate(expression);
    return this.getValue(evaluate.singleNodeValue);
  }

  /**
   * Evaluate the expression and return all matching results
   * @param expression
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
   * in the associative format
   * @param expressions
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
   * @param expression
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
   * This method try to match given expression every second upto
   * max seconds provided.
   * @param expression
   * @param maxSeconds
   * @return Promise
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
