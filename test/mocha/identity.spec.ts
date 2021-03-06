/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('identity', function () {
  it('should return an n x n array with its main diagonal set to one, and all other elements 0.', function () {
    expect(nj.identity(3).tolist())
    .to.eql([[1, 0, 0],
             [0, 1, 0],
             [0, 0, 1]]);
  });
});
