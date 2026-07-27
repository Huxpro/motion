# Lynx-for-Web: `@lynx-js/motion` can't be driven on the web target

**TL;DR** — Running `@lynx-js/motion`'s `animate()` on **Lynx-for-Web** fails.
The [cross-thread shared modules](https://lynxjs.org/4.0/react/main-thread-script.html#cross-thread-shared-modules)
pattern (`with { runtime: "shared" }` + a same-file `'main thread'` wrapper)
**does clear the first blocker** — it makes the engine callable — but two
web-target defects remain underneath it. Native works for all of this; only the
**web** target is affected, so these are **react-rsbuild-plugin / web-runtime**
issues, not `@lynx-js/motion` source issues.

## Environment (all latest at time of writing)

- `@lynx-js/react` 0.123.1, `@lynx-js/react-rsbuild-plugin` 0.18.1,
  `@lynx-js/rspeedy` 0.16.1
- `@lynx-js/web-core` 0.23.0, `@lynx-js/web-elements` 0.12.7
- `@lynx-js/motion` 0.0.4 (deps: `motion` / `motion-dom` 12.42.2)

All three findings below were reproduced on these versions in a real browser
(`<lynx-view>` + `client_prod`), driving the **main thread** via
`runOnMainThread(() => { 'main thread'; … })`.

---

## Blocker 1 — cross-module `'main thread'` functions are non-callable descriptors

Using the adapter exactly as its README shows:

```tsx
import { animate } from "@lynx-js/motion"
runOnMainThread(() => {
  "main thread"
  animate(el, { rotate: 360 }, { duration: 2, repeat: Infinity, ease: "linear" })
})()
```

throws at worklet **hydration** on web (before the body runs):

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

### Root cause (from the compiled `main.web.bundle`)

A **same-file** `'main thread'` function is captured into the caller worklet's
closure `_c` and hydrated to a callable before the body runs:

```js
registerWorkletInternal("main-thread","<caller>", function(){
  var { el:e, spin:r } = this._c;   // r is hydrated → callable
  e.current && r(e.current, 45)
})
```

A **cross-module** `'main thread'` function is instead referenced as a bare
module binding holding a raw **descriptor object**, and the call site invokes it
directly:

```js
var spin = { _wkltId: "c8e3:a6a4a:1" };          // descriptor, NOT a function
registerWorkletInternal("main-thread","c8e3:a6a4a:1", function(e,t){ /* body */ });
// caller: e.current && spin(e.current, 45)        // spin(...) → "not a function"
```

The web bundle carries **23** `_wkltId` descriptors but only **2**
`registerWorkletInternal` bodies. Native (`main.lynx.bundle`) compiles both
same-file and cross-module correctly.

### Minimal repro

```tsx
// spin.ts  — a 'main thread' function in its OWN module
export function spin(el: any, deg: number) {
  "main thread"
  el.setStyleProperty("transform", "rotate(" + deg + "deg)")
}
```
```tsx
// App.tsx
import { spin } from "./spin.js"      // cross-module → BROKEN on web
// function spin(...) { "main thread"; ... }  // same-file → WORKS on web
runOnMainThread(() => { "main thread"; if (el.current) spin(el.current, 45) })()
```

---

## The shared-modules pattern clears blocker 1

The docs prescribe wrapping a third-party main-thread lib like this:

```ts
import { animate as _animate } from "motion" with { runtime: "shared" }
export function animate(...args) { "main thread"; return _animate(...args) }
```

With this pattern the engine **is** callable on web — the `.bind` hydration
crash is gone and the wrapped `animate` runs. This is real progress over
"cross-module main-thread functions simply don't work." But it then surfaces the
two deeper defects below.

---

## Blocker 2 — the adapter uses cross-module worklets *internally*

`@lynx-js/motion`'s own `animate` (a `'main thread'` fn) calls its element
bridge — `elementOrSelector2Dom` → `isMainThreadElement` — which live in
**sibling modules** and are plain `'main thread'` functions (not `runtime:
"shared"`). Consuming the adapter's `animate` through the shared wrapper gets
past blocker 1, but the first internal cross-module hop then fails:

```
TypeError: tx is not a function     // tx == elementOrSelector2Dom, a descriptor
```

So even with the shared wrapper, `@lynx-js/motion` can't be reused **as-is** on
web, because its internal element bridge is exactly the blocker-1 shape.

## Blocker 3 — engine's internal `motion-dom` binding is undefined under the web shared runtime

Bypassing the adapter and wiring the raw engine by hand — same-file
`ElementCompt` bridge + shared `animate` from `motion` — gets **all the way to
DOM visual-element construction**. After forcing the DOM branch
(`globalThis.Element = ElementCompt`, so `subject instanceof Element` is true),
it throws inside the engine:

```
TypeError: t is not a constructor
// at:  thisSubject instanceof Element ? createDOMVisualElement : createObjectVisualElement
//      → new motionDom.HTMLVisualElement(options)
```

`HTMLVisualElement` **is** bundled and exported in `main.web.bundle`
(`exports.HTMLVisualElement = HTMLVisualElement`). Importing it directly proves
the class is live in the shared runtime:

```
MT_RUN start; ctors: function function function   // HTML/SVG/Object VisualElement
```

…yet the engine's own `motionDom.HTMLVisualElement` reference is `undefined`
**at call time**. So `motion` and the `motion-dom` it depends on receive a
**separate, uninitialised copy** under the web `runtime: "shared"` graph (a
circular-ESM init-order problem) — distinct from the `motion-dom` a consumer
imports. Force-importing the classes doesn't fix the engine's internal binding.

---

## Where the fixes belong (all web target)

1. **Register cross-module `'main thread'` worklets for the web target** — emit
   the resolved callable at the call site (hydrate `desc._wkltId` through
   `lynxWorkletImpl._workletMap`, including nested worklets) exactly as native
   does. Fixes blockers 1 and 2. *(react-rsbuild-plugin)*
2. **Fix shared-runtime module initialisation** so a `runtime: "shared"`
   package's internal namespace deps (`motion` → `motion-dom`) are initialised
   before use — no undefined class bindings at call time. Fixes blocker 3.
   *(react-rsbuild-plugin / web worklet runtime)*
3. Optionally, `@lynx-js/motion` could make its element bridge web-safe today
   (inline `elementOrSelector2Dom`/`isMainThreadElement` into the same module as
   `animate`, or mark them `runtime: "shared"`), sidestepping blocker 2 without
   waiting for (1).

## Impact / interim

Until (1) and (2) land, `@lynx-js/motion` can't drive Lynx-for-Web. As an
interim, `motion-lynx` inlines a small `'main thread'` animator (`mtAnimate`) in
the **same file** as its `runOnMainThread` call, using Motion's math (cubic-
bezier easings + colour/number mixing) on `requestAnimationFrame`. It runs on
web **and** native. Once the plugin fixes ship, `mtAnimate` can be replaced by a
direct `@lynx-js/motion` `animate()` call with no change to the authoring API.
