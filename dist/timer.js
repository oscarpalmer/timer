var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.js
var milliseconds = Math.round(1e3 / 60);
var request = globalThis.requestAnimationFrame ?? function(callback) {
  return setTimeout?.(() => {
    callback(Date.now());
  }, milliseconds);
};
function run(timed) {
  timed.state.active = true;
  timed.state.finished = false;
  const isRepeated = timed instanceof Repeated;
  let count = 0;
  let start;
  function step(timestamp) {
    if (!timed.state.active) {
      return;
    }
    start ?? (start = timestamp);
    const elapsed = timestamp - start;
    const elapsedMinimum = elapsed - milliseconds;
    const elapsedMaximum = elapsed + milliseconds;
    if (elapsedMinimum < timed.configuration.time && timed.configuration.time < elapsedMaximum) {
      if (timed.state.active) {
        timed.callbacks.default(isRepeated ? count : void 0);
      }
      count += 1;
      if (isRepeated && count < timed.configuration.count) {
        start = void 0;
      } else {
        timed.state.finished = true;
        timed.stop();
        return;
      }
    }
    timed.state.frame = request(step);
  }
  timed.state.frame = request(step);
}
var Timed = class {
  /**
   * @param {Function} callback
   * @param {number} time
   * @param {number} count
   * @param {Function?} afterCallback
   */
  constructor(callback, time, count, afterCallback) {
    /**
     * @readonly
     * @type {{after?: Function; default: Function}}
     */
    __publicField(this, "callbacks");
    /**
     * @readonly
     * @type {{count: number; time: number}}
     */
    __publicField(this, "configuration");
    /**
     * @readonly
     * @type {{active: boolean; finished: boolean; frame?: DOMHighResTimeStamp}}
     */
    __publicField(this, "state");
    const isRepeated = this instanceof Repeated;
    const type = isRepeated ? "repeated" : "waited";
    if (typeof callback !== "function") {
      throw new TypeError(`A ${type} timer must have a callback function`);
    }
    if (typeof time !== "number" || time < 0) {
      throw new TypeError(`A ${type} timer must have a non-negative number as its time`);
    }
    if (isRepeated && (typeof count !== "number" || count < 2)) {
      throw new TypeError("A repeated timer must have a number above 1 as its repeat count");
    }
    if (isRepeated && afterCallback !== void 0 && typeof afterCallback !== "function") {
      throw new TypeError("A repeated timer's after-callback must be a function");
    }
    this.configuration = { count, time };
    this.callbacks = {
      after: afterCallback,
      default: callback
    };
    this.state = {
      active: false,
      finished: false,
      frame: null
    };
  }
  /** */
  get active() {
    return this.state.active;
  }
  get finished() {
    return !this.active && this.state.finished;
  }
  restart() {
    this.stop();
    run(this);
    return this;
  }
  start() {
    if (!this.state.active) {
      run(this);
    }
    return this;
  }
  stop() {
    this.state.active = false;
    if (this.state.frame === void 0) {
      return this;
    }
    (globalThis.cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
    this.callbacks.after?.(this.finished);
    this.state.frame = void 0;
    return this;
  }
};
var Repeated = class extends Timed {
};
var Waited = class extends Timed {
  /**
   * @param {Function} callback
   * @param {number} time
   */
  constructor(callback, time) {
    super(callback, time, 1, null);
  }
};
function repeat(callback, time, count, afterCallback) {
  return new Repeated(callback, time, count, afterCallback).start();
}
function wait(callback, time) {
  return new Waited(callback, time).start();
}
export {
  Repeated,
  Waited,
  repeat,
  wait
};
