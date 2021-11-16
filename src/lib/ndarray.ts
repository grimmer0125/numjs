"use strict";

import cwise from "cwise";
import ops from "ndarray-ops";
import ndFFT from "ndarray-fft";

import gemm from "ndarray-gemm";
import ndPool from "typedarray-pool";

import ndarray from "ndarray";
import CONF from "./config";
import * as errors from "./errors";
import _ from "./utils";

import util from "util";

export interface ArbitraryDimArray<T> extends Array<T | ArbitraryDimArray<T>> {}

export type ArbDimNumArray = ArbitraryDimArray<number>;
export type ArrayLikeConstructor =
  | ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor
  | Uint8ClampedArrayConstructor;

/**
 * Multidimensional, homogeneous array of fixed-size items
 *
 * The number of dimensions and items in an array is defined by its shape, which is a tuple of N positive
 * integers that specify the sizes of each dimension. The type of items in the array is specified by a separate
 * data-type object (dtype), one of which is associated with each NdArray.
 */
export class NdArray {
  selection: ndarray.NdArray;

  constructor(data: ndarray.NdArray);
  constructor(
    data: ArbDimNumArray | ndarray.TypedArray,
    shape?: number[],
    stride?: number[],
    offset?: number
  );
  constructor(...args: any[]) {
    if (args.length === 1) {
      this.selection = args[0];
    } else if (args.length === 0) {
      throw new errors.ValueError("Required argument 'data' not found");
    } else {
      this.selection = ndarray.apply(null, args);
    }
  }

  /**
   * @property NdArray#size - Number of elements in the array.
   */
  get size(): number {
    return this.selection.size;
  }

  /**
   * The shape of the array
   *
   * @name NdArray#shape
   * @readonly
   */
  get shape(): number[] {
    return this.selection.shape;
  }

  /**
   * Number of array dimensions.
   *
   * @name NdArray#ndim
   * @readonly
   */
  get ndim(): number {
    return this.selection.shape.length;
  }

  /**
   * Data-type of the array’s elements.
   */
  get dtype() {
    return this.selection.dtype;
  }
  set dtype(dtype) {
    const T = _.getType(dtype);
    if (T !== _.getType(this.dtype)) {
      this.selection = ndarray(
        new T(this.selection.data),
        this.selection.shape,
        this.selection.stride,
        this.selection.offset
      );
    }
  }

  /**
   * Permute the dimensions of the array.
   *
   * @name NdArray#T
   * @readonly
   */
  get T(): NdArray {
    return this.transpose();
  }

  get(...args: number[]): number {
    const n = args.length;
    for (let i = 0; i < n; i++) {
      if (args[i] < 0) {
        args[i] += this.shape[i];
      }
    }
    return this.selection.get.apply(this.selection, args);
  }

  set(...args: number[]): number {
    return this.selection.set.apply(this.selection, args);
  }

  slice(...args: Array<number | number[]>): NdArray {
    const d = this.ndim;
    const hi = new Array(d);
    const lo = new Array(d);
    const step = new Array(d);
    const tShape = this.shape;

    for (let i = 0; i < d; i++) {
      let arg = args[i];
      if (typeof arg === "undefined") {
        break;
      }
      if (arg === null) {
        continue;
      }
      if (_.isNumber(arg)) {
        lo[i] = arg < 0 ? (arg as number) + tShape[i] : arg;
        hi[i] = null;
        step[i] = 1;
      } else if (
        (arg as number[]).length === 4 &&
        arg[1] === null &&
        arg[2] === null
      ) {
        // pattern: a[start::step]
        const s = arg[0] < 0 ? arg[0] + tShape[i] : arg[0];
        lo[i] = s;
        hi[i] = null;
        step[i] = arg[3] || 1;
      } else {
        // pattern start:end:step
        const start = arg[0] < 0 ? arg[0] + tShape[i] : arg[0];
        const end = arg[1] < 0 ? arg[1] + tShape[i] : arg[1];
        lo[i] = end ? start : 0;
        hi[i] = end ? end - start : start;
        step[i] = arg[2] || 1;
      }
    }

    const slo = this.selection.lo.apply(this.selection, lo);
    const shi = slo.hi.apply(slo, hi);
    const sstep = shi.step.apply(shi, step);
    return new NdArray(sstep);
  }

  /**
   * Return a subarray by fixing a particular axis
   * @param axis a array whose element could be `null` or `number`
   *
   * @example
   * ```typescript
   * arr = nj.arange(4*4).reshape(4,4)
   * // array([[  0,  1,  2,  3],
   * //        [  4,  5,  6,  7],
   * //        [  8,  9, 10, 11],
   * //        [ 12, 13, 14, 15]])
   *
   * arr.pick(1)
   * // array([ 4, 5, 6, 7])
   *
   * arr.pick(null, 1)
   * // array([  1,  5,  9, 13])
   * ```
   **/
  pick(...axis: number[]): NdArray {
    return new NdArray(this.selection.pick.apply(this.selection, arguments));
  }

