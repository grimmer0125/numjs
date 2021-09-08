/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src"

describe('softmax', function () {
  it('should work on vectors', function () {
    const x = nj.zeros(3);
    const expected = [1 / 3, 1 / 3, 1 / 3];
    expect(nj.softmax(x).tolist())
      .to.eql(expected);
  });

  it('should work on matrix', function () {
    const x = nj.zeros(4).reshape([2, 2]);
    const expected = [[1 / 4, 1 / 4], [1 / 4, 1 / 4]];
    expect(nj.softmax(x).tolist())
      .to.eql(expected);
  });
});
