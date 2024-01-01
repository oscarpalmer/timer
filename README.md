# Timer

[![npm](https://badge.fury.io/js/@oscarpalmer%2Ftimer.svg)](https://www.npmjs.com/package/@oscarpalmer/timer) [![Tests](https://github.com/oscarpalmer/timer/actions/workflows/test.yml/badge.svg)](https://github.com/oscarpalmer/timer/actions/workflows/test.yml)

A better solution for timeout- and interval-based timers.

## Installation

Timer is available on _npm_ as [`@oscarpalmer/timer`](https://www.npmjs.com/package/@oscarpalmer/timer) to be bundled with your awesome projects.

## Getting started

This is fairly lightweight package, so hopefully you'll be up and running in seconds :blush:

### Examples

The timers can be called with nice helper methods, which also auto-starts the timers:

```typescript
import {repeat, wait} from '@oscarpalmer/timer';

const waited = wait(waitedCallback);
const repeated = repeat(repeatedCallback, 10);
```

Or they can be created using the `new`-keyword, but without being auto-started:

```typescript
import {Timer} from '@oscarpalmer/timer';

const waited = new Timer(waitedCallback);
const repeated = new Timer(repeatedCallback, 10);
```

## Parameters

When creating a _Timer_, either with the new `new`-keyword or using the functions, you can configure the timer with a few parameters:

|Parameter|Description|
|--------:|:----------|
|`callback`|Callback function to be invoked for each run that are __required__ for all timers.<br>For more information on callbacks, please read [the callbacks section](#callbacks).|
|`count`|How many times the timer should run.<br>If no value is provided, it will default to `1` when using the `new`-keyword and the `wait`-method, but throws an error for the `repeat`-method.|
|`time`|How many milliseconds between each invokations of the provided callback.<br>Defaults to `0`, which is not really _0_ milliseconds, but close enough :wink:|
|`after`|A callback to run after the timer finishes, both when cancelled and completed.<br>If _count_ is greater than `1` and _after_ __is not__ `undefined`, a function is expected.|

## Methods and properties

An instance of _Timer_ also has a few helpful methods and properties:

|Name|Type|Description|
|---:|----|:----------|
|`active`|_Property_|A `boolean` value to check if the timer is running|
|`finished`|_Property_|A `boolean` value to check if the timer was able to finish|
|`start()`|_Method_|Starts the timer.<br>Necessary when creating a timer using the class syntax _(e.g. `new Waited...`)_, but helpful when the timer needs to be started at other times, as well.|
|`stop()`|_Method_|Stops the timer|
|`restart()`|_Method_|Restarts the timer|

## Callbacks

Callbacks for both waited and repeated timers receive one parameter:

```typescript
function callback(index) {
	// 'index' is the current step
	// starts at 0, goes up to a maximum of count - 1
	// for this example: 0 → 9
};
```

When you create a repeated timer, you can also provide a callback to run when the timer stops, as below:

```typescript
function after(finished: boolean) {
	// Let's do something fun!
}

repeat(() => {}, 10, after);
```

The `finished`-parameter for the `after`-function can be used to determine if the timer was stopped manually, or if it was able to finish its work.

## License

[MIT licensed](LICENSE), natch :wink:
