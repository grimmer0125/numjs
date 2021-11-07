/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import nj from "../../src";

describe('assign', function () {
  let v;
  beforeEach(function () {
    v = nj.arange(3);
  });
  it('can assign a scalar to a vector and create a new copy', function () {
    const newV = v.assign(1);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([1, 1, 1]);
  });
  it('can assign a scalar to a vector without crating a copy', function () {
    const newV = v.assign(1, false);
    expect(newV).to.equal(v); // should NOT have create a copy
    expect(v.tolist())
      .to.eql([1, 1, 1]);
  });

  it('can assign a vector to another', function () {
    const newV = v.assign(v.add(1));
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([1, 2, 3]);
  });

  it('can assign to a matrix without creating a copy', function () {
    const zeros = nj.zeros([3, 4]);
    zeros.slice([1, -1], [1, -1]).assign(1, false);

    expect(zeros.tolist())
      .to.eql([
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]]);
  });
});
