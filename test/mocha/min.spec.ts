/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('min', function () {
  it('should be null for an empty array', function () {
    const arr = nj.array([]);
    expect(arr.min()).to.equal(null);
  });
  it('should return the min element in array', function () {
    const arr = nj.arange(10);
    expect(arr.min()).to.equal(0);
  });
});
