/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('sqrt', function () {
  it('should work on vectors', function () {
    const x = nj.array([1, 4, 9]);
    expect(nj.sqrt(x).tolist())
      .to.eql([1, 2, 3]);
    expect(x.sqrt().tolist())
      .to.eql([1, 2, 3]);
  });
});
