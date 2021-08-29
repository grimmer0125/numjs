"use strict";

export class ValueError extends Error {}

// function ValueError() {
//   const err = Error.apply(this, arguments);
//   err.name = this.constructor.name;
//   return err;
// }

export class ConfigError extends Error {}

// function ConfigError() {
//   const err = Error.apply(this, arguments);
//   err.name = this.constructor.name;
//   return err;
// }

export class NotImplementedError extends Error {}

// function NotImplementedError() {
//   const err = Error.apply(this, arguments);
//   err.name = this.constructor.name;
//   return err;
// }
