"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.ts
var Timed = class {
  constructor(callback, time, count) {
    this.callback = callback;
    this.time = time;
    this.count = count;
    __publicField(this, "frame");
    __publicField(this, "stopped", false);
    Timed.run(this);
  }
  restart() {
    this.stop();
    this.stopped = false;
    Timed.run(this);
  }
  start() {
    if (this.stopped) {
      Timed.run(this);
    }
  }
  stop() {
    this.stopped = true;
    if (typeof this.frame === "undefined") {
      return;
    }
    window.cancelAnimationFrame(this.frame);
    this.frame = void 0;
  }
  static run(timed) {
    const repeated = timed.count > 1;
    let count = 0;
    let start;
    function step(timestamp) {
      if (timed.stopped) {
        return;
      }
      start ?? (start = timestamp);
      const elapsed = timestamp - start;
      if (elapsed >= timed.time) {
        if (!timed.stopped) {
          timed.callback(repeated ? count : void 0);
        }
        count += 1;
        if (timed.count > 1 && count < timed.count) {
          start = void 0;
        } else {
          return;
        }
      }
      timed.frame = window.requestAnimationFrame(step);
    }
    timed.frame = window.requestAnimationFrame(step);
  }
};
var Repeated = class extends Timed {
};
var Waited = class extends Timed {
};
var Timer = class {
  static repeat(callback, time, count) {
    return new Repeated(callback, time, count);
  }
  static wait(callback, time) {
    return new Waited(callback, time, 1);
  }
};
export {
  Repeated,
  Timer,
  Waited
};
