# Compatibility Notes

`promise-bridge` is an independent migration package for projects leaving `q`; it is not affiliated with the original package maintainers or project.

| Area | Notes |
| --- | --- |
| Preserved migration surface | Deferreds, `when`, `fcall`, callback adapters, settlement helpers, and timeout/delay utilities. |
| Improvements | Native Promise backing, TypeScript types, small migration-focused API, and no scheduler/polyfill stack. |
| Intentional difference | It does not attempt to recreate Q's full historical API surface. |
