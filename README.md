# Hali
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

### Scrape All Matches
This method is used for capturing all the matching results in an array.
```javascript
const results = myHali.singleQuery('//span[contains(@class, "zg-item")]/a/div');
```
Sample Response:
```json
["Selfie Ring Light with Tripod Stand...","UV Cell Phone Sanitizer, Portable UV Light Cell...",...]
```

### Scrape First Match
This method is used for capturing the first result.
```javascript
const result = myHali.singleQuery('//span[contains(@class, "zg-item")]/a/div', {queryFirst: true});
```
Sample Response:
```json
"Selfie Ring Light with Tripod Stand..."
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
```
Sample Response:
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
All the XPath expressions above are tested on Amazon [product listing] and related pages for educational purposes only.

[product listing]: https://www.amazon.com/gp/new-releases/wireless