/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('tanh', function () {
  it('should work on vectors', function () {
    const x = nj.array([-20, 0, 20]);
    expect(nj.tanh(x).tolist())
      .to.eql([Math.tanh(-20), Math.tanh(0), Math.tanh(20)]);
  });
});