  /**
   * Return a shifted view of the array. Think of it as taking the upper left corner of the image and dragging it inward
   *
   * @example
   * ```typescript
   * arr = nj.arange(4*4).reshape(4,4)
   * // array([[  0,  1,  2,  3],
   * //        [  4,  5,  6,  7],
   * //        [  8,  9, 10, 11],
   * //        [ 12, 13, 14, 15]])
   * arr.lo(1,1)
   * // array([[  5,  6,  7],
   * //        [  9, 10, 11],
   * //        [ 13, 14, 15]])
   * ```
   **/
  lo(...args: number[]): NdArray {
    return new NdArray(this.selection.lo.apply(this.selection, args));
  }

  /**
   * Return a sliced view of the array.
   *
   * @example
   * ```typescript
   * arr = nj.arange(4*4).reshape(4,4)
   * // array([[  0,  1,  2,  3],
   * //        [  4,  5,  6,  7],
   * //        [  8,  9, 10, 11],
   * //        [ 12, 13, 14, 15]])
   *
   * arr.hi(3,3)
   * // array([[  0,  1,  2],
   * //        [  4,  5,  6],
   * //        [  8,  9, 10]])
   *
   * arr.lo(1,1).hi(2,2)
   * // array([[ 5,  6],
   * //        [ 9, 10]])
   * ```
   */
  hi(...args: number[]): NdArray {
    return new NdArray(this.selection.hi.apply(this.selection, args));
  }

  step(...args: number[]): NdArray {
    return new NdArray(this.selection.step.apply(this.selection, args));
  }

  /**
   * Return a copy of the array collapsed into one dimension using row-major order (C-style)
   */
  flatten(): NdArray {
    if (this.ndim === 1) {
      // already flattened
      return new NdArray(this.selection);
    }
    const T = _.getType(this.dtype);
    let arr = _.flatten(this.tolist(), true);
    if (!(arr instanceof T)) {
      arr = new T(arr);
    }
    return new NdArray(arr, [this.size]);
  }

  /**
   * Gives a new shape to the array without changing its data.
   * @param shape - The new shape should be compatible with the original shape. If an integer, then the result will be a 1-D array of that length. One shape dimension can be -1. In this case, the value is inferred from the length of the array and remaining dimensions.
   * @returns a new view object if possible, a copy otherwise,
   */
  reshape(...shape: number[]): NdArray;
  reshape(shape: number[]): NdArray;
  reshape(...args: any[]): NdArray {
    if (arguments.length === 0) {
      throw new errors.ValueError(
        "function takes at least one argument (0 given)"
      );
    }
    let shape: number[];
    if (
      arguments.length === 1 &&
      _.isNumber(arguments[0]) &&
      arguments[0] === -1
    ) {
      shape = [_.shapeSize(this.shape)];
    }
    if (arguments.length === 1) {
      if (_.isNumber(arguments[0])) {
        shape = [arguments[0] as number];
      } else {
        // grimmer refactor note: original logic does not check if it is an array
        shape = arguments[0];
      }
    }
    if (arguments.length > 1) {
      shape = [].slice.call(arguments);
    }
    if (
      (shape as number[]).filter(function (s) {
        return s === -1;
      }).length > 1
    ) {
      throw new errors.ValueError("can only specify one unknown dimension");
    }
    const currentShapeSize = _.shapeSize(shape);
    shape = shape.map(
      function (s) {
        return s === -1 ? (-1 * this.size) / currentShapeSize : s;
      }.bind(this)
    );
    if (this.size !== _.shapeSize(shape)) {
      throw new errors.ValueError("total size of new array must be unchanged");
    }
    const selfShape = this.selection.shape;
    const selfOffset = this.selection.offset;
    const selfStride = this.selection.stride;
    const selfDim = selfShape.length;
    const d = shape.length;
    let stride;
    let offset;
    let i;
    let sz;
    if (selfDim === d) {
      let sameShapes = true;
      for (i = 0; i < d; ++i) {
        if (selfShape[i] !== shape[i]) {
          sameShapes = false;
          break;
        }
      }
      if (sameShapes) {
        return new NdArray(
          this.selection.data,
          selfShape,
          selfStride,
          selfOffset
        );
      }
    } else if (selfDim === 1) {
      // 1d view
      stride = new Array(d);
      for (i = d - 1, sz = 1; i >= 0; --i) {
        stride[i] = sz;
        sz *= shape[i];
      }
      offset = selfOffset;
      for (i = 0; i < d; ++i) {
        if (stride[i] < 0) {
          offset -= (shape[i] - 1) * stride[i];
        }
      }
      return new NdArray(this.selection.data, shape, stride, offset);
    }

    const minDim = Math.min(selfDim, d);
    let areCompatible = true;
    for (i = 0; i < minDim; i++) {
      if (selfShape[i] !== shape[i]) {
        areCompatible = false;
        break;
      }
    }
    if (areCompatible) {
      stride = new Array(d);
      for (i = 0; i < d; i++) {
        stride[i] = selfStride[i] || 1;
      }
      offset = selfOffset;
      return new NdArray(this.selection.data, shape, stride, offset);
    }
    return this.flatten().reshape(shape);
  }

