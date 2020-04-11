import Hali from '../../dist/es';
import productsHtml from '../products.html';

const myHali = new Hali(productsHtml);
const result = myHali.query('//span[contains(@class, "zg-item")]/a/div');

// expect an object
test('must return object of with titles', () => {
  expect(typeof result).toBe('object');
});

// count the matches
test('must have 50 titles', () => {
  expect(result.length).toBe(50);
})

// expect title
test('match the fist title', () => {
  expect(result[0]).toBe('Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…');
})
