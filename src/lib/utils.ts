"use strict";
import DTYPES from "./dtypes";
const _ = require("lodash");

function isNumber(value) {
  return typeof value === "number";
}
function isString(value) {
  return typeof value === "string";
}
function isFunction(value) {
  return typeof value === "function";
}

function baseFlatten(array, isDeep, result?: number[]) {
  result = result || [];
  let index = -1;
  const length = array.length;

  while (++index < length) {
    let value = array[index];
    if (isNumber(value)) {
      result[result.length] = value;
    } else if (isDeep) {
      // Recursively flatten arrays (susceptible to call stack limits).
      baseFlatten(value, isDeep, result);
    } else {
      result.push(value);
    }
  }

  return result;
}

function shapeSize(shape) {
  let s = 1;
  for (let i = 0; i < shape.length; i++) {
    s *= shape[i];
  }
  return s;
}

function getType(dtype) {
  return isFunction(dtype) ? dtype : DTYPES[dtype] || Array;
}

function _dim(x) {
  const ret = [];
  while (typeof x === "object") {
    ret.push(x.length);
    x = x[0];
  }
  return ret;
}

function getShape(array) {
  let y, z;
  if (typeof array === "object") {
    y = array[0];
    if (typeof y === "object") {
      z = y[0];
      if (typeof z === "object") {
        return _dim(array);
      }
      return [array.length, y.length];
    }
    return [array.length];
  }
  return [];
}

// function haveSameShape (shape1, shape2) {
//   if (shapeSize(shape1) !== shapeSize(shape2) || shape1.length !== shape2.length) {
//     return false;
//   }
//   let d = shape1.length;
//   for (let i = 0; i < d; i++) {
//     if (shape1[i] !== shape2[i]) {
//       return false;
//     }
//   }
//   return true;
// }

export default {
  isNumber: isNumber,
  isString: isString,
  isFunction: isFunction,
  flatten: baseFlatten,
  shapeSize: shapeSize,
  getType: getType,
  getShape: getShape,
  defaults: _.defaults,
};
