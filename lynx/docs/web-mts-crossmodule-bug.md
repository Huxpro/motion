# Lynx-for-Web: `@lynx-js/motion` can't be driven on the web target

**TL;DR** — Running `@lynx-js/motion`'s `animate()` on **Lynx-for-Web** fails.
The compiled `main.web.bundle` and the native bundle are **byte-identical** for
the offending worklet — so this is **not** a bundler / react-rsbuild-plugin
compile problem. The failure is purely at **runtime**: `@lynx-js/web-core`'s
worklet runtime does not make a worklet registered on the **background** context
available in the **main thread**'s `lynxWorkletImpl._workletMap`, so a
cross-module `'main thread'` function fails to hydrate on the main thread and
throws. Native runtimes populate `_workletMap` and run the same bytecode fine.

## Environment (all latest at time of writing)

- `@lynx-js/react` 0.123.1, `@lynx-js/react-rsbuild-plugin` 0.18.1,
  `@lynx-js/rspeedy` 0.16.1
- `@lynx-js/web-core` 0.23.0, `@lynx-js/web-elements` 0.12.7
- `@lynx-js/motion` 0.0.4 (deps: `motion` / `motion-dom` 12.42.2)

Reproduced in a real browser (`<lynx-view>` + `client_prod`), driving the
**main thread** via `runOnMainThread(() => { 'main thread'; … })`.

---

## Blocker 1 — cross-module `'main thread'` functions fail to hydrate on web (runtime, not compile)

Using the adapter exactly as its README shows throws at worklet **hydration**
(before the body runs):

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

### The compiled bundles are identical — so it is not a build problem

Minimal repro: a `'main thread'` `spin()` in its own module, called from another
module's worklet. Compiled to **both** targets, the emitted code is the same,
down to the same `_wkltId`:

```js
// main.web.bundle  AND  native background.js  — identical
var spin = { _wkltId: "aba8:817c2:1" };
registerWorkletOnBackground("main-thread", "aba8:817c2:1", function(el, deg) {
    lynxWorkletImpl._workletMap["aba8:817c2:1"].bind(this);      // resolve via _workletMap
    "main thread";
    el.setStyleProperty("transform", "rotate(" + deg + "deg)");  // body IS registered
});
```

The caller worklet is identical on both targets too — it captures `spin` into
its closure:

```js
registerWorkletInternal("main-thread", "4837:89656:1", function() {
    var { el, spin } = this["_c"];   // spin captured from _c on BOTH targets
    "main thread";
    var e = el.current;
    if (e) spin(e, 45);
});
// ...call site passes  _c: { el, spin: _xmod_spin_js__rspack_import_3.spin }
```

So the bundler links the cross-module worklet correctly for web. My earlier
diagnosis (that the web build emits a "non-callable descriptor at the call
site") was **wrong** — corrected here.

### The actual failure is runtime `_workletMap` resolution

At hydration the runtime executes `lynxWorkletImpl._workletMap["aba8:817c2:1"]
.bind(this)`. On web that map entry is **undefined** → `.bind` of undefined →
the crash above. The body was registered via **`registerWorkletOnBackground`**
(background context); `@lynx-js/web-core`'s worklet runtime does not propagate
background-registered worklets into the **main thread**'s `_workletMap`, so the
main-thread caller can't resolve it.

**Same-file** `'main thread'` functions work on web because they are registered
into the **main-thread** registry (`registerWorkletInternal("main-thread", …)`)
and are resolvable by the main-thread caller without any background→main
propagation. (This is exactly why the interim `mtAnimate` — see below — runs on
web.)

### Minimal reproduction

```tsx
// spin.ts  — a 'main thread' function in its OWN module
export function spin(el: any, deg: number) {
  "main thread"
  el.setStyleProperty("transform", "rotate(" + deg + "deg)")
}
```
```tsx
// App.tsx
import { spin } from "./spin.js"      // cross-module → BROKEN on web, OK native
// function spin(...) { "main thread"; ... }  // same-file → WORKS on web
runOnMainThread(() => { "main thread"; if (el.current) spin(el.current, 45) })()
```

---

## The `runtime: "shared"` pattern is the one user-space lever that helps

The docs' [cross-thread shared modules](https://lynxjs.org/4.0/react/main-thread-script.html#cross-thread-shared-modules)
pattern (`import … with { runtime: "shared" }` + a same-file `'main thread'`
wrapper) makes a shared function callable **without** going through
`_workletMap`, so it clears blocker 1 for the wrapped function. But two things
underneath still hit the same runtime gap:

## Blocker 2 — the adapter uses cross-module worklets *internally*

`@lynx-js/motion`'s `animate` (a `'main thread'` fn) calls its element bridge —
`elementOrSelector2Dom` → `isMainThreadElement` — which live in **sibling
modules** as plain `'main thread'` functions (not `runtime: "shared"`). Consumed
through the shared wrapper, blocker 1 is cleared for `animate` itself, but the
first internal cross-module hop then fails the same way:

```
TypeError: tx is not a function     // tx == elementOrSelector2Dom
```

## Blocker 3 — engine's internal `motion-dom` binding is undefined under the web shared runtime

Bypassing the adapter and wiring the raw engine by hand (same-file `ElementCompt`
bridge + shared `animate` from `motion`) reaches DOM visual-element
construction, then throws inside the engine:

```
TypeError: t is not a constructor
//  thisSubject instanceof Element ? createDOMVisualElement : createObjectVisualElement
//  → new motionDom.HTMLVisualElement(options)
```

`HTMLVisualElement` **is** bundled and exported in `main.web.bundle`, and a
direct import proves it's live (`typeof === "function"`). Yet the engine's own
`motionDom.HTMLVisualElement` reference is `undefined` **at call time** — so
`motion` and the `motion-dom` it depends on get a **separate, uninitialised
copy** under the web `runtime: "shared"` graph (a circular-ESM init-order
problem), distinct from the `motion-dom` a consumer imports.

---

## Where the fixes belong

1. **`@lynx-js/web-core` worklet runtime** — make worklets registered via
   `registerWorkletOnBackground` resolvable from the main thread's
   `lynxWorkletImpl._workletMap` (propagate background→main, or register
   main-thread worklets into the main-thread map). Fixes blockers 1 and 2.
2. **web `runtime: "shared"` module initialisation** — ensure a shared
   package's internal namespace deps (`motion` → `motion-dom`) are initialised
   before use, so class bindings aren't undefined at call time. Fixes blocker 3.
   (Likely react-rsbuild-plugin / web worklet-runtime module graph.)
3. Optional adapter-side mitigation for (2)'s cousin: `@lynx-js/motion` could
   make its element bridge web-safe today by inlining
   `elementOrSelector2Dom`/`isMainThreadElement` into the same module as
   `animate`, or marking them `runtime: "shared"` — sidestepping blocker 2
   without waiting for the runtime fix.

## Impact / interim

Until (1) and (2) land, `@lynx-js/motion` can't drive Lynx-for-Web. As an
interim, `motion-lynx` inlines a small **same-file** `'main thread'` animator
(`mtAnimate`) next to its `runOnMainThread` call, using Motion's math (cubic-
bezier easings + colour/number mixing) on `requestAnimationFrame`. It runs on
web **and** native. The backend is switchable (`USE_LYNX_MOTION` build flag): the
authoring API is unchanged, so once the runtime fixes ship, flip the flag to
drive `@lynx-js/motion`'s `animate()` directly.