  /**
   * Permute the dimensions of the array.
   * @example
   * ```typescript
   * arr = nj.arange(6).reshape(1,2,3)
   * // array([[[ 0, 1, 2],
   * //         [ 3, 4, 5]]])
   *
   * arr.T
   * // array([[[ 0],
   * //         [ 3]],
   * //        [[ 1],
   * //         [ 4]],
   * //        [[ 2],
   * //         [ 5]]])
   *
   * arr.transpose(1,0,2)
   * // array([[[ 0, 1, 2]],
   * //        [[ 3, 4, 5]]])
   * ```
   */
  transpose(...axes: number[]): NdArray;
  transpose(axes?: number[]): NdArray;
  transpose(...args: any[]): NdArray {
    let axes: any;
    if (args.length === 0) {
      const d = this.ndim;
      axes = new Array(d);
      for (let i = 0; i < d; i++) {
        axes[i] = d - i - 1;
      }
    } else if (args.length > 1) {
      axes = args as unknown as number[];
    } else {
      axes = args[0];
    }
    return new NdArray(this.selection.transpose.apply(this.selection, axes));
  }

  /**
   * Dot product of two arrays.
   */
  dot(x: ArbDimNumArray | NdArray): NdArray {
    x = x instanceof NdArray ? x : createArray(x, this.dtype);
    const tShape = this.shape;
    const xShape = x.shape;

    if (tShape.length === 2 && xShape.length === 2 && tShape[1] === xShape[0]) {
      // matrix/matrix
      const T = _.getType(this.dtype);
      const c = new NdArray(new T(tShape[0] * xShape[1]), [
        tShape[0],
        xShape[1],
      ]);
      gemm(c.selection, this.selection, x.selection);
      return c;
    } else if (
      tShape.length === 1 &&
      xShape.length === 2 &&
      tShape[0] === xShape[0]
    ) {
      // vector/matrix
      return this.reshape([tShape[0], 1]).T.dot(x).reshape(xShape[1]);
    } else if (
      tShape.length === 2 &&
      xShape.length === 1 &&
      tShape[1] === xShape[0]
    ) {
      // matrix/vector
      return this.dot(x.reshape([xShape[0], 1])).reshape(tShape[0]);
    } else if (
      tShape.length === 1 &&
      xShape.length === 1 &&
      tShape[0] === xShape[0]
    ) {
      // vector/vector
      return this.reshape([tShape[0], 1])
        .T.dot(x.reshape([xShape[0], 1]))
        .reshape([1]);
    } else {
      throw new errors.ValueError(
        "cannot compute the matrix product of given arrays"
      );
    }
  }

  /**
   * Assign `x` to the array, element-wise.
   */
  assign(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;

    if (_.isNumber(x)) {
      ops.assigns(arr.selection, x);
      return arr;
    }
    x = createArray(x, this.dtype);
    ops.assign(arr.selection, x.selection);
    return arr;
  }

  /**
   * Add `x` to the array, element-wise.
   */
  add(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;

    if (_.isNumber(x)) {
      ops.addseq(arr.selection, x);
      return arr;
    }
    x = createArray(x, this.dtype);
    ops.addeq(arr.selection, x.selection);
    return arr;
  }

  /**
   * Subtract `x` to the array, element-wise.
   */
  subtract(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;

    if (_.isNumber(x)) {
      ops.subseq(arr.selection, x);
      return arr;
    }
    x = createArray(x, this.dtype);
    ops.subeq(arr.selection, x.selection);
    return arr;
  }

  /**
   * Multiply array by `x`, element-wise.
   */
  multiply(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    if (_.isNumber(x)) {
      ops.mulseq(arr.selection, x);
      return arr;
    }

    x = createArray(x, this.dtype);
    ops.muleq(arr.selection, x.selection);

    return arr;
  }

