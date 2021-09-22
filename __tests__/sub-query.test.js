import Hali from '../dist';
import productsHtml from './data/products.html';

const myHali = new Hali(productsHtml);
const products = myHali.subQuery({
  root: '//span[contains(@class, "zg-item")]',
  pagination: '//ul/li/a[contains(text(), "Next")]/@href',
  queries: {
    title: 'a/div/@title',
    url: 'a/@href',
    image: 'a/span/div/img/@src',
    price: './/span[contains(@class, "a-color-price")]',
  },
});

test('must return an object', () => {
  expect(typeof products).toBe('object');
});

test('must have one or two elements', () => {
  expect(Object.keys(products).length).toBeGreaterThanOrEqual(1);
  expect(Object.keys(products).length).toBeLessThanOrEqual(2);
});

test('pagination url is string', () => {
  if (products.paginationUrl) {
    expect(products).toMatchObject({
      paginationUrl: expect.any(String),
    });
  }
});

test('must have results array', () => {
  expect(products).toMatchObject({
    results: expect.any(Array),
  });
});

test('each product must be an object', () => {
  expect(typeof products.results[0]).toBe('object');
});

const firstProduct = products.results[0];

test('match the product title', () => {
  expect(firstProduct.title).toBe(
    'Cell Phone Stand,Angle Height Adjustable Stable LISEN Cell Phone Stand For Desk,Sturdy Aluminum Metal Phone Holder,Compatible with Mobile Phone/iPad/Kindle/Tablet,4-10inch',
  );
});

test('product price contains dollar sign', () => {
  expect(firstProduct.price).toMatch('$');
});

test('product image url starts with https', () => {
  expect(firstProduct.image).toMatch(/^https:\/\//);
});
