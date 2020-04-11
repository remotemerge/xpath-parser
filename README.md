# <img src="images/logo.png" width="28" height="28"> Hali
Hali is an open source, lightweight and modern JavaScript utility to evaluate XPath expressions built on top of TypeScript. This tool is built for web scraping and can be integrated with new or existing scraping projects.

## Install
```bash
# using NPM
npm i @remotemerge/hali
# using Yarn
yarn add @remotemerge/hali
```

## Usage
Hali source file is `index.ts`. 
* Use `index.ts` in TypeScript environment.
```typescript
import Hali from '@remotemerge/hali'
```

* Use `dist/es/index.js` in NodeJS or ES5/ES6..ESNext environment.
```javascript
import Hali from '@remotemerge/hali/dist/es'
// or bit older
const Hali = require('@remotemerge/hali/dist/es')
```

* Use `dist/browser/index.js` directly in a browser.
```html
<script type="text/javascript" src="/path/to/browser/index.js"></script>
```

* Use jsDelivr CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@remotemerge/hali@latest/dist/browser/index.min.js"></script>
```

## Examples
The Hali constructor `Hali(html|DOM)` supports both DOM and HTML string, initialize as required.
```javascript
const myHali = new Hali('<html>...</html>');
```

### Scrape First Match
This method evaluates the given expression and captures the first result. It is useful for scraping a single element value like `title`, `price`, etc from HTML pages.
```javascript
const result = myHali.queryFirst('//span[@id="productTitle"]');
console.log(result);
```
Sample output:
```text
LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate...
```

### Scrape All Matches
This method evaluates the given expression and captures all results. It is useful for scraping all URLs, all images, all CSS classes, etc from HTML pages.
```javascript
// scrape titles
const results = myHali.queryList('//span[contains(@class, "zg-item")]/a/div');
console.log(results);
```
Sample output:
```javascript
['Cell Phone Stand,Angle Height Adjusta…', 'Selfie Ring Light with Tripod…', 'HOVAMP MFi Certified Nylon…', '...']
```

### Scrape multiple elements
This method loop through the given expressions and captures the first match of each expression. It is useful for scraping full product information (`title`, `seller`, `price`, `rating`, etc.) from HTML pages. The keys are preserved and the values are returned to the same keys.
```javascript
const result = myHali.multiQuery({
  title: '//div[@id="ppd"]//span[@id="productTitle"]',
  seller: '//div[@id="ppd"]//a[@id="bylineInfo"]',
  price: '//div[@id="ppd"]//span[@id="priceblock_dealprice"]',
  rating: '//div[@id="ppd"]//span[@id="acrCustomerReviewText"]',
});
```
Sample output:
```javascript
{
    title: 'LETSCOM Fitness Tracker HR, Activity Tracker Watch with Heart Rate Monitor...',
    seller: 'LETSCOM',
    price: '$20.39',
    rating: '1,489 ratings',
}
```

### Scrape with SubQueries
This method is useful for matching multiple products and extracting details from each product.
```javascript
const results = myHali.multiQuery({
    root: '//span[contains(@class, "zg-item")]',
    queries: {
        title: 'a/div/@title',
        url: 'a/@href',
        image: 'a/span/div/img/@src',
        price: './/span[contains(@class, "a-color-price")]',
    }
});
console.log(results);
```
Sample output:
```json
[
  {
    "title": "Selfie Ring Light with Tripod Stand...",
    "url": "/Selfie-Lighting-Steamgraphy-...&refRID=T3WKXPPREYBXB1KHH4Q3",
    "image": "https://images-na.ssl-images-...pOL._AC_UL200_SR200,200_.jpg",
    "price": "$45.99"
  },
  {
    "title": "UV Cell Phone Sanitizer, Portable UV Light Cell...",
    "url": "/Sanitizer-Sterilizer-Arom...&refRID=T3WKXPPREYBXB1KHH4Q3",
    "image": "https://images-na.ssl-images-...XZL._AC_UL200_SR200,200_.jpg",
    "price": "$44.99"
  },
  ...
]
```

## Contribution
Welcome the community for contribution. Please make a PR request for bug fixes, enhancements, new features, etc.

## Disclaimer
All the XPath expressions above are tested on Amazon [product listing] and related pages for educational purposes only. The icons are included from [flaticon] website.

[product listing]: https://www.amazon.com/gp/new-releases/wireless
[flaticon]: https://www.flaticon.com