  /**
   * Divide array by `x`, element-wise.
   */
  divide(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    if (_.isNumber(x)) {
      ops.divseq(arr.selection, x);
      return arr;
    }

    x = createArray(x, this.dtype);
    ops.diveq(arr.selection, x.selection);

    return arr;
  }

  /**
   * Raise array elements to powers from given array, element-wise.
   *
   * @param x
   * @param copy - set to false to modify the array rather than create a new one
   */
  pow(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    if (_.isNumber(x)) {
      ops.powseq(arr.selection, x);
      return arr;
    }

    x = createArray(x, this.dtype);
    ops.poweq(arr.selection, x.selection);
    return arr;
  }

  /**
   * Calculate the exponential of all elements in the array, element-wise.
   *
   * @param copy - set to false to modify the array rather than create a new one
   */
  exp(copy = true): NdArray {
    if (arguments.length === 0) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    ops.expeq(arr.selection);
    return arr;
  }

  /**
   * Calculate the natural logarithm of all elements in the array, element-wise.
   *
   * @param copy - set to false to modify the array rather than create a new one
   */
  log(copy = true): NdArray {
    if (arguments.length === 0) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    ops.logeq(arr.selection);
    return arr;
  }

  /**
   * Calculate the positive square-root of all elements in the array, element-wise.
   *
   * @param copy set to false to modify the array rather than create a new one
   */
  sqrt(copy = true): NdArray {
    if (arguments.length === 0) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    ops.sqrteq(arr.selection);
    return arr;
  }

  /**
   * Return the maximum value of the array
   */
  max(): number {
    if (this.selection.size === 0) {
      return null;
    }
    return ops.sup(this.selection);
  }

  /**
   * Return the minimum value of the array
   */
  min(): number {
    if (this.selection.size === 0) {
      return null;
    }
    return ops.inf(this.selection);
  }

  /**
   * Sum of array elements.
   */
  sum(): number {
    return ops.sum(this.selection);
  }

  /**
   * Returns the standard deviation, a measure of the spread of a distribution, of the array elements.
   *
   * @param {object} options default {ddof:0}
   */
  std(options?: { ddof: number }) {
    if (!options?.ddof) {
      options = { ddof: 0 };
    }
    const squares = this.clone();
    ops.powseq(squares.selection, 2);
    const mean = this.mean();
    const shapeSize = _.shapeSize(this.shape);
    const letiance =
      ops.sum(squares.selection) / (shapeSize - options.ddof) -
      (mean * mean * shapeSize) / (shapeSize - options.ddof);

    return letiance > 0 ? Math.sqrt(Math.abs(letiance)) : 0;
  }

  /**
   * Return the arithmetic mean of array elements.
   */
  mean(): number {
    return ops.sum(this.selection) / _.shapeSize(this.shape);
  }

  /**
   * Return element-wise remainder of division.
   */
  mod(x: NdArray | ArbDimNumArray | number, copy = true): NdArray {
    if (arguments.length === 1) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    if (_.isNumber(x)) {
      ops.modseq(arr.selection, x);
      return arr;
    }

    x = createArray(x, this.dtype);
    ops.modeq(arr.selection, x.selection);

    return arr;
  }

  /**
   * Converts {NdArray} to a native JavaScript {Array}
   */
  tolist(): ArbDimNumArray {
    return unpackArray(this.selection);
  }

  valueOf(): ArbDimNumArray {
    return this.tolist();
  }

  /**
   * Stringify the array to make it readable in the console, by a human.
   */
  [util.inspect.custom]() {
    return this.toString();
  }

