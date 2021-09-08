/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('sin', function () {
  it('should work on vectors', function () {
    const x = nj.array([-Math.PI / 2, 0, Math.PI / 2]);
    expect(nj.sin(x).round().tolist())
      .to.eql([-1, 0, 1]);
  });
});
