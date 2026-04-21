# <img src="./html/assets/logo.png" width="28" height="28"> XPath Parser

[![Package](https://img.shields.io/npm/v/@remotemerge/xpath-parser?logo=npm&logoColor=fff)](https://www.npmjs.com/package/@remotemerge/xpath-parser)
[![Build](https://img.shields.io/github/actions/workflow/status/remotemerge/xpath-parser/publish.yml?logo=github-actions&logoColor=fff&label=build)](https://github.com/remotemerge/xpath-parser/actions/workflows/publish.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/remotemerge/xpath-parser/test.yml?logo=bun&logoColor=fff&label=tests)](https://github.com/remotemerge/xpath-parser/actions/workflows/test.yml)
[![Downloads](https://img.shields.io/npm/dt/@remotemerge/xpath-parser?logo=icloud&logoColor=fff)](https://www.npmjs.com/package/@remotemerge/xpath-parser)
[![Size](https://img.shields.io/bundlephobia/minzip/@remotemerge/xpath-parser?logo=nodedotjs&logoColor=fff&label=size)](https://bundlephobia.com/package/@remotemerge/xpath-parser)
[![License](https://img.shields.io/github/license/remotemerge/xpath-parser?logo=opensourceinitiative&logoColor=fff)](LICENSE)

## Overview

`@remotemerge/xpath-parser` is a focused TypeScript library for extracting data from HTML and XML with XPath. Write an expression, evaluate it, and get the result back without extra wrappers or unnecessary ceremony.

The same API works in the browser, in jsdom, and in plain Node.js. The library selects the appropriate engine for the current runtime. When native `document.evaluate` is available, it uses the browser implementation; otherwise, it falls back to a pure JavaScript engine powered by `@xmldom/xmldom`. The API remains consistent across environments. The package is authored in TypeScript 6.x, shipped as both ESM and CJS, and fully typed.

The library targets XPath 1.0, the version already supported by browsers. That choice favors compatibility and predictability over newer XPath 2.0 and 3.1 features.

### What it is good at

- Pulling text, attributes, and node lists out of HTML or XML.
- Running the same scraper logic in a browser extension, a headless session, or a server-side pipeline.
- Extracting structured records, one field at a time or many rows at once, without writing a parser per field.

### What it is not

- Not an XPath 2.0 or 3.1 engine. No sequences, no typed values, no higher-order functions.
- Not a typed-value API. Results come back as trimmed strings; cast them at the edge if you need numbers or booleans.
- Not a renderer. `waitXPath` polls the document it was given; something else has to bring the page to life.

## Installation

```bash
# npm
npm install @remotemerge/xpath-parser

# yarn
yarn add @remotemerge/xpath-parser

# pnpm
pnpm add @remotemerge/xpath-parser

# bun
bun add @remotemerge/xpath-parser
```

## Quick Start

A basic query usually takes only a few lines:

```typescript
import XPathParser from "@remotemerge/xpath-parser";

const parser = new XPathParser("<html><body><h1>Hello</h1></body></html>");
const title = parser.queryFirst("//h1");
// "Hello"
```

That is the core model of the library. The rest of the API builds on the same idea: one match, many matches, one record, many records, or a match that appears later.

## Entry Points

The package provides three entry points. In most cases, the universal entry point is the best default. It detects the runtime automatically.

| Import                              | Class                  | Engine                              | When to use                                                          |
|-------------------------------------|------------------------|-------------------------------------|----------------------------------------------------------------------|
| `@remotemerge/xpath-parser`         | `UniversalXPathParser` | Auto-detected (native if available) | Default. Works in browsers, jsdom, happy-dom, and Node.js.           |
| `@remotemerge/xpath-parser/browser` | `BrowserXPathParser`   | Native DOM (`document.evaluate`)    | Browser-only bundles that must tree-shake out the `xmldom` fallback. |
| `@remotemerge/xpath-parser/node`    | `NodeXPathParser`      | `@xmldom/xmldom` + `xpath`          | Node.js runtimes where a deterministic, DOM-free engine is required. |

```typescript
import XPathParser from "@remotemerge/xpath-parser";
import BrowserXPathParser from "@remotemerge/xpath-parser/browser";
import NodeXPathParser from "@remotemerge/xpath-parser/node";
```

All three classes extend the same base class, so the API below applies to each entry point.

## API Reference

### Construction

```text
new XPathParser(content: DomNode | string)
```

Pass a string to have the parser create a document automatically. Pass an existing node, such as a live `document` or parsed fragment, to query it directly and skip parsing. In both cases, the rest of the API behaves the same way.

### `queryFirst(expression: string): string`

Use this method to retrieve a single value. It returns the trimmed text of the first match, or an empty string when nothing matches, which keeps calling code straightforward.

```typescript
const title = parser.queryFirst('//span[@id="productTitle"]');
```

### `queryList(expression: string): string[]`

Use this method when multiple matches are expected. It returns every result as a trimmed string in document order. If nothing matches, it returns an empty array.

```typescript
const titles = parser.queryList('//span[contains(@class, "zg-item")]/a/div');
```

### `multiQuery(queries: Record<string, string>): Record<string, string>`

This method maps a record shape to a set of XPath expressions. Each field is evaluated once, and each value is returned as the first match. It works well for single-page records such as product detail pages.

```typescript
const product = parser.multiQuery({
  title: '//div[@id="ppd"]//span[@id="productTitle"]',
  seller: '//div[@id="ppd"]//a[@id="bylineInfo"]',
  price: '//div[@id="ppd"]//span[@id="priceblock_dealprice"]',
  rating: '//div[@id="ppd"]//span[@id="acrCustomerReviewText"]',
});
```

Sample output:

```text
{
  title: 'LETSCOM Fitness Tracker HR, Activity Tracker Watch...',
  seller: 'LETSCOM',
  price: '$20.39',
  rating: '1,489 ratings',
}
```

### `subQuery(expression: SubQueryExpression): SubQueryResult`

`subQuery` is designed for repeated structures such as product tiles, search results, or table rows. Set `root` to the repeating container, define the record shape in `queries`, and the parser will return an array of records. If a `pagination` expression is included, the next-page link is returned as well.

```typescript
const result = parser.subQuery({
  root: '//span[contains(@class, "zg-item")]',
  pagination: '//ul/li/a[contains(text(), "Next")]/@href',
  queries: {
    title: "a/div/@title",
    url: "a/@href",
    image: "a/span/div/img/@src",
    price: './/span[contains(@class, "a-color-price")]',
  },
});
```

Sample output:

```text
{
  paginationUrl: 'https://www.example.com/gp/new-releases/wireless/ref=...&pg=2',
  results: [
    {
      title: 'Cell Phone Stand, Angle Height Adjustable...',
      url: '/Adjustable-LISEN-Aluminum-Compatible-4-10...',
      image: 'https://images-na.ssl-images-example.com/images/I/61UL200_.jpg',
      price: '$16.99',
    },
    // ...
  ],
}
```

Types:

```typescript
type SubQueryExpression = {
  root: string;
  pagination?: string;
  queries: Record<string, string>;
};

type SubQueryResult = {
  paginationUrl?: string;
  results: Record<string, string>[];
};
```

### `waitXPath(expression: string, maxSeconds?: number): Promise<WaitXPathResult>`

Modern pages often render content incrementally. `waitXPath` handles that case by checking the document once per second and resolving as soon as the expression matches. By default, it waits for up to ten seconds. If the timeout is exceeded, the promise rejects with an `Error` named `'TimeoutError'`.

```typescript
try {
  const { message } = await parser.waitXPath('//span[contains(@class, "a-color-price")]/span');
  // element found; message contains the trimmed text
} catch (error) {
  // TimeoutError: element did not appear within maxSeconds
}
```

`waitXPath` only observes the current document. It does not fetch, render, or drive page updates. Pair it with a headless browser or any process that mutates the DOM, and it will resolve as soon as the target appears.

### Exported Types

Each entry point re-exports the public types:

```typescript
import type { DomNode, Engine, EvaluateResult, SubQueryExpression, SubQueryResult, WaitXPathResult } from "@remotemerge/xpath-parser";
```

## Architecture

The architecture is intentionally simple: a high-level `XPathParser` sits on top of a pluggable `Engine` that handles DOM parsing and XPath evaluation. This separation is what allows the same API to work in both browser and Node.js environments.

```text
           ┌────────────────────────────────────┐
           │           XPathParser              │
           │  (queryFirst, queryList,           │
           │   multiQuery, subQuery, waitXPath) │
           └──────────────┬─────────────────────┘
                          │ uses
                          ▼
                 ┌──────────────────┐
                 │      Engine      │
                 │  parse / evaluate│
                 └────────┬─────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  createNativeEngine              createXmlDomEngine
  (document.evaluate)             (@xmldom/xmldom + xpath)
```

### The `Engine` contract

```typescript
type Engine = {
  parse(html: string): DomNode;
  evaluate(expression: string, context: DomNode, first: boolean): EvaluateResult;
  isNode(value: unknown): value is DomNode;
};
```

The contract consists of three methods:

- `parse` takes a string and hands back something queryable.
- `evaluate` runs an XPath expression. With `first: true`, it follows the fast path for a single match; otherwise, it returns an iterator for multiple matches.
- `isNode` determines whether a value belongs to the engine's node model.

During `subQuery`, the parser rebinds the evaluation context to each matched root. That is why expressions inside `queries` can be written relative to the current row.

### Native engine

When a real DOM is available, the library uses it directly. `createNativeEngine` reads `document`, `DOMParser`, `XPathResult`, and `Node` from `globalThis` and relies on `document.evaluate`. For `queryFirst`, it requests `FIRST_ORDERED_NODE_TYPE` so the browser can stop after the first match. For `queryList`, it uses an iterator to avoid materializing results unnecessarily.

The universal entry point checks for `document` and `XPathResult` through `hasNativeDom()` during construction. If both are present, the native engine is selected automatically.

### xmldom engine

In plain Node.js, there is no native `document.evaluate`, so the library includes a pure JavaScript engine built on `@xmldom/xmldom` and `xpath`. It also handles an important namespace detail: HTML parsed by `xmldom` is placed in the XHTML namespace, while scraper XPath expressions typically omit prefixes. The engine rewrites expressions only where needed, so `//div[@id="main"]` continues to work as expected.

The rewriter knows the difference between an element name and:

- an axis (`descendant::`, `self::`, `parent::` and friends),
- a node test (`text()`, `node()`, `comment()`, `processing-instruction()`),
- a function call,
- an attribute or variable reference (`@name`, `$var`).

Those forms are preserved as-is. Bare element names receive the prefix. Everything else remains readable and familiar.

### `DomNode`

Both engines expose the same minimal node shape, so the parser does not need to care which engine produced it:

```typescript
type DomNode = {
  nodeType: number;
  textContent?: string | null;
  value?: string;
};
```

This is enough for both environments. Attribute nodes (`nodeType === 2`) expose their content through `value`; all other nodes use `textContent`. The parser reads the applicable field and returns a trimmed string.

## Usage Patterns

### Working with a pre-parsed document

If a document is already available, parsing can be skipped. Every entry point accepts a node as well as a string.

```typescript
import BrowserXPathParser from "@remotemerge/xpath-parser/browser";

const parser = new BrowserXPathParser(document);
const hrefs = parser.queryList("//a/@href");
```

### Server-side scraping

Fetch the page, pass it to the parser, and describe the record shape.

```typescript
import NodeXPathParser from "@remotemerge/xpath-parser/node";

const response = await fetch("https://example.com/product/123");
const html = await response.text();

const parser = new NodeXPathParser(html);
const product = parser.multiQuery({
  title: "//h1",
  price: '//span[contains(@class, "price")]',
});
```

### Combined listing and pagination

Extract listing data and the next-page link in a single pass.

```typescript
const page = parser.subQuery({
  root: '//li[contains(@class, "result")]',
  pagination: '//a[@rel="next"]/@href',
  queries: {
    title: ".//h2",
    url: ".//a/@href",
  },
});

for (const item of page.results) {
  // process item
}

if (page.paginationUrl) {
  // fetch next page
}
```

## Error Handling

The parser treats missing data as a normal result rather than an exceptional condition:

- `queryFirst` returns `''`, `queryList` returns `[]`, and `multiQuery` / `subQuery` return records with empty fields instead of throwing.
- Invalid XPath is handled differently. The underlying engine throws a runtime error instead: a `DOMException` in the browser or a standard `Error` from the `xpath` package in Node.js. These errors are not swallowed. If expressions may come from user input, wrap calls in `try` / `catch`.
- `waitXPath` is the only method designed to reject during normal use, returning an `Error` named `'TimeoutError'` when the timeout expires.

## Compatibility

- **Runtime:** modern ES2022+ engines. Ships as ESM (`.mjs`) and CJS (`.cjs`) with conditional exports so browser and Node consumers each receive an appropriate bundle.
- **TypeScript:** `.d.ts` files are included under `dist/types`, so IntelliSense is available immediately after installation.
- **XPath level:** XPath 1.0, the version implemented by browsers and the `xpath` npm package. XPath 2.0 and 3.1 features are not supported.
- **Server-side parsing:** powered by `@xmldom/xmldom`. It works well with well-formed HTML, but it is stricter than the browser parser, so severely malformed pages may parse differently than they would in a browser.

## Performance Considerations

The library is small, but several implementation details improve efficiency:

- `queryFirst` uses `FIRST_ORDERED_NODE_TYPE` in the native engine, allowing the browser to stop as soon as a match is found.
- `subQuery` rebinds the evaluation context to each matched root instead of re-querying the entire document per row. Work stays proportional to the subtree that actually matters.
- Parsing is typically the most expensive step. Reusing a single parser instance across multiple queries avoids repeated parse work.
- In the `xmldom` engine, expression rewriting runs in a single linear pass and is typically negligible compared to evaluation itself.

## Contributing

Contributions are welcome, including bug fixes, new examples, documentation improvements, and missing edge cases. For larger changes, opening an issue first helps align with the approach before implementation begins.

Before sending a pull request, make sure the tests and linter are happy:

```bash
bun install
bun test
bun run lint
```

Bug reports and feature requests can be filed here: [Bug Reports](https://github.com/remotemerge/xpath-parser/issues).

## Disclaimer

The XPath expressions in this README are taken from public product pages for demonstration purposes only. They are intended to illustrate the API, not to endorse scraping any specific site. Always respect applicable terms of service and `robots.txt` policies.

Logo courtesy of [flaticon](https://www.flaticon.com).
