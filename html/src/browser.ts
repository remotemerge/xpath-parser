import type { DomNode } from './engine';
import { createNativeEngine } from './engine';
import XPathParser from './parser';

export type { DomNode, Engine, EvaluateResult } from './engine';
export type { SubQueryExpression, SubQueryResult, WaitXPathResult } from './parser';

/**
 * Browser-targeted entry point.
 *
 * Always uses the host environment's native DOM and `document.evaluate`
 * XPath implementation. Use this in bundles that should *not* ship the
 * `@xmldom/xmldom` fallback, e.g. browser builds produced by webpack, Vite,
 * Rollup, or esbuild.
 *
 * @example
 * ```ts
 * import BrowserXPathParser from '@remotemerge/xpath-parser/browser';
 *
 * const parser = new BrowserXPathParser(document);
 * const links = parser.queryList('//a/@href');
 * ```
 */
export default class BrowserXPathParser extends XPathParser {
  /**
   * @param content - HTML string (parsed via the native `DOMParser`) or an
   *                  existing `Document`/`Element`.
   */
  constructor(content: DomNode | string) {
    super(content, createNativeEngine());
  }
}
