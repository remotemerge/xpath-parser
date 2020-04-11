import Hali from '../../dist/es';
import productsHtml from '../data/product.html';

const myHali = new Hali(productsHtml);
const str = myHali.query('//span[@id="productTitle"]/text()', {
  queryFirst: true,
});

// expect an string
test('must return string with title', () => {
  expect(typeof str).toBe('string');
});

// expect title
test('match the title', () => {
  expect(str).toBe('LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men');
});
