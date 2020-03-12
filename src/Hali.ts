// interface for XPath expression
interface Expression {
  root: string;
  queries: {
    [key: string]: string;
  };
}

export default class Hali {
  // init options
  private options = {
    queryFirst: false,
    subQueryFirst: false,
  };

  // init DOM node
  private domContent: Node;

  /**
   * --------------------------------------------------
   * Initialize Node from DOM Node or HTML string.
   * --------------------------------------------------
   * @param content
   * --------------------------------------------------
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
   * --------------------------------------------------
   * Evaluate an XPath expression in the specified Node
   * and return the result.
   * --------------------------------------------------
   * @param expression
   * --------------------------------------------------
   */
  evaluate(expression: string): XPathResult {
    return document.evaluate(expression, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  }

  /**
   * --------------------------------------------------
   * Extract the text value from a given DOM Node.
   * --------------------------------------------------
   * @param node
   * --------------------------------------------------
   */
  getValue(node: Node | null): string {
    let formattedText = '';
    if (node instanceof Node) {
      switch (node.nodeType) {
        case 1:
          formattedText = node.textContent || '';
          break;
        case 2:
        case 3:
          formattedText = node.nodeValue || '';
          break;
        default:
          formattedText = '';
      }
    }
    return formattedText.trim().replace(/\s{2,}/gm, ' ');
  }

  /**
   * --------------------------------------------------
   * This method selects all matching nodes and extract
   * result in an array.
   * --------------------------------------------------
   * @param expression
   * @param options
   * --------------------------------------------------
   */
  singleQuery(expression: string, options: object | undefined): string | string[] {
    // override options
    this.options = Object.assign(this.options, options);

    const evaluate = this.evaluate(expression);
    if (this.options.queryFirst) {
      return this.getValue(evaluate.singleNodeValue);
    } else {
      const records = [];
      let node = null;
      while ((node = evaluate.iterateNext())) {
        const value = this.getValue(node);
        records.push(value);
      }
      return records;
    }
  }

  /**
   * --------------------------------------------------
   * This method selects all matching parent nodes and
   * runs sub queries on child nodes and generate an
   * associative array result.
   * --------------------------------------------------
   * @param expression
   * @param options
   * --------------------------------------------------
   */
  multiQuery(expression: Expression = {
    root: '/html',
    queries: {}
  }, options: object): object {
    // override options
    this.options = Object.assign(this.options, options);
    // extract root DOM
    const rootDom = this.evaluate(expression.root);

    const records = [];
    let nodeDom = null;
    while ((nodeDom = rootDom.iterateNext())) {
      // runtime override
      this.options.queryFirst = true;
      this.domContent = nodeDom;

      const record: { [key: string]: string } = {};

      Object.keys(expression.queries).forEach((key: string) => {
        const result = (this.evaluate(expression.queries[key])).singleNodeValue;
        record[key] = this.getValue(result);
      });
      records.push(record);
    }
    return records;
  }
}
