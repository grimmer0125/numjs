/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import nj from "../../src";

describe('arccos', function () {
  it('should work on vectors', function () {
    const x = nj.array([-1, 0, 1]);
    expect(nj.arccos(x).tolist())
      .to.eql([ Math.PI, Math.PI / 2, 0 ]);
  });
});
