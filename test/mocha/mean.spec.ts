/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('mean', function () {
  it('should work on vectors', function () {
    expect(nj.array([-1, 1]).mean()).to.equal(0);
    expect(nj.arange(7).mean()).to.equal(3);
    expect(nj.arange(10).mean()).to.equal(4.5);
  });
});
