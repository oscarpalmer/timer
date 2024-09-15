// node_modules/@oscarpalmer/atoms/dist/js/function.mjs
function noop() {
}

// src/constants.ts
var activeTimers = new Set;
var beginTypes = new Set(["continue", "start"]);
var endTypes = new Set(["pause", "stop"]);
var endOrRestartTypes = new Set([
  "pause",
  "restart",
  "stop"
]);
var hiddenTimers = new Set;
var milliseconds = 1000 / 60;

// src/global.ts
if (globalThis._oscarpalmer_timers == null) {
  Object.defineProperty(globalThis, "_oscarpalmer_timers", {
    get() {
      return globalThis._oscarpalmer_timer_debug ? [...activeTimers] : [];
    }
  });
}

// src/functions.ts
function getOptions(options, isRepeated) {
  return {
    afterCallback: options.afterCallback,
    count: getValueOrDefault(options.count, isRepeated ? Number.POSITIVE_INFINITY : 1),
    errorCallback: options.errorCallback,
    interval: getValueOrDefault(options.interval, milliseconds, milliseconds),
    timeout: getValueOrDefault(options.timeout, isRepeated ? Number.POSITIVE_INFINITY : 30000)
  };
}
function getValueOrDefault(value, defaultValue, minimum) {
  return typeof value === "number" && value > (minimum ?? 0) ? value : defaultValue;
}
function work(type, timer, state, options) {
  if (state.destroyed && type !== "stop" || beginTypes.has(type) && state.active || endTypes.has(type) && !state.active) {
    return timer;
  }
  const { count, interval, timeout } = options;
  const { isRepeated, minimum } = state;
  if (endOrRestartTypes.has(type)) {
    const isStop = type === "stop";
    activeTimers.delete(timer);
    cancelAnimationFrame(state.frame);
    if (isStop) {
      options.afterCallback?.(false);
    }
    state.active = false;
    state.frame = undefined;
    state.paused = !isStop;
    if (isStop) {
      state.elapsed = undefined;
      state.index = undefined;
    }
    return type === "restart" ? work("start", timer, state, options) : timer;
  }
  state.active = true;
  state.paused = false;
  const elapsed = type === "continue" ? +(state.elapsed ?? 0) : 0;
  let index = type === "continue" ? +(state.index ?? 0) : 0;
  state.elapsed = elapsed;
  state.index = index;
  const total = (count === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : (count - index) * (interval > 0 ? interval : milliseconds)) - elapsed;
  let current;
  let start;
  function finish(finished, error) {
    activeTimers.delete(timer);
    state.active = false;
    state.elapsed = undefined;
    state.frame = undefined;
    state.index = undefined;
    if (error) {
      options.errorCallback?.();
    }
    options.afterCallback?.(finished);
  }
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    current ??= timestamp;
    start ??= timestamp;
    const time = timestamp - current;
    state.elapsed = elapsed + (current - start);
    const finished = time - elapsed >= total;
    if (timestamp - start >= timeout - elapsed) {
      finish(finished, !finished);
      return;
    }
    if (finished || time >= minimum) {
      if (state.active) {
        state.callback(isRepeated ? index : undefined);
      }
      index += 1;
      state.index = index;
      if (!finished && index < count) {
        current = null;
      } else {
        finish(true, false);
        return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  activeTimers.add(timer);
  state.frame = requestAnimationFrame(step);
  return timer;
}

// src/models.ts
class TimerTrace extends Error {
  constructor() {
    super();
    this.name = "TimerTrace";
  }
}

// src/timer.ts
function repeat(callback, options) {
  return timer("repeat", callback, options ?? {}, true);
}
function timer(type, callback, partial, start) {
  const isRepeated = type === "repeat";
  const options = getOptions(partial, isRepeated);
  const instance = new Timer(type, {
    callback,
    isRepeated,
    active: false,
    destroyed: false,
    minimum: options.interval - options.interval % milliseconds / 2,
    paused: false,
    trace: new TimerTrace
  }, options);
  if (start) {
    instance.start();
  }
  return instance;
}
function wait(callback, options) {
  return timer("wait", callback, options == null || typeof options === "number" ? {
    interval: options
  } : options, true);
}

class BasicTimer {
  constructor(type, state) {
    this.$timer = type;
    this.state = state;
  }
}

class Timer extends BasicTimer {
  get active() {
    return this.state.active;
  }
  get destroyed() {
    return this.state.destroyed;
  }
  get paused() {
    return this.state.paused;
  }
  get trace() {
    return globalThis._oscarpalmer_timer_debug ? this.state.trace : undefined;
  }
  constructor(type, state, options) {
    super(type, state);
    this.options = options;
  }
  continue() {
    return work("continue", this, this.state, this.options);
  }
  destroy() {
    if (!this.state.destroyed) {
      this.state.destroyed = true;
      this.stop();
      this.options.afterCallback = undefined;
      this.options.errorCallback = undefined;
      this.state.callback = undefined;
      this.state.trace = undefined;
    }
  }
  pause() {
    return work("pause", this, this.state, this.options);
  }
  restart() {
    return work("restart", this, this.state, this.options);
  }
  start() {
    return work("start", this, this.state, this.options);
  }
  stop() {
    return work("stop", this, this.state, this.options);
  }
}

// src/index.ts
function delay(time, timeout) {
  return new Promise((resolve, reject) => {
    const delayed = wait(() => {
      delayed.destroy();
      (resolve ?? noop)();
    }, {
      timeout,
      errorCallback: () => {
        delayed.destroy();
        (reject ?? noop)();
      },
      interval: time
    });
  });
}

// src/is.ts
function is(pattern, value) {
  return pattern.test(value?.$timer);
}
function isRepeated(value) {
  return is(/^repeat$/, value);
}
function isTimer(value) {
  return is(/^repeat|wait$/, value);
}
function isWaited(value) {
  return is(/^wait$/, value);
}
function isWhen(value) {
  return is(/^when$/, value) && typeof value.then === "function";
}
// src/when.ts
function when(condition, options) {
  let result = false;
  const state = {
    started: false,
    timer: timer("repeat", () => {
      if (condition()) {
        result = true;
        state.timer.stop();
      }
    }, {
      afterCallback() {
        if (!state.timer.paused) {
          if (result) {
            state.resolver?.();
          } else {
            state.rejecter?.();
          }
          instance.destroy();
        }
      },
      errorCallback() {
        state.rejecter?.();
        instance.destroy();
      },
      count: options?.count,
      interval: options?.interval,
      timeout: options?.timeout
    }, false)
  };
  const promise = new Promise((resolve, reject) => {
    state.resolver = resolve;
    state.rejecter = reject;
  });
  state.promise = promise;
  const instance = new When(state);
  return instance;
}
var destroyedMessage = "Timer has already been destroyed";
var startedMessage = "Timer has already been started";

class When extends BasicTimer {
  get active() {
    return this.state.timer?.active ?? false;
  }
  get destroyed() {
    return this.state.timer == null;
  }
  get paused() {
    return this.state.timer?.paused ?? false;
  }
  get trace() {
    return this.state.timer?.trace;
  }
  constructor(state) {
    super("when", state);
  }
  continue() {
    this.state.timer?.continue();
    return this;
  }
  destroy() {
    this.state.timer?.destroy();
    this.state.promise = undefined;
    this.state.resolver = noop;
    this.state.rejecter = noop;
    this.state.timer = undefined;
  }
  pause() {
    this.state.timer?.pause();
    return this;
  }
  stop() {
    this.state.timer?.stop();
    return this;
  }
  then(resolve, reject) {
    if (this.state.timer == null || this.state?.started) {
      throw new Error(this.state.timer == null ? destroyedMessage : startedMessage);
    }
    this.state.started = true;
    this.state.timer.start();
    return this.state.promise.then(resolve ?? noop, reject ?? noop);
  }
}

// src/index.ts
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    for (const timer4 of activeTimers) {
      hiddenTimers.add(timer4);
      timer4.pause();
    }
  } else {
    for (const timer4 of hiddenTimers) {
      timer4.continue();
    }
    hiddenTimers.clear();
  }
});
export {
  when,
  wait,
  repeat,
  isWhen,
  isWaited,
  isTimer,
  isRepeated,
  delay
};
