import { DOMParser } from '@xmldom/xmldom';
import * as xpath from 'xpath';

import type { DomNode, Engine } from './engine';

/**
 * Pure-JavaScript {@link Engine} backed by `@xmldom/xmldom` and the `xpath`
 * package. Used in environments without a native `document.evaluate`
 * (notably plain Node.js).
 *
 * The interesting work in this module is namespace bridging: HTML documents
 * parsed by `@xmldom/xmldom` live in the XHTML namespace, but the XPath 1.0
 * data model treats unprefixed name tests as belonging to the *null*
 * namespace. To keep XPath expressions readable (`//div`, not `//h:div`),
 * we transparently rewrite unprefixed element name tests to use a fixed
 * `h:` prefix bound to the XHTML namespace before handing them to `xpath`.
 */

/** XHTML namespace URI used by `@xmldom/xmldom` for parsed HTML elements. */
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * `xpath.select`-style function pre-bound to the `h:` → XHTML namespace
 * prefix. All evaluations route through this so the prefix injection stays
 * consistent with the bindings the `xpath` library knows about.
 */
const selectWithXhtmlNs = xpath.useNamespaces({ h: XHTML_NS });

/**
 * Reserved XPath axis names. When one of these appears as an identifier
 * followed by `::`, it must not be treated as an element name (and therefore
 * not be namespace-prefixed).
 */
const XPATH_AXIS_NAMES: ReadonlySet<string> = new Set([
  'self',
  'child',
  'parent',
  'descendant',
  'ancestor',
  'following',
  'preceding',
  'attribute',
  'namespace',
  'following-sibling',
  'preceding-sibling',
  'descendant-or-self',
  'ancestor-or-self',
]);

/**
 * Reserved XPath node-test function names (`text()`, `node()`, etc.). These
 * look like identifiers followed by `(` but are not element names and must
 * not be prefixed.
 */
const XPATH_NODE_TEST_NAMES: ReadonlySet<string> = new Set(['text', 'node', 'comment', 'processing-instruction']);

/**
 * Walk an XPath 1.0 expression and prefix unprefixed element name tests with
 * `h:` so they resolve against the XHTML namespace.
 *
 * The rewriter deliberately leaves the following untouched:
 *
 *  - axis names followed by `::` (e.g. `descendant::div`)
 *  - node-test functions (`text()`, `node()`, `comment()`,
 *    `processing-instruction()`)
 *  - any other XPath function call (identifier immediately followed by `(`)
 *  - attribute (`@name`) and variable (`$name`) references
 *  - identifiers that already carry a namespace prefix (`foo:bar`)
 *  - the contents of string literals (`'…'` or `"…"`)
 *
 * This is a lightweight tokenizer rather than a full XPath parser; it is
 * sufficient for the expression shapes the library is designed to handle
 * and avoids pulling in a heavyweight XPath grammar at runtime.
 *
 * @param expression - The original XPath expression.
 * @returns The expression with unprefixed element names rewritten.
 */
const prefixHtmlElementNames = (expression: string): string => {
  let output = '';
  let cursor = 0;
  const length = expression.length;

  // When non-null, we are inside a string literal opened by this quote
  // character and must copy bytes through verbatim until it closes.
  let openStringQuote: string | null = null;

  while (cursor < length) {
    const char = expression[cursor]!;

    // Pass through the body of an open string literal until we hit the
    // matching closing quote. XPath 1.0 has no escape syntax inside string
    // literals, so a simple "next quote of the same kind" rule is correct.
    if (openStringQuote !== null) {
      output += char;
      if (char === openStringQuote) openStringQuote = null;
      cursor++;
      continue;
    }

    if (char === '"' || char === "'") {
      openStringQuote = char;
      output += char;
      cursor++;
      continue;
    }

    // Identifier start: collect the full `[A-Za-z_][\w-]*` name and decide
    // whether it represents an element (and therefore needs the `h:` prefix)
    // or one of the syntactic constructs listed above.
    if (/[A-Za-z_]/.test(char)) {
      let nameEnd = cursor;
      while (nameEnd < length && /[\w-]/.test(expression[nameEnd]!)) nameEnd++;
      const name = expression.slice(cursor, nameEnd);

      const prevChar = lastNonWhitespace(output);
      const nextChar = expression[nameEnd];

      // `name::` — an axis specifier such as `descendant::div`.
      const isAxisSpecifier = nextChar === ':' && expression[nameEnd + 1] === ':';

      // `name(` — any function/node-test call (skipping intervening spaces).
      const isFunctionCall = (() => {
        let k = nameEnd;
        while (k < length && expression[k] === ' ') k++;
        return expression[k] === '(';
      })();

      // `prefix:name` — already namespaced. We detect this by a single ':'
      // immediately preceding the identifier (and not a '::' axis marker).
      const isAlreadyPrefixed = prevChar === ':' && lastNonWhitespace(output.slice(0, -1)) !== ':';

      // `@name` (attribute) or `$name` (variable) — never an element.
      const isAttributeOrVariable = prevChar === '@' || prevChar === '$';

      const shouldLeaveUnprefixed =
        isAxisSpecifier ||
        XPATH_AXIS_NAMES.has(name) ||
        XPATH_NODE_TEST_NAMES.has(name) ||
        isAlreadyPrefixed ||
        isAttributeOrVariable ||
        isFunctionCall;

      output += shouldLeaveUnprefixed ? name : `h:${name}`;
      cursor = nameEnd;
      continue;
    }

    output += char;
    cursor++;
  }

  return output;
};

/**
 * Return the last non-whitespace character of `s`, or `''` if there is none.
 * Used by the rewriter to look back at the character preceding an identifier
 * without having to track it as separate state.
 */
const lastNonWhitespace = (s: string): string => {
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i]!;
    if (ch !== ' ' && ch !== '\t') return ch;
  }
  return '';
};

/**
 * Build an {@link Engine} backed by `@xmldom/xmldom` for parsing and the
 * `xpath` package for XPath 1.0 evaluation.
 *
 * Use this engine in environments without a native DOM (most server-side
 * Node.js usage). In environments where {@link createNativeEngine} is
 * available, prefer it — the native implementation is significantly faster.
 */
export const createXmlDomEngine = (): Engine => ({
  parse: (html: string) => {
    // Real-world HTML routinely contains warnings/recoverable errors that
    // `@xmldom/xmldom` would otherwise log to stderr. Silence them — the
    // parser is forgiving and the resulting tree is what callers care about.
    const parser = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {},
      },
    });
    return parser.parseFromString(html, 'text/html') as unknown as DomNode;
  },

  evaluate: (expression, context, first) => {
    const namespaceAwareExpression = prefixHtmlElementNames(expression);
    const selected = selectWithXhtmlNs(namespaceAwareExpression, context as unknown as Node) as unknown;

    // `xpath.select` returns an array for node sets, a single value for
    // anything else (string/number/boolean/single node) and `undefined`
    // when there is no match. Normalize all of these to a node array so
    // the iteration contract below stays uniform.
    const matches: DomNode[] = Array.isArray(selected)
      ? (selected as DomNode[])
      : selected
        ? [selected as DomNode]
        : [];

    let cursor = 0;
    return {
      singleNodeValue: first ? (matches[0] ?? null) : null,
      iterateNext: () => (cursor < matches.length ? (matches[cursor++] ?? null) : null),
    };
  },

  isNode: (value): value is DomNode =>
    typeof value === 'object' && value !== null && typeof (value as DomNode).nodeType === 'number',
});
