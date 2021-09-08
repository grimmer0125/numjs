/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('max', function () {
  it('should be null for an empty array', function () {
    const arr = nj.array([]);
    expect(arr.max()).to.equal(null);
  });
  it('should return the max element in array', function () {
    const arr = nj.arange(10);
    expect(arr.max()).to.equal(9);
  });
});
