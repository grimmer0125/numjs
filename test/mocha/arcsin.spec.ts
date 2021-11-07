/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import nj from "../../src";

describe('arcsin', function () {
  it('should work on vectors', function () {
    const x = nj.array([-1, 0, 1]);
    expect(nj.arcsin(x).tolist())
      .to.eql([ -Math.PI / 2, 0, Math.PI / 2 ]);
  });
});
