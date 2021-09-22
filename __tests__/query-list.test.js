import Hali from '../dist';
import productsHtml from './data/products.html';

const myHali = new Hali(productsHtml);
const results = myHali.queryList('//span[contains(@class, "zg-item")]/a/div');

test('must return object', () => {
  expect(typeof results).toBe('object');
});

test('must have 50 titles', () => {
  expect(results.length).toBe(50);
});

test('match the fist title', () => {
  expect(results[0]).toBe('Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…');
});
