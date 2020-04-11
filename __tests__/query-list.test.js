import Hali from '../dist/es';
import productsHtml from './data/products.html';

const myHali = new Hali(productsHtml);
const results = myHali.queryList('//span[contains(@class, "zg-item")]/a/div');

// expect an object
test('must return object with titles', () => {
  expect(typeof results).toBe('object');
});

// count the titles
test('must have 50 titles', () => {
  expect(results.length).toBe(50);
});

// expect title
test('match the fist title', () => {
  expect(results[0]).toBe('Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…');
});
