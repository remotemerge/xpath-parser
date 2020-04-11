import Hali from '../dist/es';
import productHtml from './data/product.html';

const myHali = new Hali(productHtml);
const result = myHali.multiQuery({
  title: '//div[@id="ppd"]//span[@id="productTitle"]',
  seller: '//div[@id="ppd"]//a[@id="bylineInfo"]',
  price: '//div[@id="ppd"]//span[@id="priceblock_dealprice"]',
  rating: '//div[@id="ppd"]//span[@id="acrCustomerReviewText"]',
});

test('must return an object', () => {
  expect(typeof result).toBe('object');
});

test('must have four elements', () => {
  expect(Object.keys(result).length).toBe(4);
});

test('match the title', () => {
  expect(result.title).toBe('LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor, Waterproof Smart Fitness Band with Step Counter, Calorie Counter, Pedometer Watch for Kids Women and Men');
});

test('price contains dollar sign', () => {
  expect(result.price).toMatch('$');
});

test('rating contains numbers', () => {
  expect(result.rating).toMatch(/\d+/);
});
