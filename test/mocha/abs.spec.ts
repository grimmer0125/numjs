/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import nj from "../../src";

describe('abs', function () {
  it('should work on vectors', function () {
    const x = nj.array([-1, 0, 1]);
    expect(nj.abs(x).tolist())
      .to.eql([1, 0, 1]);
  });
});
