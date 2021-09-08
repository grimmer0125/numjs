/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('cos', function () {
  it('should work on vectors', function () {
    const x = nj.array([0, Math.PI / 2, Math.PI]);
    expect(nj.cos(x).round().tolist())
      .to.eql([1, 0, -1]);
  });
});
