/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('ndim', function () {
  it('should be readable', function () {
    const a = nj.arange(15);
    expect(a.ndim).to.equal(1);
    expect(a.reshape(3, 5).ndim).to.equal(2);
  });
});
