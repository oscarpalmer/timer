# Timer

[![npm version](https://badge.fury.io/js/@oscarpalmer%2Ftimer.svg)](https://badge.fury.io/js/@oscarpalmer%2Ftimer)

A better solution for timeout- and interval-based timers.

## Installation

Timer is available on _npm_ as [`@oscarpalmer/timer`](https://www.npmjs.com/package/@oscarpalmer/timer) to be bundled with your awesome projects.

If you don't need to bundle things, you can use the CDN-version and include a script in your proejcts right away, thanks to [jsDelivr](https://www.jsdelivr.com/package/npm/@oscarpalmer/timer) and  [UNPKG](https://unpkg.com/@oscarpalmer/timer).

## Getting started

This is fairly lightweight package, so hopefully you'll be up and running in seconds :blush:

### Examples

The timers can be called with nice helper methods, which also auto-starts the timers:

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

### CDN & IIFE

If you're using Timer by including the file suffixed with `.iife.js` – or one of the CDN-versions mentioned above – you won't have to import any of the classes or methods.

Instead, just include a `script`-tag in your HTML linking to Timer and you can access Timer in other scripts, as below:

```javascript
// With auto-start
var waited = Timer.wait(callback, time);
var repeated = Timer.repeat(callback, time, count);

// With manual start
waited = new Timer.Waited(callback, time);
repeated = new Timer.Repeated(callback, time, count);
```

## Methods

Both the nice helper methods and the class syntax create similar objects – `Waited` and `Repeated` – which share methods:

|Method|Description|
|-----:|:----------|
|`start()`|Starts the timer: necessary when creating a timer using the class syntax _(e.g. `new Waited...`)_, but helpful when the timer needs to be started at other times, as well|
|`stop()`|Stops the timer|
|`restart()`|Restarts the timer|

## License

[MIT licensed](LICENSE), natch :wink:
