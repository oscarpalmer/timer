# Timer

[![npm version](https://badge.fury.io/js/@oscarpalmer%2Ftimer.svg)](https://badge.fury.io/js/@oscarpalmer%2Ftimer)

A better solution for timeout- and interval-based timers.

## Installation

Timer is available on _npm_ as [`@oscarpalmer/timer`](https://www.npmjs.com/package/@oscarpalmer/timer).

## Getting started

This is fairily lightweight package, so hopefully you'll be up and running in seconds :blush:

### Examples

The timers can be called with nice helper methods, which also auto-start the timers:

```typescript
import {repeat, wait} from '@oscarpalmer/timer';

let waited = wait(callback, time);
let repeated = repeat(callback, time, count);
```

Or they can be created using class syntax, but without being auto-started:

```typescript
import {Repeated, Waited} from '@oscarpalmer/timer';

waited = new Waited(callback, time);
repeated = new Repeated(callback, time, count);
```

Both the nice helper methods and the class syntax create similar objects – `Waited` and `Repeated` – which share methods:

|Method|Description|
|-----:|:----------|
|`start()`|Starts the timer: necessary when creating a timer using the class syntax _(e.g. `new Waited...`)_, but helpful when the timer needs to be started at other times, as well|
|`stop()`|Stops the timer|
|`restart()`|Restarts the timer|

## License

[MIT licensed](LICENSE), natch :wink:
