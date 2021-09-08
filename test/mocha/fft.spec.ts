/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('fft', function () {
  it('should work on vectors', function () {
    const C = nj.random([10, 2]);
    const fft = nj.fft(C);
    const ifft = nj.ifft(fft);
    expect(ifft.multiply(10000).round().tolist())
      .to.eql(C.multiply(10000).round().tolist());
  });
});
