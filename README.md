# <img src="./html/assets/logo.png" width="28" height="28"> XPath Parser

[![Package](https://img.shields.io/npm/v/@remotemerge/xpath-parser?logo=npm&logoColor=fff)](https://www.npmjs.com/package/@remotemerge/xpath-parser)
[![Build](https://img.shields.io/github/actions/workflow/status/remotemerge/xpath-parser/publish.yml?logo=github-actions&logoColor=fff&label=build)](https://github.com/remotemerge/xpath-parser/actions/workflows/publish.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/remotemerge/xpath-parser/test.yml?logo=bun&logoColor=fff&label=tests)](https://github.com/remotemerge/xpath-parser/actions/workflows/test.yml)
[![Downloads](https://img.shields.io/npm/dt/@remotemerge/xpath-parser?logo=icloud&logoColor=fff)](https://www.npmjs.com/package/@remotemerge/xpath-parser)
[![Size](https://img.shields.io/bundlephobia/minzip/@remotemerge/xpath-parser?logo=nodedotjs&logoColor=fff&label=size)](https://bundlephobia.com/package/@remotemerge/xpath-parser)
[![License](https://img.shields.io/github/license/remotemerge/xpath-parser?logo=opensourceinitiative&logoColor=fff)](LICENSE)

## Overview

Scraping a page should feel as direct as pointing at what you want. `@remotemerge/xpath-parser` is a small, focused TypeScript library that lets XPath do the talking. Write the expression, get the value back. No selector gymnastics, no wrappers around, no ceremony.

The same code runs in the browser, in jsdom, and in plain Node.js. The library quietly picks the right engine for the runtime. When the browser's native `document.evaluate` is available it uses that, and when it is not, it falls back to a pure-JavaScript `@xmldom/xmldom` engine. The API looks identical everywhere. Authored in TypeScript 6.x, shipped as ESM and CJS, and typed end-to-end.

This is XPath 1.0, the dialect every browser already speaks. That is a deliberate trade: broad compatibility and a predictable surface area, at the cost of features from XPath 2.0 and 3.1.

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

Three lines are usually enough to see a result:

```typescript
import XPathParser from "@remotemerge/xpath-parser";

const parser = new XPathParser("<html><body><h1>Hello</h1></body></html>");
const title = parser.queryFirst("//h1");
// "Hello"
```

That is the whole shape of the library. Everything else is variations on this idea: one match, many matches, one record, many records, or a match that has not arrived yet.

## Entry Points

There are three entry points, and picking one is mostly about how much you care where the code ends up running. If you are not sure, start with the universal one. It figures it out on its own.

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

All three classes share the same base class, so the API below applies regardless of which one you import.

## API Reference

### Construction

```text
new XPathParser(content: DomNode | string)
```

Pass in a string and the parser will turn it into a document for you. Pass in a node you already have (a live `document`, a parsed fragment, anything the engine recognises) and it will query against that directly, skipping the parse step entirely. Either way, the rest of the API behaves the same.

### `queryFirst(expression: string): string`

The workhorse for "give me this one thing." Returns the trimmed text of the first match, or an empty string when nothing matches, so you can write straight-line code without a single `if (x != null)`.

```typescript
const title = parser.queryFirst('//span[@id="productTitle"]');
```

### `queryList(expression: string): string[]`

When one is not enough. Returns every match as a trimmed string, in document order. Missed entirely? You get an empty array. No surprises, no exceptions.

```typescript
const titles = parser.queryList('//span[contains(@class, "zg-item")]/a/div');
```

### `multiQuery(queries: Record<string, string>): Record<string, string>`

The shape of a record, described as a map of XPaths. Each field runs once; each value comes back as the first match. Perfect for the "one product per page" case where you want title, price, rating, and seller in a single call.

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

The listing-page companion to `multiQuery`. Point `root` at the container that repeats (a product tile, a search result, a table row), describe the shape of one record in `queries`, and the parser will walk every match and build a clean array of records for you. Throw in a `pagination` expression and the next-page link comes along for the ride.

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

Modern pages arrive in pieces. `waitXPath` is the escape hatch for that reality: it checks the document once per second and resolves the moment the expression finds something real. Default patience is ten seconds; exceed it and the promise rejects with an `Error` named `'TimeoutError'`. It is easy to branch on and impossible to ignore.

```typescript
try {
  const { message } = await parser.waitXPath('//span[contains(@class, "a-color-price")]/span');
  // element found; message contains the trimmed text
} catch (error) {
  // TimeoutError: element did not appear within maxSeconds
}
```

`waitXPath` watches; it does not fetch or render. Pair it with a headless browser, a mutation-heavy widget, or any driver changing the document underneath you, and it will pick up the result the instant it lands.

### Exported Types

Each entry point re-exports the public types:

```typescript
import type { DomNode, Engine, EvaluateResult, SubQueryExpression, SubQueryResult, WaitXPathResult } from "@remotemerge/xpath-parser";
```

## Architecture

Underneath the friendly API is a very short story: a high-level `XPathParser` on top, and a pluggable `Engine` doing the actual DOM and XPath work below. The seam between them is what makes the same code run in a browser tab and a plain Node process without conditionals.

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

Three methods, nothing more:

- `parse` takes a string and hands back something queryable.
- `evaluate` runs the expression. Ask for one match with `first: true` and it takes a fast path; ask for many, and it hands back an iterator.
- `isNode` answers the quiet question "is this one of mine?"

While `subQuery` walks a list of records, the parser rebinds its evaluation context to each root in turn. That is why the per-field expressions inside `queries` can be written relative to the row: they really are evaluated from there.

### Native engine

When a real DOM is in scope, use it. `createNativeEngine` pulls `document`, `DOMParser`, `XPathResult`, and `Node` straight from `globalThis` and leans on `document.evaluate`. For `queryFirst` it asks for `FIRST_ORDERED_NODE_TYPE` so the browser can stop looking after the first hit; for `queryList` it uses an iterator so nothing is materialized that you are not going to read.

The universal entry point checks for `document` and `XPathResult` via `hasNativeDom()` at construction time. If they are there, the native engine wins. You do not have to think about it.

### xmldom engine

On plain Node.js there is no `document` to evaluate against, so the library ships a pure-JavaScript engine built on `@xmldom/xmldom` and the `xpath` package. It covers one awkward corner on your behalf: HTML parsed by `xmldom` is implicitly in the XHTML namespace, but scraper XPath almost never writes `h:div`. The engine rewrites your expression to add that prefix where, and _only_ where, it is actually necessary, so `//div[@id="main"]` works the way you wrote it.

The rewriter knows the difference between an element name and:

- an axis (`descendant::`, `self::`, `parent::` and friends),
- a node test (`text()`, `node()`, `comment()`, `processing-instruction()`),
- a function call,
- an attribute or variable reference (`@name`, `$var`).

Each of those is left alone. Bare element names get the prefix. Everything else continues to read like the XPath you already know.

### `DomNode`

Both engines speak the same tiny node shape, so the parser never needs to care who produced it:

```typescript
type DomNode = {
  nodeType: number;
  textContent?: string | null;
  value?: string;
};
```

That is enough to cover both worlds. Attribute nodes (`nodeType === 2`) expose their value via `value`; everything else exposes it via `textContent`. The parser reads whichever one applies and hands you a trimmed string.

## Usage Patterns

### Working with a pre-parsed document

Already have a document in the hand? Skip the parse step. Every entry point takes a node as happily as a string.

```typescript
import BrowserXPathParser from "@remotemerge/xpath-parser/browser";

const parser = new BrowserXPathParser(document);
const hrefs = parser.queryList("//a/@href");
```

### Server-side scraping

Fetch the page, hand it to the parser, and describe the record. Done.

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

Scrape the page and pick up the link to the next one and the same breath.

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

The parser tries hard not to make missing data an exception. Empty results are data:

- `queryFirst` returns `''`, `queryList` returns `[]`, and `multiQuery` / `subQuery` return records with empty fields rather than throwing. Branching on "did this match?" stays at the value level, where it is easiest to read.
- Invalid XPath is a different story: the underlying engine raises (a `DOMException` in the browser, a standard `Error` from the `xpath` package in Node). The parser does not swallow these. If your expressions come from user input, wrap the call in `try` / `catch`.
- `waitXPath` is the one method that can reject on purpose, with an `Error` named `'TimeoutError'` when the budget runs out. Easy to spot, easy to handle.

## Compatibility

- **Runtime:** modern ES2022+ engines. Ships as ESM (`.mjs`) and CJS (`.cjs`) with conditional exports so browser and Node consumers each get a tuned bundle.
- **TypeScript:** `.d.ts` files live alongside the code under `dist/types`, so IntelliSense works the moment you install.
- **XPath level:** XPath 1.0, the dialect that every browser and the `xpath` npm package already implement. No 2.0/3.1 features.
- **Server-side parsing:** handled by `@xmldom/xmldom`. It is happy with well-formed HTML but stricter than the browser's forgiving parser, so pages that are wildly broken may parse a little differently than they would in a tab.

## Performance Considerations

The library is small, but a few details earn their keep:

- When you call `queryFirst`, the native engine asks the browser for `FIRST_ORDERED_NODE_TYPE`, so it can stop looking the moment it finds a hit. You do not pay for results you are not going to read.
- `subQuery` rebinds the evaluation context to each matched root instead of re-querying the entire document per row. Work stays proportional to the subtree that actually matters.
- Parsing a document is the most expensive thing a scraper does. Reuse a single parser instance across many queries, and it will only parse once.
- The xmldom engine rewrites each expression in a single linear pass. In practice the cost disappears behind the first evaluation and never comes back.

## Contributing

Contributions are genuinely welcome: bug fixes, new examples, docs improvements, and edge cases we missed. For anything significant, open an issue first so we can agree on the shape before you write the code.

Before sending a pull request, make sure the tests and linter are happy:

```bash
bun install
bun test
bun run lint
```

Bug reports and feature requests live here: [Bug Reports](https://github.com/remotemerge/xpath-parser/issues).

## Disclaimer

The XPath expressions in this README are drawn from public product pages for illustration only. They are meant to teach the shape of the API, not to endorse scraping any particular site. Please respect the terms of service and `robots.txt` of anywhere you point this library.

Logo courtesy of [flaticon](https://www.flaticon.com).
