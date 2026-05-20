# Examples

`promise-bridge` is an independent package. It is not affiliated with `q` or its maintainers.

## `q` to `promise-bridge`

```ts
import { defer, denodeify, timeout } from "promise-bridge";

const deferred = defer<string>();
const readFileAsync = denodeify(readFile);
const data = await timeout(readFileAsync("config.json"), 1000);
```
