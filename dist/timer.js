// src/index.ts
var run = function(timer) {
  const { _configuration, _state } = timer;
  _state.active = true;
  _state.finished = false;
  const isRepeated = _configuration.count > 1;
  let index = 0;
  let start;
  function step(timestamp) {
    if (!_state.active) {
      return;
    }
    start ??= timestamp;
    const elapsed = timestamp - start;
    const elapsedMinimum = elapsed - milliseconds;
    const elapsedMaximum = elapsed + milliseconds;
    if (elapsedMinimum < _configuration.time && _configuration.time < elapsedMaximum) {
      if (_state.active) {
        _configuration.callbacks.default(index);
      }
      index += 1;
      if (isRepeated && index < _configuration.count) {
        start = undefined;
      } else {
        _state.finished = true;
        timer.stop();
        return;
      }
    }
    _state.frame = requestAnimationFrame(step);
  }
  _state.frame = requestAnimationFrame(step);
};
function repeat(callback, count, afterOrTime, after) {
  if (typeof count !== "number" || count < 2) {
    throw new TypeError("A repeated timer must have a number greater than or equal to 2 as its run count");
  }
  const afterOrTimeIsFunction = typeof afterOrTime === "function";
  return new Timer(callback, afterOrTimeIsFunction ? 0 : afterOrTime, count, afterOrTimeIsFunction ? afterOrTime : after).start();
}
function wait(callback, time) {
  return new Timer(callback, time).start();
}
var milliseconds = Math.round(16.666666666666668);

class Timer {
  get active() {
    return this._state.active;
  }
  get finished() {
    return this._state.finished;
  }
  constructor(callback, time, count, afterCallback) {
    if (typeof callback !== "function") {
      throw new TypeError("A timer must have a callback function");
    }
    const actualTime = typeof time === "number" ? time : 0;
    if (actualTime < 0) {
      throw new TypeError("A timer must have a non-negative number as its time");
    }
    const actualCount = typeof count === "number" ? count : 1;
    if (actualCount < 1) {
      throw new TypeError("A timer must have a number greater than or equal to 1 as its run count");
    }
    if (actualCount > 1 && afterCallback !== undefined && typeof afterCallback !== "function") {
      throw new TypeError("A repeated timer's after-callback must be a function");
    }
    Object.defineProperty(this, "_configuration", {
      value: {
        callbacks: {
          after: afterCallback,
          default: callback
        },
        count: actualCount,
        time: actualTime
      }
    });
    Object.defineProperty(this, "_state", {
      value: {
        active: false,
        finished: false
      }
    });
  }
  restart() {
    this.stop();
    run(this);
    return this;
  }
  start() {
    if (!this._state.active) {
      run(this);
    }
    return this;
  }
  stop() {
    this._state.active = false;
    if (this._state.frame === undefined) {
      return this;
    }
    cancelAnimationFrame(this._state.frame);
    this._configuration.callbacks.after?.(this._state.finished);
    this._state.frame = undefined;
    return this;
  }
}
export {
  wait,
  repeat,
  Timer
};
