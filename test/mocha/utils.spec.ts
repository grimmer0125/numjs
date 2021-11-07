/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";
import { ValueError}  from "../../src/lib/errors"

describe('utils', function () {
  it('broadcast', function () {
    expect(nj.broadcast([], [])).to.equal(undefined);
    expect(nj.broadcast([256, 256, 3], [3])).to.eql([256, 256, 3]);
    expect(nj.broadcast([8, 1, 6, 1], [7, 1, 5])).to.eql([8, 7, 6, 5]);
    expect(nj.broadcast([5, 4], [1])).to.eql([5, 4]);
    expect(nj.broadcast([15, 3, 5], [15, 1, 5])).to.eql([15, 3, 5]);
  });

  describe('iteraxis', function () {
    let x;
    beforeEach(function () {
      x = nj.arange(12).reshape([4, 3]);
    });
    it('should raise an error if axis NOT valid', function () {
      expect(function () {
        x.iteraxis(2, function (xi) {});
      }).to.throw(ValueError, 'invalid axis');
    });
    it('can iterate over rows', function () {
      const y = [];
      x.iteraxis(0, function (xr, i) {
        y[i] = xr.tolist();
      });
      expect(x.tolist()).to.eql(y);
    });
    it('can iterate over columns', function () {
      const y = [];
      x.iteraxis(1, function (xc, i) {
        y[i] = xc.tolist();
      });
      expect(x.transpose().tolist()).to.eql(y);
    });
    it('can iterate over the last axis', function () {
      const y = [];
      x.iteraxis(-1, function (xc, i) {
        y[i] = xc.tolist();
      });
      expect(x.transpose().tolist()).to.eql(y);
    });
  });
});
