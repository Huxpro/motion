# Lynx-for-Web: `@lynx-js/motion` can't be driven on the web target

> **Status (upstream):** filed as
> [lynx-family/lynx-stack#3263](https://github.com/lynx-family/lynx-stack/issues/3263);
> the core bug is fixed by
> [#3265](https://github.com/lynx-family/lynx-stack/pull/3265) (a
> `@lynx-js/react` patch, open at time of writing). A second issue (blocker 3
> below) remains separate and unresolved.
>
> **Root-cause correction:** earlier revisions of this note blamed a
> `@lynx-js/web-core` **runtime** gap (background→main `_workletMap`
> propagation). That was wrong. #3265 shows the real cause is **build-time**:
> the react worklet **transform** (`swc_plugin_worklet`) lets dead-code
> elimination drop the *defining* module from the **main-thread bundle**, so its
> `registerWorkletInternal()` never runs and `_workletMap[id]` is undefined at
> hydration. It is **not** web-core-specific and **not** web-specific — it
> affects the main-thread (LEPUS) transform pass for both `lynx` and `web`; it
> merely surfaced on web because that is the target we exercised.

## Blocker 1 & 2 — cross-module `'main thread'` functions fail to hydrate (FIXED by #3265)

Symptom, using `@lynx-js/motion` per its README (or any cross-module
`'main thread'` function):

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

### Root cause (per #3265)

A `'main thread'` function defined in a different module from its caller is
captured into the caller's closure (`this._c`) and resolved at hydration via
`lynxWorkletImpl._workletMap[id].bind(this)`. Its `registerWorkletInternal()`
lives in the **defining** module, which reaches the **main-thread** bundle only
through the caller's named import. In the main-thread (LEPUS) pass the
surrounding background-only code (`useEffect`, `runOnMainThread`, …) is shaken
away, that named import becomes unreferenced, and **DCE drops the defining
module** — so its worklet is never registered and `_workletMap[id]` is
`undefined`.

The background (JS) pass is unaffected: the captured identifier is still
referenced there by the `_c` object literal, so its import survives.

**The fix (#3265):** in the main-thread pass, re-add the modules a worklet
closure captures identifiers from as **side-effect-only imports**
(`import './spin.js'`), so they survive DCE and register their worklets. Tested
for both `lynx` and `web` environments.

This covers **blocker 2** too — `@lynx-js/motion`'s internal element bridge
(`elementOrSelector2Dom` → `isMainThreadElement`) is exactly this cross-module
shape (`tx is not a function`).

### Why my earlier "web-core runtime / identical bytecode" reading was wrong

I compared the compiled `spin` module in `main.web.bundle` vs the native bundle
and found them byte-identical, and concluded the difference must be runtime.
Identical module **text** does not mean the module is **reached/executed** —
DCE decides whether the defining module runs in the main-thread bundle. I also
never ran native (no device), so "native works" was unverified; pre-fix, the
native main-thread bundle also lacked the registration.

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
import { spin } from "./spin.js"      // cross-module → BROKEN pre-#3265
runOnMainThread(() => { "main thread"; if (el.current) spin(el.current, 45) })()
```

## Blocker 3 — `runtime:"shared"` / `motion-dom` circular init (SEPARATE, still open)

Wiring the raw engine by hand (`import { animate } from "motion" with { runtime:
"shared" }` + a same-file `ElementCompt` bridge) gets past blockers 1–2 and
reaches DOM visual-element construction, then throws inside the engine:

```
TypeError: t is not a constructor
//  → new motionDom.HTMLVisualElement(options)   (motionDom binding undefined at call time)
```

`HTMLVisualElement` is bundled and a direct import proves it's live, yet the
engine's own `motionDom.HTMLVisualElement` is `undefined` at call time — a
circular-ESM init-order problem for `runtime:"shared"` packages on the web
target. #3265's author confirms this is a **separate subsystem, not addressed**
there. Whether `@lynx-js/motion`'s own `animate()` hits this on web after #3265
is **untested** and needs re-checking once the fix ships.

## Interim / how to consume the fix

`motion-lynx` ships a same-file `'main thread'` animator (`mtAnimate`) that runs
on web **and** native today, and a build flag to switch backends:

- `USE_LYNX_MOTION` unset (default) → `mtAnimate` (small bundle, web + native).
- `USE_LYNX_MOTION=1` → `@lynx-js/motion`'s real `animate()`.

Once `@lynx-js/react` with #3265 is released: upgrade, build with
`USE_LYNX_MOTION=1`, and re-test the adapter on Lynx-for-Web. If blocker 3
appears, track it as the separate `runtime:"shared"` issue; otherwise the flag
becomes the default and `mtAnimate` can be retired. The authoring API is
identical either way.
