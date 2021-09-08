/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src"

describe('subtract', function () {
  let v, m;
  beforeEach(function () {
    v = nj.arange(3);
    m = nj.arange(3 * 2).reshape([3, 2]);
  });
  it('can subtract a scalar to a vector and create a new copy', function () {
    const newV = nj.subtract(v, 1);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([-1, 0, 1]);
  });
  it('can subtract a scalar to a vector without crating a copy', function () {
    const newV = v.subtract(1, false);
    expect(newV).to.equal(v); // should NOT have create a copy
    expect(v.tolist())
      .to.eql([-1, 0, 1]);
  });

  it('can sum 2 vector', function () {
    const newV = v.subtract(v);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([0, 0, 0]);
  });
  it('can subtract a scalar to a matrix', function () {
    const newMatrix = m.subtract(1);
    expect(newMatrix).not.to.equal(m); // should have create a copy
    expect(newMatrix.tolist())
      .to.eql([[-1, 0], [1, 2], [3, 4]]);
  });
  it('can subtract 2 matrix', function () {
    const newV = m.subtract(m);
    expect(newV).not.to.equal(m); // should have create a copy
    expect(newV.tolist())
      .to.eql([[0, 0], [0, 0], [0, 0]]);
  });
});
