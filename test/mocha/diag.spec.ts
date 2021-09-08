/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import nj from "../../src";

describe('diag', () => {
  it('should extract a diagonal if input is a matrix', () => {
    const x = nj.arange(12).reshape([4, 3]);
    expect(nj.diag(x).tolist())
    .to.eql([0, 4, 8]);
  });

  it('should produce a matrix if input is a vector', () => {
    const x = nj.arange(3);
    expect(nj.diag(x).tolist())
    .to.eql([[0, 0, 0],
             [0, 1, 0],
             [0, 0, 2]]);
  });
});
