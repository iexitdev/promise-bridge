# Adoption Plan

Post-publish discovery plan for `promise-bridge`.

This package is an independent alternative or migration helper for `q`; do not imply affiliation with the original project.

## First Search

[Search GitHub package.json dependencies for q](https://github.com/search?q=%22q%22%20path%3Apackage.json&type=code)

## Useful Proof Point

Deferreds, callback adapters, timeout/delay helpers, and Q-style settlement utilities over native promises.

## Pull Request Copy

```md
This removes `q`, which is deprecated, unsupported, or on a stale release line, and replaces the affected call site with `promise-bridge`.

`promise-bridge` is an independent TypeScript migration package with zero runtime dependencies. It is not affiliated with the original project.

Validation:
- [ ] npm install
- [ ] npm test
```
