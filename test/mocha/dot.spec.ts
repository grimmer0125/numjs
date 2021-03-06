/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src"

describe('dot', function () {
  describe('on vectors', function () {
    let v3, v12;

    beforeEach(function () {
      v3 = nj.arange(3); v12 = nj.arange(12);
    });

    it('should work if vectors have the same length', function () {
      expect(nj.dot(v3, v3).tolist()).to.eql([5]);
      expect(nj.dot(v12, v12).tolist()).to.eql([506]);
    });

    it('should throw an error lengths are different', function () {
      expect(function () { nj.dot(v3, v12); }).to.throw();
    });
  });

  it('should work on matrix', function () {
    const a = nj.arange(12).reshape([4, 3]);
    const b = nj.arange(12).reshape([3, 4]);
    expect(nj.dot(a, b).tolist()).to.eql([
      [20, 23, 26, 29],
      [56, 68, 80, 92],
      [92, 113, 134, 155],
      [128, 158, 188, 218]
    ]);
    expect(a.dot(b).tolist()).to.eql([
      [20, 23, 26, 29],
      [56, 68, 80, 92],
      [92, 113, 134, 155],
      [128, 158, 188, 218]
    ]);
    expect(nj.dot(b, a).tolist()).to.eql([
      [42, 48, 54],
      [114, 136, 158],
      [186, 224, 262]
    ]);
    expect(b.dot(a).tolist()).to.eql([
      [42, 48, 54],
      [114, 136, 158],
      [186, 224, 262]
    ]);
  });

  it('should be able to multiply a vector with a matrix', function () {
    const a = nj.arange(2);
    const b = nj.arange(6).reshape([2, 3]);
    expect(nj.dot(a, b).tolist())
      .to.eql([3, 4, 5]);
    expect(nj.dot(b.T, a).tolist())
      .to.eql([3, 4, 5]);
  });
  it('should be fast on vectors even if they are very large', function () {
    const N = 100000;
    const a = nj.ones([N]);
    expect(a.dot(a).tolist()).to.eql([N]);
  });
  it('should be fast on V.M even if they are very large', function () {
    const n = 1000;
    const m = 1000;
    const V = nj.ones([n]);
    const M = nj.ones([n, m]);
    const VdotM = nj.ones([m]).multiply(n, false);
    expect(V.dot(M).tolist())
      .to.eql(VdotM.tolist());
  });
});
