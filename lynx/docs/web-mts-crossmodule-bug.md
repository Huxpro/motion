# Lynx-for-Web: cross-module `'main thread'` functions aren't callable

**TL;DR** — On the **web** target, a `'main thread'` function that lives in a
*different module* from the worklet that calls it is emitted as a non-callable
worklet **descriptor** at the call site, so invoking it throws
`X is not a function`. Same-file `'main thread'` functions work. This is why
`@lynx-js/motion` (whose `animate()` is a cross-module `'main thread'` function)
runs on native but not on Lynx-for-Web.

This is a **react-rsbuild-plugin (web target)** issue, not a `@lynx-js/motion`
issue — motion's `animate()` *is* just Motion's source running in Main Thread
Script; the problem is purely how the web build links a cross-module MTS call.

## Environment

- `@lynx-js/react` 0.123.1, `@lynx-js/react-rsbuild-plugin` 0.18.1,
  `@lynx-js/rspeedy` 0.16.1
- `@lynx-js/web-core` 0.22.2, `@lynx-js/web-elements` 0.12.6
- `@lynx-js/motion` 0.0.3

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
  return <view main-thread:ref={el} style={{ width: "90px", height: "90px", backgroundColor: "#3366ff" }} />
}
```

- **Same-file `spin`** → box rotates 45°. ✅
- **Cross-module `spin`** → `TypeError: Cannot read properties of undefined (reading 'bind')`, box does not rotate. ❌
- Native build (`main.lynx.bundle`) compiles both correctly.

## Root cause (from the compiled `main.web.bundle`)

A **same-file** `'main thread'` function is captured into the caller worklet's
closure `_c` and hydrated to a callable before the body runs:

```js
registerWorkletInternal("main-thread","<caller>", function(){
  var { el:e, spin:r } = this._c;   // r is hydrated → callable
  e.current && r(e.current, 45)
})
```

A **cross-module** function is instead referenced as a bare module binding that
holds a raw **descriptor object**, and the call site calls it directly:

```js
var spin = { _wkltId: "c8e3:a6a4a:1" };           // descriptor, NOT a function
registerWorkletInternal("main-thread","c8e3:a6a4a:1", function(e,t){ /* body */ });  // body IS registered
// caller:
function(){ var { el:e } = this._c; e.current && spin(e.current, 45) }  // spin(...) → "not a function"
```

Without `with { runtime: "shared" }` the body is dropped from the web bundle
entirely; **with** it the body is registered (as above) but the call site still
references the raw descriptor.

The runtime already knows how to resolve descriptors elsewhere
(`lynxWorkletImpl._workletMap[desc._wkltId]`). Proof: resolving it by hand works
for a leaf function —

```js
runOnMainThread(() => {
  "main thread"
  const fn = globalThis.lynxWorkletImpl._workletMap[(spin as any)._wkltId]
  fn(el.current, 45)   // ✅ rotates
})
```

…but this manual bridge is not enough for functions that call **nested** shared
worklets (e.g. motion's `animate` → `elementOrSelector2Dom` → …): the nested
descriptors need the runtime's normal `this._c` hydration, which a hand call
can't reproduce (`Cannot read properties of undefined (reading '_c')`).

## Suggested fix

At a cross-module `'main thread'` call site on the **web** target, emit the
resolved callable instead of the raw descriptor — i.e. treat it exactly like a
same-file / `_c`-captured worklet (hydrate `desc._wkltId` through
`_workletMap`, including nested worklets). The native target already does this.

## Impact / interim

`@lynx-js/motion` can't be driven on Lynx-for-Web until this lands. As an
interim, `motion-lynx` inlines a small `'main thread'` animator (`mtAnimate`) in
the **same file** as its `runOnMainThread` call, using Motion's math (cubic-
bezier easings + colour/number mixing) on `requestAnimationFrame`. Once the
plugin fix ships, that inline animator can be replaced by a direct
`@lynx-js/motion` `animate()` call.
