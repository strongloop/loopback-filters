// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-filters
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var debug = require('debug')('loopback:filter');
var geo = require('./lib/geo');

module.exports = function filterNodes(nodes, filter) {
  if (filter) {
    debug('filter %j', filter);
    // do we need some sorting?
    if (filter.order) {
      nodes = nodes.sort(sorting.bind(normalizeOrder(filter)));
    }

    var nearFilter = geo.nearFilter(filter.where);

    // geo sorting
    if (nearFilter) {
      nodes = geo.filter(nodes, nearFilter);
    }

    // do we need some filtration?
    if (filter.where) {
      nodes = nodes ? nodes.filter(applyFilter(filter)) : nodes;
    }

    // field selection
    if (filter.fields) {
      nodes = nodes.map(selectFields(filter.fields));
    }

    // limit/skip
    var skip = filter.skip || filter.offset || 0;
    var limit = filter.limit || nodes.length;
    nodes = nodes.slice(skip, skip + limit);
  }

  return nodes;
};

function applyFilter(filter) {
  var where = filter.where;
  if (typeof where === 'function') {
    return where;
  }
  return function(obj) {
    return matchesFilter(obj, filter);
  };
}

function matchesFilter(obj, filter) {
  var where = filter.where;
  var pass = true;
  var keys = Object.keys(where);
  keys.forEach(function(key) {
    if (key === 'and' || key === 'or') {
      if (Array.isArray(where[key])) {
        if (key === 'and') {
          pass = where[key].every(function(cond) {
            return applyFilter({where: cond})(obj);
          });
          return pass;
        }
        if (key === 'or') {
          pass = where[key].some(function(cond) {
            return applyFilter({where: cond})(obj);
          });
          return pass;
        }
      }
    }
    if (!test(where[key], getValue(obj, key))) {
      pass = false;
    }
  });
  return pass;
}

function toRegExp(pattern) {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  var regex = '';
  // Escaping user input to be treated as a literal string within a regex
  // https://developer.mozilla.org
  // /en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  // #Writing_a_Regular_Expression_Pattern
  pattern = pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  for (var i = 0, n = pattern.length; i < n; i++) {
    var char = pattern.charAt(i);
    if (char === '\\') {
      i++; // Skip to next char
      if (i < n) {
        regex += pattern.charAt(i);
      }
      continue;
    } else if (char === '%') {
      regex += '.*';
    } else if (char === '_') {
      regex += '.';
    } else if (char === '.') {
      regex += '\\.';
    } else if (char === '*') {
      regex += '\\*';
    } else {
      regex += char;
    }
  }
  return regex;
}

function test(example, value) {
  if (typeof value === 'string' && (example instanceof RegExp)) {
    return value.match(example);
  }

  if (example === undefined) {
    return undefined;
  }

  if (typeof example === 'object' && example !== null) {
    // ignore geo near filter
    if (example.near) {
      return true;
    }

    if (example.inq) {
      if (Array.isArray(value)) {
        return example.inq.every(function(v) {
          return value.indexOf(v) !== -1;
        });
      }

      for (var i = 0; i < example.inq.length; i++) {
        if (example.inq[i] == value) {
          return true;
        }
      }
      return false;
    }

    if (example.nin) {
      if (!Array.isArray(example.nin))
        throw TypeError('Invalid nin query, you must pass an array to nin query.');
      if (example.nin.length === 0) return true; // not in [] should be always true;

      if (Array.isArray(value)) {
        return example.nin.some(function(v) {
          return value.indexOf(v) === -1;
        });
      }

      for (var j = 0; j < example.nin.length; j++) {
        if (example.nin[j] == value) {
          return false;
        }
      }
      return true;
    }

    if ('neq' in example) {
      return compare(example.neq, value) !== 0;
    }

    if ('between' in example) {
      return (testInEquality({gte: example.between[0]}, value) &&
        testInEquality({lte: example.between[1]}, value));
    }

    if (example.regexp) {
      var regexp;
      if (example.regexp instanceof RegExp) {
        regexp = example.regexp;
      } else if (typeof example.regexp === 'string') {
        regexp = toRegExp(example.regexp);
      } else {
        throw new TypeError('Invalid regular expression passed to regexp query.');
      }
      return regexp.test(value);
    }

    if (example.like || example.nlike) {
      var like = example.like || example.nlike;
      if (typeof like === 'string') {
        like = toRegExp(like);
      }
      if (example.like) {
        return new RegExp(like, example.options).test(value);
      }

      if (example.nlike) {
        return !new RegExp(like, example.options).test(value);
      }
    }

    if (testInEquality(example, value)) {
      return true;
    }
  }
  // not strict equality
  return (example !== null ? example.toString() : example) == (value != null ?
    value.toString() : value);
}

