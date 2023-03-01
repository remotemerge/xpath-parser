import { test } from 'vitest';
import assert from 'assert';

import XpathParser from '../dist/xpath-parser.js';
import htmlContent from './data/products.html';

const parser = new XpathParser(htmlContent);
const results = parser.queryList('//span[contains(@class, "zg-item")]/a/div');

test('must return object', () => {
  assert.strictEqual(typeof results, 'object');
});

test('must have 50 titles', () => {
  assert.strictEqual(results.length, 50);
});

test('match the first title', () => {
  assert.strictEqual(
    results[0],
    'Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…',
  );
});
