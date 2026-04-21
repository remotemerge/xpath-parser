/**
 * Engine abstraction for evaluating XPath expressions against an HTML/XML
 * document. Two implementations are provided:
 *
 *  - {@link createNativeEngine} — uses the host environment's `document` and
 *    `XPathResult` (browsers, jsdom, happy-dom).
 *  - `createXmlDomEngine` (see `./engine-xmldom`) — a pure-JS fallback built
 *    on `@xmldom/xmldom` and the `xpath` package, suitable for plain Node.js.
 *
 * Both engines speak a small, environment-agnostic node interface
 * ({@link DomNode}) so that `XPathParser` does not need to care which DOM
 * implementation is in use.
 */

/**
 * Minimal, structural shape of a DOM node that the parser needs to read.
 *
 * This intentionally mirrors only the fields the parser consumes; it allows
 * both real `Node` instances (from a native DOM) and `@xmldom/xmldom`'s nodes
 * to be treated uniformly without depending on either type system.
 */
export type DomNode = {
  /** Node type code, matching the DOM `Node.nodeType` constants. */
  nodeType: number;
  /** Concatenated text content of this node and its descendants. */
  textContent?: string | null;
  /** Attribute value — only populated for attribute nodes. */
  value?: string;
};

/**
 * Result of evaluating an XPath expression against an {@link Engine}.
 *
 * Two access patterns are supported, chosen by the `first` flag passed to
 * {@link Engine.evaluate}:
 *
 *  - `singleNodeValue` is populated when only the first match was requested.
 *  - `iterateNext()` walks subsequent matches one at a time, returning
 *    `null` once the result set is exhausted.
 */
export type EvaluateResult = {
  /** First matching node when the engine was invoked in "first only" mode. */
  singleNodeValue: DomNode | null;
  /** Returns the next matching node, or `null` when iteration is complete. */
  iterateNext(): DomNode | null;
};

/**
 * Pluggable XPath/DOM backend. An engine is responsible for parsing source
 * markup into a node tree and for evaluating XPath expressions against it.
 */
export type Engine = {
  /**
   * Parse a string of HTML (or XML-shaped HTML) into a {@link DomNode} that
   * can be passed back as the evaluation context.
   */
  parse(html: string): DomNode;

  /**
   * Evaluate an XPath expression against the given context node.
   *
   * @param expression - XPath 1.0 expression.
   * @param context    - Node to use as the evaluation context.
   * @param first      - When `true`, only the first match is required and
   *                     will be exposed via `singleNodeValue`. When `false`,
   *                     callers should use `iterateNext()` to walk the set.
   */
  evaluate(expression: string, context: DomNode, first: boolean): EvaluateResult;

  /** Type guard — verifies that an arbitrary value is a node from this engine. */
  isNode(value: unknown): value is DomNode;
};

/**
 * DOM `Node.ATTRIBUTE_NODE` constant. Hard-coded so this module does not
 * have to assume a global `Node` is in scope (it isn't, in plain Node.js).
 */
const ATTRIBUTE_NODE = 2;

/**
 * Extract a trimmed string value from a node returned by either engine.
 *
 * Attribute nodes expose their value via the `value` field (per the
 * `@xmldom/xmldom` shape and the native DOM's `Attr.value`); element and
 * text nodes are read through `textContent`. A missing value is normalised
 * to an empty string so callers never have to null-check the result.
 *
 * @param node - The node to read, or `null` for a missing match.
 * @returns The node's value, trimmed, or `''` when no value is available.
 */
export const getNodeValue = (node: DomNode | null): string => {
  if (!node) return '';
  if (node.nodeType === ATTRIBUTE_NODE) return (node.value ?? '').trim();
  return (node.textContent ?? '').trim();
};

/**
 * Detect whether the current runtime exposes a native DOM with XPath support.
 *
 * Both `document` and `XPathResult` must be present on `globalThis`; the
 * latter is the part that's missing in plain Node.js, which is why the
 * library ships a separate `xmldom` engine.
 */
export const hasNativeDom = (): boolean =>
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as { document?: unknown }).document !== 'undefined' &&
  typeof (globalThis as { XPathResult?: unknown }).XPathResult !== 'undefined';

/**
 * Build an {@link Engine} backed by the host environment's native DOM and
 * its `document.evaluate` XPath implementation.
 *
 * Intended for browsers, jsdom, happy-dom, and any other runtime where
 * {@link hasNativeDom} returns `true`. Behaviour is undefined when called
 * in an environment without a native DOM.
 */
export const createNativeEngine = (): Engine => {
  // Cast `globalThis` to the subset of DOM globals we need. This avoids a
  // hard dependency on `lib.dom.d.ts` types being in scope for non-browser
  // builds of the library.
  const g = globalThis as unknown as {
    document: Document;
    DOMParser: typeof DOMParser;
    XPathResult: typeof XPathResult;
    Node: { prototype: object };
  };

  return {
    parse: (html: string) => new g.DOMParser().parseFromString(html, 'text/html') as unknown as DomNode,

    evaluate: (expression, context, first) => {
      // Pick the cheapest result type that satisfies the caller: snapshot a
      // single node when only one is needed, otherwise stream matches.
      const resultType = first ? g.XPathResult.FIRST_ORDERED_NODE_TYPE : g.XPathResult.ORDERED_NODE_ITERATOR_TYPE;

      const nativeResult = g.document.evaluate(expression, context as unknown as Node, null, resultType, null);

      return {
        singleNodeValue: first ? (nativeResult.singleNodeValue as unknown as DomNode | null) : null,
        iterateNext: () => nativeResult.iterateNext() as unknown as DomNode | null,
      };
    },

    isNode: (value): value is DomNode =>
      typeof value === 'object' && value !== null && value instanceof (g.Node as unknown as new () => object),
  };
};
