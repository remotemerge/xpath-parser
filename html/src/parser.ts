import type { DomNode, Engine } from './engine';
import { getNodeValue } from './engine';

/**
 * Shape of the compound expression accepted by {@link XPathParser.subQuery}.
 *
 * - `root` selects the container nodes (one per record).
 * - `queries` is a map of `field name → XPath` evaluated *relative to each
 *   root* to build each record.
 * - `pagination`, when provided, is evaluated once after the records are
 *   collected and returned as `paginationUrl`.
 */
export type SubQueryExpression = {
  /** XPath selecting the container nodes that delimit each record. */
  root: string;
  /** Optional XPath that extracts a pagination URL from the document. */
  pagination?: string;
  /** Map of result field names to XPath expressions, evaluated per-root. */
  queries: Record<string, string>;
};

/**
 * Result returned by {@link XPathParser.subQuery}.
 */
export type SubQueryResult = {
  /** Pagination URL, when a `pagination` expression was supplied and matched. */
  paginationUrl?: string;
  /** One record per matched root, with string values per query field. */
  results: Record<string, string>[];
};

/**
 * Awaited payload of {@link XPathParser.waitXPath}.
 */
export type WaitXPathResult = {
  /** Always `true` when the promise resolves. */
  found: boolean;
  /** Trimmed text of the first matching node. */
  message: string;
};

/**
 * Internal helper type — retained for backwards compatibility with earlier
 * call sites that imported `Expression` from this module via TypeScript's
 * structural typing. Prefer {@link SubQueryExpression} in new code.
 *
 * @internal
 */
type Expression = SubQueryExpression;

/**
 * High-level XPath-driven scraper built on top of a pluggable {@link Engine}.
 *
 * `XPathParser` is not usually instantiated directly. Instead, pick the
 * environment-specific subclass that wires in the right engine:
 *
 *  - `UniversalXPathParser` (`./index`) — auto-detects the environment.
 *  - `BrowserXPathParser`   (`./browser`) — forces the native DOM engine.
 *  - `NodeXPathParser`      (`./node`)    — forces the `xmldom` engine.
 *
 * The class offers four ways to extract data:
 *
 *  - {@link queryFirst} — scalar: first match as a trimmed string.
 *  - {@link queryList}  — list: all matches as trimmed strings.
 *  - {@link multiQuery} — record: `{ field: queryFirst(xpath) }` per field.
 *  - {@link subQuery}   — list of records, one per "root" node, plus
 *    optional pagination URL.
 *
 *  Plus {@link waitXPath} for polling a dynamic document.
 */
export default class XPathParser {
  /** The underlying DOM/XPath backend. */
  private readonly engine: Engine;

  /**
   * Mode flag consumed by {@link evaluate}. The public `queryFirst`/
   * `queryList`/`subQuery` methods toggle this before calling `evaluate`,
   * which in turn asks the engine for the cheapest result type.
   */
  private options = { queryFirst: false };

  /**
   * Current evaluation context. Starts as the parsed document root and is
   * temporarily re-pointed at each matched root while iterating inside
   * {@link subQuery}.
   */
  private domContent: DomNode;

  /**
   * @param content - Either an HTML/XML string (which will be parsed by the
   *                  engine) or a pre-parsed DOM node to query directly.
   * @param engine  - The DOM/XPath backend to use.
   */
  constructor(content: DomNode | string, engine: Engine) {
    this.engine = engine;
    this.domContent = typeof content === 'string' ? engine.parse(content) : content;
  }

  /**
   * Low-level evaluation against the current context node.
   *
   * The result honours the most recently-requested mode — callers that need
   * a specific shape should prefer the higher-level helpers rather than
   * invoking this directly.
   */
  evaluate(expression: string) {
    const firstOnly = this.options.queryFirst;
    return this.engine.evaluate(expression, this.domContent, firstOnly);
  }

