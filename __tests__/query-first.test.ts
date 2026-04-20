import { expect, test } from 'bun:test';

import Parser from '../src/index';
import htmlContent from './data/product.html';

const parser = new Parser(htmlContent);
const str = parser.queryFirst('//span[@id="productTitle"]');

test('title must be string', () => {
  expect(typeof str).toBe('string');
});

test('match the title', () => {
  expect(str).toBe(
    'LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men',
  );
});
