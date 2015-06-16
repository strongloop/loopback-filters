# loopback-filter

This module implements LoopBack style filtering.

## Install

```sh
$ npm install loopback-filter
```

## Usage

Below is a basic example using the module

```js
var data = [{foo: 'bar'}, {bat: 'baz'}, {foo: 'bar'}];
var filter = {where: {foo: 'bar'}};
var filtered = require('loopback-filter')(data, filter);
console.log(filtered);
```

The output would be:

```js
[{foo: 'bar'}, {foo: 'bar'}]
```

## Docs

[See the LoopBack docs](http://docs.strongloop.com/display/public/LB/Querying+data) for the filter syntax.