/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('equal', function () {
  it('should be true if all items are the same', function () {
    const arr = nj.arange(3);
    expect(nj.equal(arr, [0, 1, 2])).to.equal(true);
    expect(nj.equal(arr.reshape(3, 1), arr.reshape(3, 1))).to.equal(true);
  });
  it('should not changes arrays values', function () {
    let a = nj.array([1, 2, 3, 4, 0, 0, 0, 0]).reshape(4, 2);
    let b = nj.array([1, 2, 3, 4, 0, 0, 0, 0]).reshape(4, 2);
    expect(nj.equal(a, b)).to.equal(true);
    expect(nj.equal(a, b)).to.equal(true);  // see https://github.com/nicolaspanel/numjs/issues/88
  });  
  it('should be false if arrays do not have the same shape', function () {
    const arr = nj.arange(3);
    expect(nj.equal(arr, [0, 1])).to.equal(false);
    expect(nj.equal(arr, arr.reshape(3, 1))).to.equal(false);
    expect(nj.equal(arr, arr.reshape(1, 3))).to.equal(false);
    expect(nj.equal(arr.reshape(1, 3), arr.reshape(3, 1))).to.equal(false);
  });
});
