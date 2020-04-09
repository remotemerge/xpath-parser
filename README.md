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

## Contribution
Welcome the community for contribution. Please make a PR request for bug fixes, enhancements, new features, etc.

## Disclaimer
All the XPath expressions above are tested on Amazon [product listing] and related pages for educational purposes only.

[product listing]: https://www.amazon.com/gp/new-releases/wireless