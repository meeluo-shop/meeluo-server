/*!
 * @name JavaScript/NodeJS Merge v1.2.1
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

/**
 * Merge one or more objects
 * @param bool? clone
 * @param mixed,... arguments
 * @return object
 */

export const Merge = function(...args: any[]) {
  return mergeFn(args[0] === true, false, args);
};

/**
 * Merge two or more objects recursively
 * @param bool? clone
 * @param mixed,... arguments
 * @return object
 */

Merge.recursive = function(clone) {
  return mergeFn(clone === true, true, arguments);
};

/**
 * Clone the input removing any reference
 * @param mixed input
 * @return mixed
 */

Merge.clone = function(input) {
  var output = input,
    type = typeOf(input),
    index,
    size;

  if (type === 'array') {
    output = [];
    size = input.length;

    for (index = 0; index < size; ++index)
      output[index] = Merge.clone(input[index]);
  } else if (type === 'object') {
    output = {};

    for (index in input) output[index] = Merge.clone(input[index]);
  }

  return output;
};

/**
 * Merge two objects recursively
 * @param mixed input
 * @param mixed extend
 * @return mixed
 */

function merge_recursive(base, extend) {
  if (typeOf(base) !== 'object') return extend;

  for (var key in extend) {
    if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {
      base[key] = merge_recursive(base[key], extend[key]);
    } else {
      base[key] = extend[key];
    }
  }

  return base;
}

/**
 * Merge two or more objects
 * @param bool clone
 * @param bool recursive
 * @param array argv
 * @return object
 */

function mergeFn(clone, recursive, argv) {
  var result = argv[0],
    size = argv.length;

  if (clone || typeOf(result) !== 'object') result = {};

  for (var index = 0; index < size; ++index) {
    var item = argv[index],
      type = typeOf(item);

    if (type !== 'object') continue;

    for (var key in item) {
      if (key === '__proto__') continue;

      var sitem = clone ? Merge.clone(item[key]) : item[key];

      if (recursive) {
        result[key] = merge_recursive(result[key], sitem);
      } else {
        result[key] = sitem;
      }
    }
  }

  return result;
}

/**
 * Get type of variable
 * @param mixed input
 * @return string
 *
 * @see http://jsperf.com/typeofvar
 */

function typeOf(input) {
  return {}.toString
    .call(input)
    .slice(8, -1)
    .toLowerCase();
}
