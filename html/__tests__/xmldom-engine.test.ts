import { expect, test } from 'bun:test';

import NodeParser from '../src/node';
import htmlContent from './data/product.html';
import productsHtml from './data/products.html';

test('xmldom engine: queryFirst returns string title', () => {
  const parser = new NodeParser(htmlContent);
  const title = parser.queryFirst('//span[@id="productTitle"]');
  expect(typeof title).toBe('string');
  expect(title.length).toBeGreaterThan(0);
});

test('xmldom engine: queryList returns 50 items', () => {
  const parser = new NodeParser(productsHtml);
  const results = parser.queryList('//span[contains(@class, "zg-item")]/a/div');
  expect(results.length).toBe(50);
});

test('xmldom engine: subQuery produces results and pagination', () => {
  const parser = new NodeParser(productsHtml);
  const products = parser.subQuery({
    root: '//span[contains(@class, "zg-item")]',
    pagination: '//ul/li/a[contains(text(), "Next")]/@href',
    queries: {
      title: 'a/div/@title',
      url: 'a/@href',
      image: 'a/span/div/img/@src',
      price: './/span[contains(@class, "a-color-price")]',
    },
  });
  expect(Array.isArray(products.results)).toBe(true);
  expect(products.results.length).toBeGreaterThan(0);
  expect(products.results[0]!.image.startsWith('https://')).toBe(true);
  expect(products.results[0]!.price.includes('$')).toBe(true);
});

test('xmldom engine: multiQuery returns record', () => {
  const parser = new NodeParser(htmlContent);
  const result = parser.multiQuery({
    title: '//span[@id="productTitle"]',
  });
  expect(typeof result.title).toBe('string');
  expect(result.title.length).toBeGreaterThan(0);
});
