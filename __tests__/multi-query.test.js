import Hali from '../dist';
import productHtml from './data/product.html';

const myHali = new Hali(productHtml);
const product = myHali.multiQuery({
  title: '//div[@id="ppd"]//span[@id="productTitle"]',
  seller: '//div[@id="ppd"]//a[@id="bylineInfo"]',
  price: '//div[@id="ppd"]//span[@id="priceblock_dealprice"]',
  rating: '//div[@id="ppd"]//span[@id="acrCustomerReviewText"]',
});

test('must return an object', () => {
  expect(typeof product).toBe('object');
});

test('must have four elements', () => {
  expect(Object.keys(product).length).toBe(4);
});

test('match the product title', () => {
  expect(product.title).toBe(
    'LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men',
  );
});

test('product price contains dollar sign', () => {
  expect(product.price).toMatch('$');
});

test('product rating contains numbers', () => {
  expect(product.rating).toMatch(/\d+/);
});
