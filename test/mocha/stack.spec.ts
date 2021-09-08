/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";
import { ValueError}  from "../../src/lib/errors"

describe('stack', function () {
  it('should throw an error if no array given', function () {
    expect(function () {
      nj.stack([]);
    })
    .to.throw(ValueError, 'need at least one array to stack');
  });

  it('should throw an error if arrays do not have the same shape', function () {
    expect(function () {
      nj.stack([1, [2]]);
    })
      .to.throw(ValueError, 'all input arrays must have the same shape');
  });

  it('should work with numbers', function () {
    const x = [ 0, 1, 2 ];
    const stacked = nj.stack(x);
    expect(stacked.shape).to.eql([3]);
    expect(stacked.tolist()).to.eql([0,1,2]);
  });
  it('should work with vectors', function () {
    const x = [ [0,1], [2,3], [4,5] ];
    expect(nj.stack(x).tolist())
      .to.eql([[0, 1],
               [2, 3],
               [4, 5]]);
  });

  it('should enable custom axis', function() {
    const a = nj.array([1, 2, 3]);
    const b = nj.array([2, 3, 4]);
    const s = nj.stack([a, b]);
    expect(s.shape).to.eql([2,3]);
    expect(s.tolist())
    .to.eql([[1, 2, 3],
             [2, 3, 4]]);
    const sInv = nj.stack([a, b], -1);
    expect(sInv.shape).to.eql([3,2]);
    expect(sInv.tolist())
      .to.eql([
        [1, 2],
        [2, 3],
        [3, 4]]);
  });

  it('should work with matrices', function() {
    const x = [1,2,3].map(function (i) { return  nj.zeros([2,2]).assign(i); });
    const s = nj.stack(x);
    expect(s.shape).to.eql([3,2,2]);
    expect(s.tolist())
    .to.eql([[[ 1, 1],
              [ 1, 1]],
            [[ 2, 2],
             [ 2, 2]],
            [[ 3, 3],
             [ 3, 3]]]);

    const sInv = nj.stack(x, -1);
    expect(sInv.shape).to.eql([2,2,3]);
    expect(sInv.tolist())
    .to.eql([[[ 1, 2, 3],
              [ 1, 2, 3]],
             [[ 1, 2, 3],
              [ 1, 2, 3]]]);
  });
});
