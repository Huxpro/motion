# [web] cross-module `'main thread'` functions fail to hydrate on Lynx-for-Web (`_workletMap[id]` undefined → `.bind` crash)

> Ready-to-file issue for **lynx-family/lynx-stack**. Repro + evidence below.

## Summary

On the **web** target, calling a `'main thread'` function that is defined in a
**different module** from the worklet that calls it throws at worklet
hydration:

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

The **compiled `main.web.bundle` is byte-identical to the native bundle** for
the offending worklet, so this is **not** a bundler / `react-rsbuild-plugin`
compile problem. It is a **`@lynx-js/web-core` worklet-runtime** problem: a
worklet registered on the **background** context (`registerWorkletOnBackground`)
is not resolvable from the **main thread**'s `lynxWorkletImpl._workletMap`, so
the main-thread caller can't hydrate it.

Same-file `'main thread'` functions work, because they register into the
main-thread registry (`registerWorkletInternal("main-thread", …)`) and resolve
locally. This is why `@lynx-js/motion` runs on native but not on Lynx-for-Web —
its `animate()` and element bridge are cross-module `'main thread'` functions.

## Environment

- `@lynx-js/react` 0.123.1, `@lynx-js/react-rsbuild-plugin` 0.18.1, `@lynx-js/rspeedy` 0.16.1
- `@lynx-js/web-core` 0.23.0, `@lynx-js/web-elements` 0.12.7
- Repro also seen driving `@lynx-js/motion` 0.0.4.

## Minimal reproduction

```tsx
// spin.ts  — a 'main thread' function in its OWN module
export function spin(el: any, deg: number) {
  "main thread"
  el.setStyleProperty("transform", "rotate(" + deg + "deg)")
}
```

```tsx
// App.tsx
import { runOnMainThread, useEffect, useMainThreadRef } from "@lynx-js/react"
import { spin } from "./spin.js"                 // cross-module → BROKEN on web
// function spin(...) { "main thread"; ... }      // same-file → WORKS on web

export function App() {
  const el = useMainThreadRef(null)
  useEffect(() => {
    runOnMainThread(() => { "main thread"; if (el.current) spin(el.current, 45) })()
  }, [])
  return <view main-thread:ref={el}
    style={{ width: "90px", height: "90px", backgroundColor: "#3366ff" }} />
}
```

Build for both targets (`environments: { web: {}, lynx: {} }`), render the web
bundle in `<lynx-view>` + `client_prod`.

- **Cross-module `spin`** → `TypeError: Cannot read properties of undefined (reading 'bind')`; box does not rotate.
- **Same-file `spin`** → box rotates 45°.
- Native build compiles and runs both.

## Evidence: the bytecode is identical, the runtime differs

The `spin` module compiles the same way in **both** `main.web.bundle` and the
native `background.js`:

```js
var spin = { _wkltId: "aba8:817c2:1" };
registerWorkletOnBackground("main-thread", "aba8:817c2:1", function(el, deg) {
    lynxWorkletImpl._workletMap["aba8:817c2:1"].bind(this);      // resolve via _workletMap
    "main thread";
    el.setStyleProperty("transform", "rotate(" + deg + "deg)");  // body IS registered
});
```

The caller worklet is identical on both targets and captures `spin` into its
closure `_c`:

```js
registerWorkletInternal("main-thread", "4837:89656:1", function() {
    var { el, spin } = this["_c"];   // spin captured from _c on BOTH targets
    "main thread";
    if (el.current) spin(el.current, 45);
});
// call site: runOnMainThread(fn, { _c: { el, spin: <spin module export> } })
```

At hydration the runtime runs `lynxWorkletImpl._workletMap["aba8:817c2:1"]
.bind(this)`. On web that entry is **undefined** → `.bind` crash. The body was
registered via `registerWorkletOnBackground`; the main-thread `_workletMap`
never receives it.

## Suggested fix

In `@lynx-js/web-core`'s worklet runtime, make worklets registered via
`registerWorkletOnBackground` resolvable from the main thread's
`lynxWorkletImpl._workletMap` — i.e. propagate background→main registrations (or
register main-thread worklets directly into the main-thread map) so that a
main-thread caller can hydrate a cross-module `'main thread'` worklet, matching
native behavior.

## Impact

Any Lynx-for-Web project that puts `'main thread'` functions in a separate
module or library is affected. In particular, **`@lynx-js/motion` cannot drive
Lynx-for-Web** today, because its `animate()` and its element bridge
(`elementOrSelector2Dom` → `isMainThreadElement`) are cross-module
`'main thread'` functions.

## Related (separate issue candidate)

Wiring the raw `motion` engine via `import … with { runtime: "shared" }` gets
past the above, but then `motion`'s internal `motion-dom` namespace binding is
`undefined` at call time on web (`new motionDom.HTMLVisualElement` →
`t is not a constructor`), suggesting a circular-ESM init-order problem for
`runtime: "shared"` packages on the web target. Happy to file separately.
