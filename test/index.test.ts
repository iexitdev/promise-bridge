import { describe, expect, it } from "vitest";
import {
  allSettled,
  defer,
  delay,
  denodeify,
  fcall,
  nfcall,
  ninvoke,
  spread,
  timeout,
  TimeoutError,
  when
} from "../src/index.js";

describe("promise helpers", () => {
  it("wraps sync exceptions with fcall", async () => {
    await expect(
      fcall(() => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
  });

  it("supports when and spread", async () => {
    await expect(when(1, (value) => value + 1)).resolves.toBe(2);
    await expect(spread([1, Promise.resolve(2)] as const, (a, b) => a + b)).resolves.toBe(3);
  });

  it("supports delay and timeout", async () => {
    await expect(delay(1, "ready")).resolves.toBe("ready");
    await expect(timeout(new Promise(() => undefined), 1)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("returns Q-style allSettled results", async () => {
    await expect(allSettled([Promise.resolve(1), Promise.reject(new Error("bad"))])).resolves.toEqual([
      { state: "fulfilled", value: 1 },
      { state: "rejected", reason: expect.any(Error) }
    ]);
  });
});

describe("deferreds and node callbacks", () => {
  it("creates deferred promises", async () => {
    const deferred = defer<string>();
    deferred.resolve("done");

    await expect(deferred.promise).resolves.toBe("done");
  });

  it("supports makeNodeResolver", async () => {
    const deferred = defer<string>();
    deferred.makeNodeResolver()(null, "value");

    await expect(deferred.promise).resolves.toBe("value");
  });

  it("wraps node callback functions", async () => {
    const read = (name: string, callback: (error: Error | null, value?: string) => void) => {
      callback(null, `hello ${name}`);
    };

    await expect(nfcall(read, "q")).resolves.toBe("hello q");
    await expect(denodeify(read)("native")).resolves.toBe("hello native");
  });

  it("invokes methods by name", async () => {
    const store = {
      get(key: string, callback: (error: Error | null, value?: string) => void) {
        callback(null, `value:${key}`);
      }
    };

    await expect(ninvoke(store, "get", "id")).resolves.toBe("value:id");
  });
});

