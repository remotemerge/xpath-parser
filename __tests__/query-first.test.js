import { test } from 'vitest';
import assert from 'assert';

import Parser from '../dist/index.es.js';
import htmlContent from './data/product.html';

const parser = new Parser(htmlContent);
const str = parser.queryFirst('//span[@id="productTitle"]');

test('title must be string', () => {
  assert.strictEqual(typeof str, 'string');
});

test('match the title', () => {
  assert.strictEqual(
    str,
    'LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men',
  );
});
