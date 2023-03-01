import { test } from 'vitest';
import assert from 'assert';
import XpathParser from '../dist/xpath-parser.js';
import htmlContent from './data/products.html';

const parser = new XpathParser(htmlContent);

test('must have an object with target', async () => {
  const response = await parser.waitXPath('//span[contains(@class, "a-color-price")]/span');
  assert.strictEqual(response.found, true);
});

test('must have an object with error', async () => {
  try {
    await parser.waitXPath('//span[contains(@class, "class-not-exists")]/span', 3);
  } catch (error) {
    assert(error.message.includes('Timeout!'));
  }
});
