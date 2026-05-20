export type MaybePromise<T> = T | PromiseLike<T>;
export type NodeCallback<T> = (error: Error | null, value?: T) => void;
export type NodeFunction<TArgs extends unknown[], TResult> = (
  ...args: [...TArgs, NodeCallback<TResult>]
) => void;
export type AwaitedTuple<T extends readonly unknown[]> = { [K in keyof T]: Awaited<T[K]> };

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: MaybePromise<T>) => void;
  reject: (reason?: unknown) => void;
  notify: (value: unknown) => void;
  makeNodeResolver: () => NodeCallback<T>;
}

export type SettledResult<T> =
  | { state: "fulfilled"; value: T }
  | { state: "rejected"; reason: unknown };

export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number, message = `Timed out after ${timeoutMs}ms`) {
    super(message);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export function resolve<T>(value: MaybePromise<T>): Promise<T> {
  return Promise.resolve(value);
}

export function reject<T = never>(reason?: unknown): Promise<T> {
  return Promise.reject(reason);
}

export function when<T, R = T>(
  value: MaybePromise<T>,
  onFulfilled?: (value: T) => MaybePromise<R>,
  onRejected?: (reason: unknown) => MaybePromise<R>
): Promise<T | R> {
  return Promise.resolve(value).then(onFulfilled, onRejected);
}

export function fcall<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => MaybePromise<TResult>,
  ...args: TArgs
): Promise<TResult> {
  return Promise.resolve().then(() => fn(...args));
}

export const attempt = fcall;

export function defer<T = void>(): Deferred<T> {
  let resolveDeferred!: (value: MaybePromise<T>) => void;
  let rejectDeferred!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolveDeferred = res;
    rejectDeferred = rej;
  });

  return {
    promise,
    resolve: resolveDeferred,
    reject: rejectDeferred,
    notify: () => undefined,
    makeNodeResolver: () => (error, value) => {
      if (error) {
        rejectDeferred(error);
        return;
      }

      resolveDeferred(value as T);
    }
  };
}

export function delay(ms: number): Promise<void>;
export function delay<T>(ms: number, value: T): Promise<T>;
export function delay<T>(ms: number, value?: T): Promise<T | void> {
  assertMilliseconds(ms);

  return new Promise((resolveDelay) => {
    setTimeout(() => resolveDelay(value), ms);
  });
}

export function timeout<T>(
  value: MaybePromise<T>,
  ms: number,
  message?: string
): Promise<T> {
  assertMilliseconds(ms);

  return new Promise<T>((resolveTimeout, rejectTimeout) => {
    const timer = setTimeout(() => {
      rejectTimeout(new TimeoutError(ms, message));
    }, ms);

    Promise.resolve(value).then(
      (result) => {
        clearTimeout(timer);
        resolveTimeout(result);
      },
      (error: unknown) => {
        clearTimeout(timer);
        rejectTimeout(error);
      }
    );
  });
}

export function all<T>(values: Iterable<MaybePromise<T>>): Promise<T[]> {
  return Promise.all(values);
}

export async function allSettled<T>(
  values: Iterable<MaybePromise<T>>
): Promise<Array<SettledResult<T>>> {
  const results = await Promise.allSettled(values);

  return results.map((result) =>
    result.status === "fulfilled"
      ? { state: "fulfilled", value: result.value }
      : { state: "rejected", reason: result.reason }
  );
}

export function any<T>(values: Iterable<MaybePromise<T>>): Promise<T> {
  return Promise.any(values);
}

export async function spread<T extends readonly unknown[], R>(
  values: MaybePromise<T>,
  fn: (...values: AwaitedTuple<T>) => MaybePromise<R>
): Promise<R>;
export async function spread<T, R>(
  values: Iterable<MaybePromise<T>>,
  fn: (...values: T[]) => MaybePromise<R>
): Promise<R>;
export async function spread<R>(
  values: MaybePromise<readonly unknown[]> | Iterable<MaybePromise<unknown>>,
  fn: (...values: unknown[]) => MaybePromise<R>
): Promise<R> {
  const resolvedInput = await Promise.resolve(values as MaybePromise<readonly unknown[]>);
  const resolved = await Promise.all(Array.from(resolvedInput));

  return fn(...resolved);
}

export function nfapply<TArgs extends unknown[], TResult>(
  fn: NodeFunction<TArgs, TResult>,
  args: TArgs
): Promise<TResult> {
  return new Promise<TResult>((resolveNode, rejectNode) => {
    fn(...args, (error, value) => {
      if (error) {
        rejectNode(error);
        return;
      }

      resolveNode(value as TResult);
    });
  });
}

export function nfcall<TArgs extends unknown[], TResult>(
  fn: NodeFunction<TArgs, TResult>,
  ...args: TArgs
): Promise<TResult> {
  return nfapply(fn, args);
}

export function denodeify<TArgs extends unknown[], TResult>(
  fn: NodeFunction<TArgs, TResult>
): (...args: TArgs) => Promise<TResult> {
  return (...args) => nfapply(fn, args);
}

export function nbind<TArgs extends unknown[], TResult, TThis>(
  fn: (this: TThis, ...args: [...TArgs, NodeCallback<TResult>]) => void,
  thisArg: TThis
): (...args: TArgs) => Promise<TResult> {
  return (...args) => nfapply(fn.bind(thisArg) as NodeFunction<TArgs, TResult>, args);
}

export function ninvoke<TObject extends object, TKey extends keyof TObject, TResult>(
  object: TObject,
  method: TKey,
  ...args: TObject[TKey] extends (...methodArgs: [...infer TArgs, NodeCallback<TResult>]) => void
    ? TArgs
    : never
): Promise<TResult> {
  const fn = object[method];

  if (typeof fn !== "function") {
    return Promise.reject(new TypeError(`${String(method)} is not a function`));
  }

  return nfapply(fn.bind(object) as NodeFunction<unknown[], TResult>, args as unknown[]);
}

export function done<T>(
  value: MaybePromise<T>,
  onFulfilled?: (value: T) => unknown,
  onRejected?: (reason: unknown) => unknown
): void {
  Promise.resolve(value)
    .then(onFulfilled, onRejected)
    .catch((error) => {
      queueMicrotask(() => {
        throw error;
      });
    });
}

function assertMilliseconds(ms: number): void {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError("milliseconds must be a non-negative finite number");
  }
}

export default {
  all,
  allSettled,
  any,
  attempt,
  defer,
  delay,
  denodeify,
  done,
  fcall,
  nbind,
  nfapply,
  nfcall,
  ninvoke,
  reject,
  resolve,
  spread,
  timeout,
  when
};
