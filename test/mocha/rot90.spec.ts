/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";
import { ValueError}  from "../../src/lib/errors"

describe('rot90', function () {

  it('should work with default params', function () {
    const m = nj.array([[1,2],[3,4]], 'int');
    expect(nj.rot90(m).tolist()).to.eql([[2, 4], [1, 3]]);
  });

  it('should accept native array as input', function () {
    const arr = nj.rot90([[1,2],[3,4]]);
    expect(arr.tolist()).to.eql([[2, 4], [1, 3]]);
  });

  it('should work when k = 2 ', function () {
    const m = nj.array([[1,2],[3,4]], 'int');
    expect(nj.rot90(m, 2).tolist()).to.eql([[4, 3], [2, 1]]);
  });

  it('should work when k = 3', function () {
    const m = nj.array([[1,2],[3,4]], 'int');
    expect(nj.rot90(m, 3).tolist()).to.eql([[3,1],[4,2]]);
  });

  it('should work when k = 4', function () {
    const m = nj.array([[1,2],[3,4]], 'int');
    expect(nj.rot90(m, 4).tolist()).to.eql([[1,2],[3,4]]);
  });

  it('should raise an error if custom axes is not a 1d array of length 2', function () {
    expect(function () {
      nj.rot90([[1,2],[3,4]], 1, [0,1,2]);
    }).to.throw(ValueError,'len(axes) must be 2');
  });
  it('should raise an error axes are the same', function () {
    expect(function () {
      nj.rot90([[1,2],[3,4]], 1, [0, 0]);
    }).to.throw(ValueError, 'Axes must be different.');
  });
  it('should support custom axes', function () {
    const m = nj.array([[1,2],[3,4]], 'int');
    expect(nj.rot90(m, 1, [1,0]).tolist()).to.eql([[3,1],[4,2]]);
  });
  it('should work on ndarrays', function () {
    const m = nj.arange(8).reshape([2,2,2]);
    expect(nj.rot90(m, 1, [1,2]).tolist()).to.eql([
      [[1, 3],
       [0, 2]],
      [[5, 7],
       [4, 6]]]);
  });
});