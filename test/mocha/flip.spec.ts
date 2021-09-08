/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('flip', function () {

  it('should work with ndarray', function () {
    const m = nj.arange(8).reshape([2,2,2]);
    expect(nj.flip(m, 0).tolist()).to.eql([
      [[4, 5],
       [6, 7]],
      [[0, 1],
       [2, 3]]]);
    expect(nj.flip(m, 1).tolist()).to.eql([
      [[2, 3],
       [0, 1]],
      [[6, 7],
       [4, 5]]]);
  });
});
