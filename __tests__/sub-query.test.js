import { test } from 'vitest';
import assert from 'assert';

import Parser from '../dist/index.es.js';
import htmlContent from './data/products.html';

const parser = new Parser(htmlContent);
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

test('must return an object', () => {
  assert.strictEqual(typeof products, 'object');
});

test('must have resuts array and pagination url', () => {
  assert(Array.isArray(products.results));
  assert.strictEqual(typeof products.paginationUrl, 'string');
});

test('pagination url is string', () => {
  if (products.paginationUrl) {
    assert.strictEqual(typeof products.paginationUrl, 'string');
  }
});

test('must have results array', () => {
  assert(Array.isArray(products.results));
});

test('each product must be an object', () => {
  assert.strictEqual(typeof products.results[0], 'object');
});

const firstProduct = products.results[0];

test('match the product title', () => {
  assert.strictEqual(
    firstProduct.title,
    'Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy Aluminum Metal Phone Holder,Compatible with Mobile Phone/iPad/Kindle/Tablet,4-10inch',
  );
});

test('product price contains dollar sign', () => {
  assert(firstProduct.price.includes('$'));
});

test('product image url starts with https', () => {
  assert(firstProduct.image.startsWith('https://'));
});
