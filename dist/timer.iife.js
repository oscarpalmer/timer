var Timer = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    Repeated: () => Repeated,
    Waited: () => Waited,
    repeat: () => repeat,
    wait: () => wait
  });
  var milliseconds = Math.round(1e3 / 60);
  var request = requestAnimationFrame ?? function(callback) {
    return setTimeout?.(() => {
      callback(Date.now());
    }, milliseconds);
  };
  function run(timed) {
    timed.state.active = true;
    timed.state.finished = false;
    const isRepeated = timed instanceof Repeated;
    let index = 0;
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
          timed.callbacks.default(isRepeated ? index : void 0);
        }
        index += 1;
        if (isRepeated && index < timed.configuration.count) {
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
    get active() {
      return this.state.active;
    }
    get finished() {
      return !this.active && this.state.finished;
    }
    /**
     * @param {RepeatedCallback} callback
     * @param {number} time
     * @param {number} count
     * @param {AfterCallback|undefined} afterCallback
     */
    constructor(callback, time, count, afterCallback) {
      const isRepeated = this instanceof Repeated;
      const type = isRepeated ? "repeated" : "waited";
      if (typeof callback !== "function") {
        throw new TypeError(`A ${type} timer must have a callback function`);
      }
      if (typeof time !== "number" || time < 0) {
        throw new TypeError(
          `A ${type} timer must have a non-negative number as its time`
        );
      }
      if (isRepeated && (typeof count !== "number" || count < 2)) {
        throw new TypeError(
          "A repeated timer must have a number above 1 as its repeat count"
        );
      }
      if (isRepeated && afterCallback !== void 0 && typeof afterCallback !== "function") {
        throw new TypeError(
          "A repeated timer's after-callback must be a function"
        );
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
      (cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
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
  return __toCommonJS(src_exports);
})();
