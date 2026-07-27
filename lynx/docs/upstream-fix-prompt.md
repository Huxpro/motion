# Resolution prompt — for an agent working in `lynx-family/lynx-stack`

Paste this to a coding agent that has the `lynx-stack` monorepo checked out.

---

You are fixing a **Lynx-for-Web** bug in this repo (`lynx-family/lynx-stack`).

## The bug

A `'main thread'` function defined in a **different module** from the worklet
that calls it is **not callable on the web target**. It throws at worklet
hydration:

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

The compiled web bundle is **byte-identical to the native bundle** for the
worklet, so this is a **runtime** problem in the web worklet runtime, not a
compile/bundler problem. The body is registered via
`registerWorkletOnBackground("main-thread", id, fn)` (background context) and the
main-thread caller resolves it via `lynxWorkletImpl._workletMap[id].bind(this)`.
On web, `_workletMap[id]` is **undefined** on the main thread — background
registrations are not made available to the main thread — so `.bind` crashes.
Same-file worklets work because they register into the main-thread registry
(`registerWorkletInternal("main-thread", …)`).

## Your task

1. **Locate the worklet runtime for web.** Start in `packages/react/`
   (worklet-runtime, the `registerWorkletInternal` / `registerWorkletOnBackground`
   implementations, and `lynxWorkletImpl._workletMap`), and `packages/web-platform/`
   (`@lynx-js/web-core`). Find where `_workletMap` is populated for the main
   thread vs the background thread on the **web** target specifically.

2. **Confirm the gap with a test.** Reproduce with a cross-module `'main thread'`
   function called from a `runOnMainThread` worklet, built for the web
   environment, asserting `_workletMap[id]` is populated on the main thread at
   hydration time. Get it failing first.

3. **Fix the propagation.** Make worklets registered via
   `registerWorkletOnBackground` (or otherwise on the background context)
   resolvable from the main thread's `_workletMap` — propagate background→main,
   or register main-thread worklets into the main-thread map, whichever matches
   the runtime's threading model. Match native behavior: the same
   `_workletMap[id].bind(this)` call must succeed on web.
   - Preserve nested worklets (a resolved worklet that itself references other
     `_wkltId` descriptors through `this._c`).
   - Do not regress same-file worklets or the background thread.

4. **Verify** the cross-module repro rotates the box on Lynx-for-Web, and add a
   regression test in the web-platform test suite. Run the existing worklet /
   web-core tests.

## Acceptance

- Cross-module `'main thread'` functions hydrate and run on the web target
  (no `.bind` crash), matching native.
- `@lynx-js/motion`'s `animate()` (whose `animate` → `elementOrSelector2Dom` →
  `isMainThreadElement` chain is cross-module) drives an element on
  Lynx-for-Web.
- New regression test added; existing tests pass.

## Notes

- A separate, likely-related web bug: `runtime: "shared"` packages with internal
  circular deps (`motion` → `motion-dom`) leave a namespace binding `undefined`
  at call time on web (`new motionDom.HTMLVisualElement` → "t is not a
  constructor"). If it's the same subsystem, fix both; otherwise note it for a
  follow-up.
