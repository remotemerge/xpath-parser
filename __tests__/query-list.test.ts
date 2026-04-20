import { expect, test } from 'bun:test';

import Parser from '../src/index';
import htmlContent from './data/products.html';

const parser = new Parser(htmlContent);
const results = parser.queryList('//span[contains(@class, "zg-item")]/a/div');

test('must return object', () => {
  expect(typeof results).toBe('object');
});

test('must have 50 titles', () => {
  expect(results.length).toBe(50);
});

test('match the first title', () => {
  expect(results[0]).toBe(
    'Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…',
  );
});
