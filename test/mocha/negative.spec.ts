/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('negative', function () {
  it('should numerical negative, element-wise.', function () {
    expect(nj.arange(3).negative().tolist())
      .to.eql([-0, -1, -2]);
    expect(nj.negative(nj.arange(3)).tolist())
      .to.eql([-0, -1, -2]);
  });
});
