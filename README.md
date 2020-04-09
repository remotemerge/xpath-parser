# Hali
Hali is an open source, lightweight and modern utility to evaluate XPath expressions built on top of TypeScript.

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
This method scrape the page and return all results found.
```javascript
const results = myHali.singleQuery('//span[contains(@class, "zg-item")]/a/div');
console.log(results);
```
Sample Response:
```text
["Selfie Ring Light with Tripod Stand and Phone Holder LED Circle Lights Halo Lighting for Make…", "UV Cell Phone Sanitizer, Portable UV Light Cell Phone Sterilizer, Aromatherapy Function…",...]
```

### Scrape First Match
This method scrape the page and result first result found.
```javascript
const result = myHali.singleQuery('//span[contains(@class, "zg-item")]/a/div', {queryFirst: true});
console.log(result);
```
Sample Response:
```text
Selfie Ring Light with Tripod Stand and Phone Holder LED Circle Lights Halo Lighting for Make…
```

## Contribution
Welcome the community for contribution. Please make a PR request for bug fixes, enhancements, new features, etc.

## Disclaimer
All the XPath expressions above are tested on Amazon [product listing] and related pages for educational purposes only.

[product listing]: https://www.amazon.com/gp/new-releases/wireless