  /**
   * Extract the trimmed string value of a node, or `''` for `null`.
   * Thin pass-through to {@link getNodeValue}, kept as an instance method
   * so it can be overridden by subclasses if needed.
   */
  getValue(node: DomNode | null): string {
    return getNodeValue(node);
  }

  /**
   * Return the first matching node's value as a trimmed string.
   *
   * Returns `''` when the expression matches nothing, so callers can treat
   * the result as a plain string without null-checking.
   */
  queryFirst(expression: string): string {
    this.options.queryFirst = true;
    return this.getValue(this.evaluate(expression).singleNodeValue);
  }

  /**
   * Return the trimmed string values of *all* matching nodes, in document
   * order. Empty array when nothing matches.
   */
  queryList(expression: string): string[] {
    this.options.queryFirst = false;
    const values: string[] = [];

    const result = this.evaluate(expression);
    let node: DomNode | null;
    while ((node = result.iterateNext())) {
      values.push(this.getValue(node));
    }
    return values;
  }

  /**
   * Run one XPath per field and collect the first match of each into a
   * single record. Equivalent to:
   *
   * ```ts
   * Object.fromEntries(
   *   Object.entries(queries).map(([k, xp]) => [k, parser.queryFirst(xp)]),
   * );
   * ```
   *
   * but packaged as a single call for convenience.
   */
  multiQuery(expressions: Expression['queries']): Record<string, string> {
    const record: Record<string, string> = {};
    Object.keys(expressions).forEach((field) => {
      record[field] = this.queryFirst(expressions[field]!);
    });
    return record;
  }

  /**
   * Repeated record extraction: evaluate `expression.root` to find record
   * containers, then for each container evaluate every `expression.queries`
   * entry *relative to that container* and emit one record per root.
   *
   * When `expression.pagination` is supplied, it is evaluated once after
   * record collection and returned as `paginationUrl`.
   */
  subQuery(expression: Expression): SubQueryResult {
    this.options.queryFirst = false;
    const rootResult = this.evaluate(expression.root);

    const results: Record<string, string>[] = [];
    let rootNode: DomNode | null;

    while ((rootNode = rootResult.iterateNext())) {
      // Temporarily rebind the evaluation context to the current root so
      // that the per-field queries (which are written relative to the root)
      // resolve against it. The context is left pointing at the final root
      // after the loop; pagination queries below are typically written with
      // a leading `//`, making them document-absolute regardless.
      this.domContent = rootNode;

      const record: Record<string, string> = {};
      Object.entries(expression.queries).forEach(([field, xpathExpr]) => {
        record[field] = this.queryFirst(xpathExpr);
      });
      results.push(record);
    }

    const response: SubQueryResult = { results };
    if (expression.pagination) {
      response.paginationUrl = this.queryFirst(expression.pagination);
    }
    return response;
  }

  /**
   * Poll the document once per second for an XPath match, resolving as soon
   * as a non-empty value is found.
   *
   * Useful for drivers that hand this parser a live document whose contents
   * arrive asynchronously (e.g. a headless browser rendering JS).
   *
   * @param expression - XPath to wait for.
   * @param maxSeconds - Maximum number of 1-second ticks before giving up.
   *                     Defaults to `10`.
   * @returns A promise that resolves with `{ found: true, message }` on
   *          success, or rejects with a `TimeoutError` once the budget is
   *          exhausted.
   */
  async waitXPath(expression: string, maxSeconds = 10): Promise<WaitXPathResult> {
    let elapsedTicks = 1;
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        const firstMatch = this.queryFirst(expression);
        if (firstMatch) {
          clearInterval(intervalId);
          resolve({ found: true, message: firstMatch });
        }
        if (elapsedTicks++ >= maxSeconds) {
          clearInterval(intervalId);
          const timeoutError = new Error('Element not found');
          timeoutError.name = 'TimeoutError';
          reject(timeoutError);
        }
      }, 1000);
    });
  }
}
