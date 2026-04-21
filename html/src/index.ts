import type { DomNode } from './engine';
import { createNativeEngine, hasNativeDom } from './engine';
import { createXmlDomEngine } from './engine-xmldom';
import XPathParser from './parser';

export type { DomNode, Engine, EvaluateResult } from './engine';
export type { SubQueryExpression, SubQueryResult, WaitXPathResult } from './parser';

/**
 * Environment-agnostic entry point for the XPath parser.
 *
 * Picks the most capable {@link Engine} available at construction time:
 *
 *  - the **native DOM engine** when `document` and `XPathResult` are present
 *    on `globalThis` (browsers, jsdom, happy-dom, etc.);
 *  - otherwise the **`@xmldom/xmldom`** fallback (plain Node.js).
 *
 * Most consumers should import from this module. Bundlers that need to
 * tree-shake out the `xmldom` dependency for a browser-only build should
 * import from `@remotemerge/xpath-parser/browser` instead.
 *
 * @example
 * ```ts
 * import XPathParser from '@remotemerge/xpath-parser';
 *
 * const parser = new XPathParser(htmlString);
 * const title = parser.queryFirst('//h1');
 * ```
 */
export default class UniversalXPathParser extends XPathParser {
  /**
   * @param content - HTML/XML source string, or a pre-parsed DOM node.
   */
  constructor(content: DomNode | string) {
    const engine = hasNativeDom() ? createNativeEngine() : createXmlDomEngine();
    super(content, engine);
  }
}
