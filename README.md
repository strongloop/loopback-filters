# loopback-filters

This module implements LoopBack style filtering **without any dependencies on
LoopBack**.

## Install

```sh
$ npm install loopback-filters
```

## Usage

Below is a basic example using the module

```js
var applyFilter = require('loopback-filters');
var data = [{foo: 'bar'}, {bat: 'baz'}, {foo: 'bar'}];
var filter = {where: {foo: 'bar'}};

var filtered = applyFilter(data, filter);

console.log(filtered);
```

The output would be:

```js
[{foo: 'bar'}, {foo: 'bar'}]
```

## Features

**[Where](http://docs.strongloop.com/display/public/LB/Where+filter)**

```js
// return items where
applyFilter({
  where: {
    // the price > 10 && price < 100
    and: [
      {
        price: {
          gt: 10
        }
      },
      {
        price: {
          lt: 100
        }
      },
    ],

    // match Mens Shoes and Womens Shoes and any other type of Shoe
    category: {like: '.* Shoes'},

    // the status is either in-stock or available
    status: {inq: ['in-stock', 'available']}
  }
})
```

Only include objects that match the specified where clause. See [full list of supported operators](http://docs.strongloop.com/display/public/LB/Where+filter#Wherefilter-Operators).

**[Geo Filter / Near](http://docs.strongloop.com/display/public/LB/Where+filter#Wherefilter-near)**

```js
applyFilter(data, {
  where: {
    location: {near: '153.536,-28'}
  },
  limit: 10
})
```

Sort objects by distance to a specified `GeoPoint`.

**[Order](http://docs.strongloop.com/display/public/LB/Order+filter)**

Sort objects by one or more properties.

**[Limit](http://docs.strongloop.com/display/public/LB/Limit+filter) / [Skip](http://docs.strongloop.com/display/public/LB/Skip+filter)**

Limit the results to a specified number. Skip a specified number of results.

**[Fields](http://docs.strongloop.com/display/public/LB/Fields+filter)**

Include or exclude a set of fields in the result.

**Note: [Inclusion](http://docs.strongloop.com/display/public/LB/Include+filter) from loopback is not supported!**

## Docs

[See the LoopBack docs](http://docs.strongloop.com/display/public/LB/Querying+data) for the filter syntax.