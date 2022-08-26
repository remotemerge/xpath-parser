import XpathParser from '../dist/xpath-parser.js';
import htmlContent from './data/products.html';

const parser = new XpathParser(htmlContent);

test('must have an object with target', () => {
  return parser.waitXPath('//span[contains(@class, "a-color-price")]/span').then((response) => {
    expect(response.found).toBe(true);
  });
});

test('must have an object with error', () => {
  return parser.waitXPath('//span[contains(@class, "class-not-exists")]/span', 3).catch((error) => {
    expect(error.message).toMatch('Timeout!');
  });
});
