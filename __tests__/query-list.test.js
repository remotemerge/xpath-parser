import XpathParser from '../dist/xpath-parser.js';
import htmlContent from './data/products.html';

const parser = new XpathParser(htmlContent);
const results = parser.queryList('//span[contains(@class, "zg-item")]/a/div');

test('must return object', () => {
  expect(typeof results).toBe('object');
});

test('must have 50 titles', () => {
  expect(results.length).toBe(50);
});

test('match the fist title', () => {
  expect(results[0]).toBe('Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…');
});
