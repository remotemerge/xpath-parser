import { expect, test } from 'bun:test';

import Parser from '../src/index';
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
  expect(typeof products).toBe('object');
});

test('must have resuts array and pagination url', () => {
  expect(Array.isArray(products.results)).toBe(true);
  expect(typeof products.paginationUrl).toBe('string');
});

test('pagination url is string', () => {
  if (products.paginationUrl) {
    expect(typeof products.paginationUrl).toBe('string');
  }
});

test('must have results array', () => {
  expect(Array.isArray(products.results)).toBe(true);
});

test('each product must be an object', () => {
  expect(typeof products.results[0]).toBe('object');
});

const firstProduct = products.results[0];

test('match the product title', () => {
  expect(firstProduct.title).toBe(
    'Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy Aluminum Metal Phone Holder,Compatible with Mobile Phone/iPad/Kindle/Tablet,4-10inch',
  );
});

test('product price contains dollar sign', () => {
  expect(firstProduct.price.includes('$')).toBe(true);
});

test('product image url starts with https', () => {
  expect(firstProduct.image.startsWith('https://')).toBe(true);
});
