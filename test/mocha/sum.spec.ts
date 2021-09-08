/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('sum', function () {
  it('should work on vectors', function () {
    const x = nj.arange(3);
    expect(nj.sum(x)).to.eql(3);
  });

  it('should work on matrix', function () {
    const x = nj.ones([10, 10]);
    expect(nj.sum(x)).to.eql(100);
  });
});
