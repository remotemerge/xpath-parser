import type { DomNode } from './engine';
import { createXmlDomEngine } from './engine-xmldom';
import XPathParser from './parser';

export type { DomNode, Engine, EvaluateResult } from './engine';
export type { SubQueryExpression, SubQueryResult, WaitXPathResult } from './parser';

/**
 * Node.js-targeted entry point.
 *
 * Always uses the pure-JavaScript `@xmldom/xmldom` + `xpath` engine, which
 * works in any JavaScript runtime regardless of whether a native DOM is
 * present. Prefer this over the universal entry point when you want a
 * deterministic engine choice on the server.
 *
 * @example
 * ```ts
 * import NodeXPathParser from '@remotemerge/xpath-parser/node';
 *
 * const parser = new NodeXPathParser(htmlString);
 * const prices = parser.queryList('//span[contains(@class,"price")]');
 * ```
 */
export default class NodeXPathParser extends XPathParser {
  /**
   * @param content - HTML/XML source string, or a pre-parsed
   *                  `@xmldom/xmldom` node.
   */
  constructor(content: DomNode | string) {
    super(content, createXmlDomEngine());
  }
}
