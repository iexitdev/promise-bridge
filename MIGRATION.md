# Migration Guide

`promise-bridge` is an independent alternative or migration helper for projects moving away from `q`. It is not affiliated with the original package maintainers or project.

## First Command

```sh
npm install promise-bridge
```

## Migration Target

- Source package: `q`
- Replacement package: `promise-bridge`
- Source signal: npm deprecation notice recommends native promises for most users
- Migration direction: Deferreds, callback adapters, timeout/delay helpers, and Q-style settlement utilities over native promises.

## Compatibility Posture

- Preserved: Deferreds, `when`, `fcall`, callback adapters, settlement helpers, and timeout/delay utilities.
- Improved: Native Promise backing, TypeScript types, small migration-focused API, and no scheduler/polyfill stack.
- Intentional difference: It does not attempt to recreate Q's full historical API surface.

## Review Checklist

- Replace the old dependency at one migration boundary first.
- Run the package or application test suite after the swap.
- Keep attribution accurate: this package is independent and is not an official successor to `q`.
