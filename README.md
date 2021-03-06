# loopback-filters

**⚠️ LoopBack 3 has reached end of life. We are no longer accepting pull requests or providing 
support for community users. The only exception is fixes for critical bugs and security 
vulnerabilities provided as part of support for IBM API Connect customers. (See
[Module Long Term Support Policy](#module-long-term-support-policy) below.)**

We urge all LoopBack 3 users to migrate their applications to LoopBack 4 as
soon as possible. Refer to our
[Migration Guide](https://loopback.io/doc/en/lb4/migration-overview.html)
for more information on how to upgrade.

## Overview

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

## Module Long Term Support Policy

This module adopts the [
Module Long Term Support (LTS)](http://github.com/CloudNativeJS/ModuleLTS) policy,
 with the following End Of Life (EOL) dates:

| Version | Status          | Published | EOL      |
| ------- | --------------- | --------- | -------- |
| 1.x     | End-of-Life     | Dec 2017  | Dec 2020 |

Learn more about our LTS plan in [docs](https://loopback.io/doc/en/contrib/Long-term-support.html).
