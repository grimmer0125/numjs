/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('transpose', function () {
  it('should work on vectors', function () {
    const x = nj.arange(12);
    const y = x.transpose();
    expect(y.shape).to.eql([12]);
    expect(y.tolist()).to.eql(x.tolist());
  });
  it('should work on matrix', function () {
    const x = nj.arange(12).reshape([4, 3]);
    const y = x.transpose();
    expect(x.shape).to.eql([4, 3]);
    expect(y.shape).to.eql([3, 4]);
    expect(y.tolist())
      .to.eql([
      [0, 3, 6, 9],
      [1, 4, 7, 10],
      [2, 5, 8, 11]]);
  });
  it('should work on multdimensional array with custom axes passed as a list', function () {
    const x = nj.arange(5 * 4 * 3 * 2).reshape([5, 4, 3, 2]);
    const y = x.transpose([0, 2, 1, 3]);
    expect(x.shape).to.eql([5, 4, 3, 2]);
    expect(y.shape).to.eql([5, 3, 4, 2]);
  });
  it('should work on multdimensional array with custom axes', function () {
    const x = nj.arange(5 * 4 * 3 * 2).reshape([5, 4, 3, 2]);
    const y = x.transpose(0, 2, 1, 3);
    expect(x.shape).to.eql([5, 4, 3, 2]);
    expect(y.shape).to.eql([5, 3, 4, 2]);
  });
  it('should work after slicing', function () {
    const x = nj.arange(16).reshape([4, 4]);
    const subX = x.lo(1, 1).hi(2, 2);
    expect(subX.tolist())
      .to.eql([
      [5, 6],
      [9, 10]]);
    expect(subX.transpose().tolist())
      .to.eql([
      [5, 9],
      [6, 10]]);
  });
  it('should be used with T shortcut', function () {
    const x = nj.arange(12).reshape([4, 3]);
    expect(x.T.tolist()).to.eql(x.transpose().tolist());
  });
});
