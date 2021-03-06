/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";

describe('get', function () {
  describe('on 1d array', function () {
    let a;
    beforeEach(function () {
      a = nj.arange(3);
    });
    it('can locate with positive index', function () {
      expect(a.get(1)).to.equal(1);
    });
    it('can locate with positive index', function () {
      expect(a.get(1)).to.equal(1);
    });
    it('can locate with negative index', function () {
      expect(a.get(-1)).to.equal(2);
    });
  });
  describe('on 2d array', function () {
    let a;
    beforeEach(function () {
      a = nj.arange(3 * 3).reshape(3, 3);
    });
    it('should work with positive index', function () {
      expect(a.get(1, 1)).to.equal(4);
    });
    it('should accept negative integer', function () {
      expect(a.get(-1, -1)).to.equal(8);
    });
  });
});
