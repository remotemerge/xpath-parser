import Hali from '../dist';
import productsHtml from './data/products.html';

// init hali
const eHali = new Hali(productsHtml);

test('must have an object with target', () => {
  return eHali.waitXPath('//span[contains(@class, "a-color-price")]/span').then((response) => {
    expect(response.found).toBe(true);
  });
});

test('must have an object with error', () => {
  return eHali.waitXPath('//span[contains(@class, "class-not-exists")]/span', 3).catch((error) => {
    expect(error.message).toMatch('Timeout!');
  });
});
