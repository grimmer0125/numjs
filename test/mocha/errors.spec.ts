/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import * as errors from "../../src/lib/errors";
import { ValueError, ConfigError, NotImplementedError}  from "../../src/lib/errors"

describe('errors', function () {
  it('can be a ValueError', function () {
    expect(function () {
      throw new errors.ValueError('txt...');
    }).to.throw(ValueError, 'txt...');
  });
  it('can be a ConfigError', function () {
    expect(function () {
      throw new errors.ConfigError('txt...');
    }).to.throw(ConfigError,'txt...');  
  });
  it('can be a NotImplementedError', function () {
    expect(function () {
      throw new errors.NotImplementedError();
    }).to.throw(NotImplementedError);  
  });
});
