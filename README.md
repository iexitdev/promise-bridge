# promise-bridge

Native Promise migration helpers for JavaScript and TypeScript.

`q` is deprecated because modern JavaScript includes native promises. This package keeps the migration helpers teams still need when removing Q: deferreds, `fcall`, `nfcall`, `denodeify`, Q-style settled results, timeouts, delays, and `done`.

It does not recreate Q's full promise subclass or progress-notification model. The point is to move code toward standard promises.

## Install

```sh
npm install promise-bridge
```

## Usage

```ts
import { defer, denodeify, nfcall, timeout } from "promise-bridge";

const deferred = defer<string>();
deferred.resolve("ready");

const readFile = denodeify(fs.readFile);
const text = await timeout(readFile("README.md", "utf8"), 1000);

const value = await nfcall(callbackApi, "input");
```

## API

- `resolve(value)` / `reject(reason)`
- `when(value, onFulfilled?, onRejected?)`
- `fcall(fn, ...args)` / `attempt(fn, ...args)`
- `defer()`
- `delay(ms, value?)`
- `timeout(promise, ms, message?)`
- `all(values)`, `allSettled(values)`, `any(values)`, `spread(values, fn)`
- `nfcall(fn, ...args)`, `nfapply(fn, args)`, `denodeify(fn)`, `nbind(fn, thisArg)`, `ninvoke(object, method, ...args)`
- `done(promise, onFulfilled?, onRejected?)`

## Migration Position

`promise-bridge` is an independent alternative or migration helper for projects moving away from `q`. It is not affiliated with the original package maintainers or project.

For release context, see the local [migration guide](./MIGRATION.md), [examples](./EXAMPLES.md), [compatibility notes](./COMPATIBILITY.md), [source metadata](./SOURCE_METADATA.md), and [adoption plan](./ADOPTION.md).

