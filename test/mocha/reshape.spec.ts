/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import nj from "../../src";
import { ValueError}  from "../../src/lib/errors"

function _range(n:number){
  return Array.from(Array(n).keys())
}

describe('reshape', function () {
  it('should accept native array as input', function () {
    const arr = nj.reshape([0, 1, 2, 3], [2, 2]);
    expect(arr.tolist())
      .to.eql([[0, 1], [2, 3]]);
    expect(arr.shape).to.eql([2, 2]);
  });

  it('should work on vectors', function () {
    const vector = nj.array(_range(12));
    const init = vector.reshape([4, 3]);
    expect(init.shape)
      .to.eql([4, 3]);
    expect(init.tolist())
      .to.eql([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]);
  });
  it('should work on matrix', function () {
    const vector = nj.array(_range(12));
    const reshaped = vector.reshape([3, 4]);
    expect(reshaped.shape)
      .to.eql([3, 4]);
    expect(reshaped.tolist())
      .to.eql([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]);
  });
  it('should preserve type', function () {
    expect(nj.arange(12, 'float32').reshape([4, 3]).dtype)
      .to.equal('float32');
  });
  it('should work on a sliced array but create a cpy', function () {
    const x = nj.arange(15).reshape([3, 5]);
    const reshaped = x.hi(3, 4).reshape([4, 3]);

    expect(x.tolist())
      .to.eql([
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);

    expect(reshaped.tolist())
      .to.eql([
      [0, 1, 2],
      [3, 5, 6],
      [7, 8, 10],
      [11, 12, 13]]);

    x.set(0, 0, 1);

    expect(x.tolist())
      .to.eql([
      [1, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);

    expect(reshaped.tolist())
      .to.eql([
      [0, 1, 2],
      [3, 5, 6],
      [7, 8, 10],
      [11, 12, 13]]);
  });
  it('should not create a copy of the data if adding a new dim at the end', function () {
    const x = nj.arange(15).reshape([3, 5]);
    const reshaped = x.reshape([3, 5, 1]);

    x.set(0, 0, 1);
    expect(reshaped.tolist())
      .to.eql([
      [[1], [1], [2], [3], [4]],
      [[5], [6], [7], [8], [9]],
      [[10], [11], [12], [13], [14]]]);
  });
  it('should not create a removing the last dim', function () {
    const x = nj.arange(15).reshape([3, 5, 1]);
    const reshaped = x.reshape([3, 5]);

    x.set(0, 0, 0, 1);
    expect(reshaped.tolist())
      .to.eql([
      [1, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);
  });
  it('should flatten the array if shape is -1', () => {
    const arr = nj.arange(8)
    .reshape([2, 2, 2])
    .reshape(-1);
    expect(arr.tolist())
      .to.eql(nj.arange(8).tolist());
    expect(arr.shape).to.eql([8]);
  });
  it('should throw an error if more than 1 dimension is set to -1', () => {
    expect(() => nj.arange(8).reshape([-1, -1]))
    .to.throw(
      ValueError, 'can only specify one unknown dimension'
    );
  });
  it('should replace unknown dimension with the right value', () => {
    expect(nj.arange(8).reshape([4, -1]).tolist())
    .to.eql([[0, 1],
             [2, 3],
             [4, 5],
             [6, 7]]);
  });
});
