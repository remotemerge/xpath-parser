import Hali from '../../dist/es';
import productsHtml from '../products.html';

const myHali = new Hali(productsHtml);
const str = myHali.query('//span[contains(@class, "zg-item")]/a/div', {
  queryFirst: true,
});

// expect an object
test('must return string with title', () => {
  expect(typeof str).toBe('string');
});

// expect title
test('match the title', () => {
  expect(str).toBe('Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy…');
});
