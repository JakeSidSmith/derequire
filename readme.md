derequire [![Build Status](https://travis-ci.org/calvinmetcalf/derequire.svg)](https://travis-ci.org/calvinmetcalf/derequire)
====

```bash
npm install derequire
```

`derequire` can be used either as a JavaScript API or as a CLI.

### JavaScript API

```javascript
var derequire = require('derequire');
var transformedCode = derequire(code, /*tokenTo=*/'_dereq_', /*tokenFrom=*/'require');
```

`derequire` takes a string of code and replaces all instances of the `tokenFrom` identifier (defaults to 'require') and replaces them with the `tokenTo` identifier (defaults to '\_dereq\_') but only if they are functional arguments or variable declarations and subsequent uses of said argument, then returnes the code.

For multiple renames at the same time, the following syntax is accepted:

```js
derequire(code, [
  {
    from: 'require',
    to: '_dereq_'
  },
  {
    from: 'define',
    to: '_defi_'
  }
]);
```

__Note:__ In order to avoid quite a few headaches the token you're changing from and the token you're changing to need to be the same length.

### Command-line API

```bash
derequire < input.js > output.js
```

Or:

```bash
derequire --from require --to _dereq_
```
