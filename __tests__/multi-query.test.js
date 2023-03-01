import { test } from 'vitest';
import assert from 'assert';

import XpathParser from '../dist/xpath-parser.js';
import htmlContent from './data/product.html';

const parser = new XpathParser(htmlContent);
const product = parser.multiQuery({
  title: '//div[@id="ppd"]//span[@id="productTitle"]',
  seller: '//div[@id="ppd"]//a[@id="bylineInfo"]',
  price: '//div[@id="ppd"]//span[@id="priceblock_dealprice"]',
  rating: '//div[@id="ppd"]//span[@id="acrCustomerReviewText"]',
});

test('must return an object', () => {
  assert.strictEqual(typeof product, 'object');
});

test('must have four elements', () => {
  assert.strictEqual(Object.keys(product).length, 4);
});

test('match the product title', () => {
  assert.strictEqual(
    product.title,
    'LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men',
  );
});

test('product price contains dollar sign', () => {
  assert(product.price.includes('$'));
});

test('product rating contains numbers', () => {
  assert(product.rating.match(/\d+/));
});
