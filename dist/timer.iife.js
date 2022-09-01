"use strict";
var Timer = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Repeated: () => Repeated,
    Waited: () => Waited,
    repeat: () => repeat,
    wait: () => wait
  });
  var milliseconds = Math.round(1e3 / 60);
  var Timed = class {
    constructor(type, callback, time, count) {
      __publicField(this, "callback");
      __publicField(this, "count");
      __publicField(this, "frame");
      __publicField(this, "running", false);
      __publicField(this, "time");
      __publicField(this, "type");
      if (typeof callback !== "function") {
        throw new Error(`A ${type} timer must have a callback function`);
      }
      if (typeof time !== "number" || time < 0) {
        throw new Error(`A ${type} timer must have a non-negative number as its time`);
      }
      if (type === "repeated" && (typeof count !== "number" || count < 2)) {
        throw new Error(`A ${type} timer must have a number above 1 as its repeat count`);
      }
      this.type = type;
      this.callback = callback;
      this.time = time;
      this.count = count;
    }
    get active() {
      return this.running;
    }
    restart() {
      this.stop();
      Timed.run(this);
      return this;
    }
    start() {
      if (this.running) {
        return this;
      }
      Timed.run(this);
      return this;
    }
    stop() {
      this.running = false;
      if (typeof this.frame === "undefined") {
        return this;
      }
      window.cancelAnimationFrame(this.frame);
      this.frame = void 0;
      return this;
    }
    static run(timed) {
      timed.running = true;
      let count = 0;
      let start;
      function step(timestamp) {
        if (!timed.running) {
          return;
        }
        start ?? (start = timestamp);
        const elapsed = timestamp - start;
        const elapsedMinimum = elapsed - milliseconds;
        const elapsedMaximum = elapsed + milliseconds;
        if (elapsedMinimum < timed.time && timed.time < elapsedMaximum) {
          if (timed.running) {
            timed.callback(timed.type === "repeated" ? count : void 0);
          }
          count += 1;
          if (timed.type === "repeated" && count < timed.count) {
            start = void 0;
          } else {
            timed.stop();
            return;
          }
        }
        timed.frame = window.requestAnimationFrame(step);
      }
      timed.frame = window.requestAnimationFrame(step);
    }
  };
  var Repeated = class extends Timed {
    constructor(callback, time, count) {
      super("repeated", callback, time, count);
    }
  };
  var Waited = class extends Timed {
    constructor(callback, time) {
      super("waited", callback, time, 1);
    }
  };
  function repeat(callback, time, count) {
    return new Repeated(callback, time, count).start();
  }
  function wait(callback, time) {
    return new Waited(callback, time).start();
  }
  return __toCommonJS(src_exports);
})();
