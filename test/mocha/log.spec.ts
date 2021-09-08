/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('log', function () {
  it('should work on scalars', function () {
    expect(nj.log(1).tolist())
      .to.eql([0]);
  });
  it('should work on vectors', function () {
    const x = nj.arange(3);
    expect(nj.log(nj.exp(x)).tolist())
      .to.eql(x.tolist());
  });
});