  /**
   * Stringify the array to make it readable by a human.
   */
  toString(): string {
    const nChars = formatNumber(this.max()).length;

    const reg1 = /\]\,(\s*)\[/g;
    const spacer1 = "],\n$1      [";
    const reg3 = /\]\,(\s+)...\,(\s+)\[/g;
    const spacer3 = "],\n$2       ...\n$2      [";
    const reg2 = /\[\s+\[/g;
    const spacer2 = "[[";

    function formatArray(k, v) {
      if (_.isString(v)) {
        return v;
      }
      if (_.isNumber(v)) {
        const s = formatNumber(v);
        return new Array(Math.max(0, nChars - s.length + 2)).join(" ") + s;
      }
      k = k || 0;
      let arr;
      const th = CONF.printThreshold;
      const hth = (th / 2) | 0;
      if (v.length > th) {
        arr = [].concat(v.slice(0, hth), [" ..."], v.slice(v.length - hth));
      } else {
        arr = v;
      }
      return (
        new Array(k + 1).join(" ") +
        "[" +
        arr
          .map(function (i, ii) {
            return formatArray(ii === 0 && k === 0 ? 1 : k + 1, i);
          })
          .join(",") +
        "]"
      );
    }

    let base = JSON.stringify(this.tolist(), formatArray)
      .replace(reg1, spacer1)
      .replace(reg2, spacer2)
      .replace(reg2, spacer2)
      .replace(reg3, spacer3)
      .slice(2, -1);
    switch (this.dtype) {
      case "array":
        return "array([" + base + ")";
      default:
        return "array([" + base + ", dtype=" + this.dtype + ")";
    }
  }

  /**
   * Stringify object to JSON
   */
  toJSON(): string {
    return JSON.stringify(this.tolist());
  }

  /**
   * Create a full copy of the array
   */
  clone(): NdArray {
    const s = this.selection;
    if (typeof s.data.slice === "undefined") {
      return new NdArray(
        ndarray([].slice.apply(s.data), s.shape, s.stride, s.offset)
      ); // for legacy browsers
    }
    return new NdArray(ndarray(s.data.slice(), s.shape, s.stride, s.offset));
  }

  /**
   * Return true if two arrays have the same shape and elements, false otherwise.
   */
  equal(array: ArbDimNumArray | NdArray): boolean {
    array = createArray(array);
    if (this.size !== array.size || this.ndim !== array.ndim) {
      return false;
    }
    const d = this.ndim;
    for (let i = 0; i < d; i++) {
      if (this.shape[i] !== array.shape[i]) {
        return false;
      }
    }

    return ops.equals(this.selection, array.selection);
  }

  /**
   * Round array to the to the nearest integer.
   */
  round(copy = true): NdArray {
    if (arguments.length === 0) {
      copy = true;
    }
    const arr = copy ? this.clone() : this;
    ops.roundeq(arr.selection);
    return arr;
  }

  /**
   * Return the inverse of the array, element-wise.
   */
  negative(): NdArray {
    const c = this.clone();
    ops.neg(c.selection, this.selection);
    return c;
  }

  diag(): NdArray {
    const d = this.ndim;
    if (d === 1) {
      // input is a vector => return a diagonal matrix
      const T = _.getType(this.dtype);
      const shape = [this.shape[0], this.shape[0]];
      const arr = new NdArray(new T(_.shapeSize(shape)), shape);
      if (arr.dtype === "array") {
        ops.assigns(arr.selection, 0);
      }
      for (let i = 0; i < this.shape[0]; i++) arr.set(i, i, this.get(i));
      return arr;
    }
    const mshape = this.shape;
    const mstride = this.selection.stride;
    let nshape = 1 << 30;
    let nstride = 0;
    for (let i = 0; i < d; ++i) {
      nshape = Math.min(nshape, mshape[i]) | 0;
      nstride += mstride[i];
    }
    return new NdArray(
      this.selection.data,
      [nshape],
      [nstride],
      this.selection.offset
    );
  }

  iteraxis(axis: number, cb: (xi: NdArray, i: number) => void) {
    const shape = this.shape;
    if (axis === -1) {
      axis = shape.length - 1;
    }
    if (axis < 0 || axis > shape.length - 1) {
      throw new errors.ValueError("invalid axis");
    }
    for (let i = 0; i < shape[axis]; i++) {
      const loc = new Array(axis + 1);
      for (let ii = 0; ii < axis + 1; ii++) {
        loc[ii] = ii === axis ? i : null;
      }
      const subArr = this.selection.pick.apply(this.selection, loc);
      const xi = createArray(unpackArray(subArr), this.dtype);
      cb(xi, i);
    }
  }

  /**
   * Returns the discrete, linear convolution of the array using the given filter.
   *
   * @note: Arrays must have the same dimensions and `filter` must be smaller than the array.
   * @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
   * @note: Use optimized code for 3x3, 3x3x1, 5x5, 5x5x1 filters, FFT otherwise.
   */
  convolve(filter: ArbDimNumArray | NdArray): NdArray {
    filter = NdArray.new(filter);
    const ndim = this.ndim;
    if (ndim !== filter.ndim) {
      throw new errors.ValueError("arrays must have the same dimensions");
    }
    const outShape = new Array(ndim);
    const step = new Array(ndim);
    const ts = this.selection;
    const tShape = this.shape;
    const fs = filter.selection;
    const fShape = filter.shape;

    for (let i = 0; i < ndim; i++) {
      const l = tShape[i] - fShape[i] + 1;
      if (l < 0) {
        throw new errors.ValueError("filter cannot be greater than the array");
      }
      outShape[i] = l;
      step[i] = -1;
    }

    if (ndim === 2 && fShape[0] === 3 && fShape[1] === 3) {
      const out3x3 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
      doConvolve3x3(
        out3x3.selection, // c
        ts, // x
        fs.get(0, 0), // fa
        fs.get(0, 1), // fb
        fs.get(0, 2), // fc
        fs.get(1, 0), // fd
        fs.get(1, 1), // fe
        fs.get(1, 2), // ff
        fs.get(2, 0), // fg
        fs.get(2, 1), // fh
        fs.get(2, 2) // fi
      );
      return out3x3.lo(1, 1).hi(outShape[0], outShape[1]);
    } else if (
      ndim === 3 &&
      fShape[2] === 1 &&
      tShape[2] === 1 &&
      fShape[0] === 3 &&
      fShape[1] === 3
    ) {
      const out3x3x1 = new NdArray(
        new Float32Array(_.shapeSize(tShape)),
        tShape
      );
      doConvolve3x3(
        out3x3x1.selection.pick(null, null, 0), // c
        ts.pick(null, null, 0), // x
        fs.get(0, 0, 0), // fa
        fs.get(0, 1, 0), // fb
        fs.get(0, 2, 0), // fc
        fs.get(1, 0, 0), // fd
        fs.get(1, 1, 0), // fe
        fs.get(1, 2, 0), // ff
        fs.get(2, 0, 0), // fg
        fs.get(2, 1, 0), // fh
        fs.get(2, 2, 0) // fi
      );
      return out3x3x1.lo(1, 1).hi(outShape[0], outShape[1]);
    } else if (ndim === 2 && fShape[0] === 5 && fShape[1] === 5) {
      const out5x5 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
      doConvolve5x5(
        out5x5.selection, // c
        ts, // x
        fs.get(0, 0), // fa
        fs.get(0, 1), // fb
        fs.get(0, 2), // fc
        fs.get(0, 3), // fd
        fs.get(0, 4), // fe
        fs.get(1, 0), // ff
        fs.get(1, 1), // fg
        fs.get(1, 2), // fh
        fs.get(1, 3), // fi
        fs.get(1, 4), // fj
        fs.get(2, 0), // fk
        fs.get(2, 1), // fl
        fs.get(2, 2), // fm
        fs.get(2, 3), // fn
        fs.get(2, 4), // fo
        fs.get(3, 0), // fp
        fs.get(3, 1), // fq
        fs.get(3, 2), // fr
        fs.get(3, 3), // fs
        fs.get(3, 4), // ft
        fs.get(4, 0), // fu
        fs.get(4, 1), // fv
        fs.get(4, 2), // fw
        fs.get(4, 3), // fx
        fs.get(4, 4) // fy
      );
      return out5x5.lo(2, 2).hi(outShape[0], outShape[1]);
    } else if (
      ndim === 3 &&
      fShape[2] === 1 &&
      tShape[2] === 1 &&
      fShape[0] === 5 &&
      fShape[1] === 5
    ) {
      const out5x5x1 = new NdArray(
        new Float32Array(_.shapeSize(tShape)),
        tShape
      );
      doConvolve5x5(
        out5x5x1.selection, // c
        ts, // x
        fs.get(0, 0, 0), // fa
        fs.get(0, 1, 0), // fb
        fs.get(0, 2, 0), // fc
        fs.get(0, 3, 0), // fd
        fs.get(0, 4, 0), // fe
        fs.get(1, 0, 0), // ff
        fs.get(1, 1, 0), // fg
        fs.get(1, 2, 0), // fh
        fs.get(1, 3, 0), // fi
        fs.get(1, 4, 0), // fj
        fs.get(2, 0, 0), // fk
        fs.get(2, 1, 0), // fl
        fs.get(2, 2, 0), // fm
        fs.get(2, 3, 0), // fn
        fs.get(2, 4, 0), // fo
        fs.get(3, 0, 0), // fp
        fs.get(3, 1, 0), // fq
        fs.get(3, 2, 0), // fr
        fs.get(3, 3, 0), // fs
        fs.get(3, 4, 0), // ft
        fs.get(4, 0, 0), // fu
        fs.get(4, 1, 0), // fv
        fs.get(4, 2, 0), // fw
        fs.get(4, 3, 0), // fx
        fs.get(4, 4, 0) // fy
      );
      return out5x5x1.lo(2, 2).hi(outShape[0], outShape[1]);
    } else {
      return this.fftconvolve(filter);
    }
  }

  fftconvolve(filter: ArbDimNumArray | NdArray): NdArray {
    filter = NdArray.new(filter);

    if (this.ndim !== filter.ndim) {
      throw new errors.ValueError("arrays must have the same dimensions");
    }

    const as = this.selection;
    const bs = filter.selection;
    const d = this.ndim;
    let nsize = 1;
    const nstride = new Array(d);
    const nshape = new Array(d);
    const oshape = new Array(d);
    let i;
    for (i = d - 1; i >= 0; --i) {
      nshape[i] = as.shape[i];
      nstride[i] = nsize;
      nsize *= nshape[i];
      oshape[i] = as.shape[i] - bs.shape[i] + 1;
    }

    const T = _.getType(as.dtype);
    const out = new NdArray(new T(_.shapeSize(oshape)), oshape);
    const outs = out.selection;

    const xT = ndPool.mallocDouble(nsize);
    const x = ndarray(xT, nshape, nstride, 0);
    ops.assigns(x, 0);
    ops.assign(x.hi.apply(x, as.shape), as);

    const yT = ndPool.mallocDouble(nsize);
    const y = ndarray(yT, nshape, nstride, 0);
    ops.assigns(y, 0);

    // FFT x/y
    ndFFT(1, x, y);

    const uT = ndPool.mallocDouble(nsize);
    const u = ndarray(uT, nshape, nstride, 0);
    ops.assigns(u, 0);
    ops.assign(u.hi.apply(u, bs.shape), bs);

    const vT = ndPool.mallocDouble(nsize);
    const v = ndarray(vT, nshape, nstride, 0);
    ops.assigns(v, 0);

    ndFFT(1, u, v);

    doConjMuleq(x, y, u, v);

    ndFFT(-1, x, y);

    const outShape = new Array(d);
    const outOffset = new Array(d);
    let needZeroFill = false;
    for (i = 0; i < d; ++i) {
      if (outs.shape[i] > nshape[i]) {
        needZeroFill = true;
      }
      outOffset[i] = bs.shape[i] - 1;
      outShape[i] = Math.min(outs.shape[i], nshape[i] - outOffset[i]);
    }

    let croppedX;
    if (needZeroFill) {
      ops.assign(outs, 0.0);
    }
    croppedX = x.lo.apply(x, outOffset);
    croppedX = croppedX.hi.apply(croppedX, outShape);
    ops.assign(outs.hi.apply(outs, outShape), croppedX);

    ndPool.freeDouble(xT);
    ndPool.freeDouble(yT);
    ndPool.freeDouble(uT);
    ndPool.freeDouble(vT);
    return out;
  }

  static new(
    arr: NdArray | ArbDimNumArray | number | ndarray.TypedArray,
    dtype?: string | ArrayLikeConstructor
  ): NdArray {
    return createArray(arr, dtype);
  }
}

/* istanbul ignore next */
const doConjMuleq = cwise({
  args: ["array", "array", "array", "array"],
  body: function (xi, yi, ui, vi) {
    const a = ui;
    const b = vi;
    const c = xi;
    const d = yi;
    const k1 = c * (a + b);
    xi = k1 - b * (c + d);
    yi = k1 + a * (d - c);
  },
});

/* istanbul ignore next */
const doConvolve3x3 = cwise({
  args: [
    "array", // c
    "array", // xe
    "scalar", // fa
    "scalar", // fb
    "scalar", // fc
    "scalar", // fd
    "scalar", // fe
    "scalar", // ff
    "scalar", // fg
    "scalar", // fh
    "scalar", // fi
    { offset: [-1, -1], array: 1 }, // xa
    { offset: [-1, 0], array: 1 }, // xb
    { offset: [-1, 1], array: 1 }, // xc
    { offset: [0, -1], array: 1 }, // xd
    // {offset:[ 9,  0], array:1}, // useless since available already
    { offset: [0, 1], array: 1 }, // xf
    { offset: [1, -1], array: 1 }, // xg
    { offset: [1, 0], array: 1 }, // xh
    { offset: [1, 1], array: 1 }, // xi
  ],
  body: function (
    c,
    xe,
    fa,
    fb,
    fc,
    fd,
    fe,
    ff,
    fg,
    fh,
    fi,
    xa,
    xb,
    xc,
    xd,
    xf,
    xg,
    xh,
    xi
  ) {
    c =
      xa * fi +
      xb * fh +
      xc * fg +
      xd * ff +
      xe * fe +
      xf * fd +
      xg * fc +
      xh * fb +
      xi * fa;
  },
});

/* istanbul ignore next */
const doConvolve5x5 = cwise({
  args: [
    "index",
    "array", // c
    "array", // xm
    "scalar", // fa
    "scalar", // fb
    "scalar", // fc
    "scalar", // fd
    "scalar", // fe
    "scalar", // ff
    "scalar", // fg
    "scalar", // fh
    "scalar", // fi
    "scalar", // fj
    "scalar", // fk
    "scalar", // fl
    "scalar", // fm
    "scalar", // fn
    "scalar", // fo
    "scalar", // fp
    "scalar", // fq
    "scalar", // fr
    "scalar", // fs
    "scalar", // ft
    "scalar", // fu
    "scalar", // fv
    "scalar", // fw
    "scalar", // fx
    "scalar", // fy
    { offset: [-2, -2], array: 1 }, // xa
    { offset: [-2, -1], array: 1 }, // xb
    { offset: [-2, 0], array: 1 }, // xc
    { offset: [-2, 1], array: 1 }, // xd
    { offset: [-2, 2], array: 1 }, // xe
    { offset: [-1, -2], array: 1 }, // xf
    { offset: [-1, -1], array: 1 }, // xg
    { offset: [-1, 0], array: 1 }, // xh
    { offset: [-1, 1], array: 1 }, // xi
    { offset: [-1, 2], array: 1 }, // xj
    { offset: [0, -2], array: 1 }, // xk
    { offset: [0, -1], array: 1 }, // xl
    // {offset:[ 0,  0], array:1},
    { offset: [0, 1], array: 1 }, // xn
    { offset: [0, 2], array: 1 }, // xo
    { offset: [1, -2], array: 1 }, // xp
    { offset: [1, -1], array: 1 }, // xq
    { offset: [1, 0], array: 1 }, // xr
    { offset: [1, 1], array: 1 }, // xs
    { offset: [1, 2], array: 1 }, // xt
    { offset: [2, -2], array: 1 }, // xu
    { offset: [2, -1], array: 1 }, // xv
    { offset: [2, 0], array: 1 }, // xw
    { offset: [2, 1], array: 1 }, // xx
    { offset: [2, 2], array: 1 }, // xy
  ],
  body: function (
    index,
    c,
    xm,
    fa,
    fb,
    fc,
    fd,
    fe,
    ff,
    fg,
    fh,
    fi,
    fj,
    fk,
    fl,
    fm,
    fn,
    fo,
    fp,
    fq,
    fr,
    fs,
    ft,
    fu,
    fv,
    fw,
    fx,
    fy,
    xa,
    xb,
    xc,
    xd,
    xe,
    xf,
    xg,
    xh,
    xi,
    xj,
    xk,
    xl,
    xn,
    xo,
    xp,
    xq,
    xr,
    xs,
    xt,
    xu,
    xv,
    xw,
    xx,
    xy
  ) {
    c =
      index[0] < 2 || index[1] < 2
        ? 0
        : xa * fy +
          xb * fx +
          xc * fw +
          xd * fv +
          xe * fu +
          xf * ft +
          xg * fs +
          xh * fr +
          xi * fq +
          xj * fp +
          xk * fo +
          xl * fn +
          xm * fm +
          xn * fl +
          xo * fk +
          xp * fj +
          xq * fi +
          xr * fh +
          xs * fg +
          xt * ff +
          xu * fe +
          xv * fd +
          xw * fc +
          xx * fb +
          xy * fa;
  },
});

function createArray(
  arr: NdArray | ArbDimNumArray | number | ndarray.TypedArray,
  dtype?: string | ArrayLikeConstructor
): NdArray {
  if (arr instanceof NdArray) {
    return arr;
  }
  const T = _.getType(dtype);
  if (_.isNumber(arr)) {
    if (T !== Array) {
      return new NdArray(new T([arr as number]), [1]);
    } else {
      return new NdArray([arr as number], [1]);
    }
  }
  const shape = _.getShape(arr);
  if (shape.length > 1) {
    arr = _.flatten(arr, true);
  }
  if (!(arr instanceof T)) {
    arr = new T(arr);
  }
  return new NdArray(arr as ArbDimNumArray | ndarray.TypedArray, shape);
}
// NdArray.new = createArray;

/*     utils    */
function initNativeArray(shape, i) {
  i = i || 0;
  const c = shape[i] | 0;
  if (c <= 0) {
    return [];
  }
  const result = new Array(c);
  let j;
  if (i === shape.length - 1) {
    for (j = 0; j < c; ++j) {
      result[j] = 0;
    }
  } else {
    for (j = 0; j < c; ++j) {
      result[j] = initNativeArray(shape, i + 1);
    }
  }
  return result;
}

/* istanbul ignore next */
const doUnpack = cwise({
  args: ["array", "scalar", "index"],
  body: function unpackCwise(arr, a, idx) {
    let v = a;
    let i;
    for (i = 0; i < idx.length - 1; ++i) {
      v = v[idx[i]];
    }
    v[idx[idx.length - 1]] = arr;
  },
});

function unpackArray(arr) {
  const result = initNativeArray(arr.shape, 0);
  doUnpack(arr, result);
  return result;
}

function formatNumber(v) {
  return String(Number((v || 0).toFixed(CONF.nFloatingValues)));
}