/**
 * Compare two values
 * @param {*} val1 The 1st value
 * @param {*} val2 The 2nd value
 * @returns {number} 0: =, positive: >, negative <
 * @private
 */
function compare(val1, val2) {
  if (val1 == null || val2 == null) {
    // Either val1 or val2 is null or undefined
    return val1 == val2 ? 0 : NaN;
  }
  if (typeof val1 === 'number') {
    return val1 - val2;
  }
  if (typeof val1 === 'string') {
    return (val1 > val2) ? 1 : ((val1 < val2) ? -1 : (val1 == val2) ? 0 : NaN);
  }
  if (typeof val1 === 'boolean') {
    return val1 - val2;
  }
  if (val1 instanceof Date) {
    var result = val1 - val2;
    return result;
  }
  // Return NaN if we don't know how to compare
  return (val1 == val2) ? 0 : NaN;
}

function testInEquality(example, val) {
  if ('gt' in example) {
    return compare(val, example.gt) > 0;
  }
  if ('gte' in example) {
    return compare(val, example.gte) >= 0;
  }
  if ('lt' in example) {
    return compare(val, example.lt) < 0;
  }
  if ('lte' in example) {
    return compare(val, example.lte) <= 0;
  }
  return false;
}

function getValue(obj, path) {
  if (obj == null) {
    return undefined;
  }
  var keys = path.split('.');
  var val = obj;
  for (var i = 0, n = keys.length; i < n; i++) {
    val = val[keys[i]];
    if (val == null) {
      return val;
    }
  }
  return val;
}

function selectFields(fields) {
  // map function
  return function(obj) {
    var result = {};
    var key;

    for (var i = 0; i < fields.length; i++) {
      key = fields[i];

      result[key] = obj[key];
    }
    return result;
  };
}

function sorting(a, b) {
  var undefinedA, undefinedB;

  for (var i = 0, l = this.length; i < l; i++) {
    var aVal = getValue(a, this[i].key);
    var bVal = getValue(b, this[i].key);
    undefinedB = bVal === undefined && aVal !== undefined;
    undefinedA = aVal === undefined && bVal !== undefined;

    if (undefinedB || aVal > bVal) {
      return 1 * this[i].reverse;
    } else if (undefinedA || aVal < bVal) {
      return -1 * this[i].reverse;
    }
  }

  return 0;
}

function normalizeOrder(filter) {
  var orders = filter.order;

  // transform into an array
  if (typeof orders === 'string') {
    if (filter.order.indexOf(',') > -1) {
      orders = filter.order.split(/,\s*/);
    } else {
      orders = [filter.order];
    }
  }

  orders.forEach(function(key, i) {
    var reverse = 1;
    var m = key.match(/\s+(A|DE)SC$/i);
    if (m) {
      key = key.replace(/\s+(A|DE)SC/i, '');
      if (m[1].toLowerCase() === 'de') reverse = -1;
    } else {
      var Ctor = SyntaxError || Error;
      throw new Ctor('filter.order must include ASC or DESC');
    }
    orders[i] = {'key': key, 'reverse': reverse};
  });

  return (filter.orders = orders);
}
