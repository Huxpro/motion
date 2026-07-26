# Motion × Lynx — porting Motion's declarative React API to ReactLynx

This package ports Motion (this repo) to a new [Lynx](https://lynxjs.org)
project and proves that **the ReactLynx authoring API can look identical to the
original React `motion/react` API**.

Lynx already ships the *imperative* Motion.dev engine: every element exposes
`element.animate(keyframes, options)`
([Lynx animate API](https://lynxjs.org/api/lynx-api/lynx/lynx-animate-api)),
which is the adapted Motion.dev imperative core — "the same code and API" as on
the web. What Lynx did **not** have is the *declarative* layer that
`framer-motion` gives React (`<motion.div animate={…}>`). That declarative layer
is exactly what this port adds, as a thin abstraction (`src/motion`) on top of
the imperative engine.

## The point: identical authoring API

The reference scene is written twice — once for the web with `framer-motion`
(`../dev/react/src/tests/lynx-parity.tsx`) and once for Lynx with this port
(`src/App.tsx`). A diff of the two shows the **only** differences are:

| | Original React (web) | ReactLynx port |
|---|---|---|
| import | `import { motion } from "framer-motion"` | `import { motion } from "./motion"` |
| elements | `<motion.div>` / `<span>` | `<motion.view>` / `<text>` |

Every animation prop is byte-for-byte the same:

```tsx
<motion.view              // <motion.div> on web
    initial={{ opacity: 0, y: 60, scale: 0.4 }}
    animate={{ opacity: 1, y: 0, scale: 1, rotate: i * 90 }}
    transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
    whileTap={{ scale: 1.15, backgroundColor: "#ffcc00" }}
/>
```

## How the abstraction works (`src/motion`)

- **`motion.tsx`** — `motion.view` / `motion.text` / `motion.image`, plus
  `mtAnimate`, a small **main-thread animator**. On mount and whenever `animate`
  changes, the component hops to the main thread (`runOnMainThread`) and calls
  `mtAnimate(element, target, transition, from)` against a `main-thread:ref`.
  `mtAnimate` composes `x/y/scale/rotate/…` into a `transform` string (motion-dom
  order + units), supports **keyframe arrays** (`y: [0, -34, 0]`), `repeat` /
  `repeatType` (`loop` / `reverse` / `mirror`), colour interpolation, and per-
  element supersede — driven by `requestAnimationFrame`, using the same
  cubic-bezier easing curves (framer-motion's control points) Motion uses.
  `initial` is painted as the first-frame inline style. `whileTap` is wired to
  `bindtouchstart`/`bindtouchend` for touch **and** `bindtap` for desktop mouse
  (Lynx-for-web bridges native `touchstart`/`click` but has no mouse-down → touch
  event, so a mouse click only surfaces as `tap`; the tap handler pulses the
  press and de-dupes the synthetic click that trails a real touch).
- **`convert.ts`** — resolves `initial` into the first-paint inline style
  (transform composition + default units), so there's no flash before the
  main-thread animation takes over.

### Why not call `@lynx-js/motion` directly?

`@lynx-js/motion` **is** the real Motion.dev engine ported to Lynx, and on
**native** Lynx it's the right call. But it ships its `animate()` as
`'main thread'` worklets inside `node_modules`, and the ReactLynx **web** build
does not register node_modules (or any cross-module) `'main thread'` function
into web-core's worklet runtime — so on **Lynx-for-Web** the reference compiles
to a non-callable worklet descriptor and throws (`animate is not a function`;
the native bundle compiles it correctly). This was traced end to end: web-core's
main-thread element itself is fine (`setStyleProperty` renders), and a
**first-party, same-file** `'main thread'` function runs perfectly. So the
animator lives inline in `motion.tsx` and uses Motion's math directly, which
runs on both web and native. Re-enabling `@lynx-js/motion`'s own `animate()`
here is blocked on a web-core/plugin fix (registering cross-module main-thread
worklets for the web target).

## Lynx for Web + verification

`lynx.config.ts` enables the `web` environment, so `npm run build` emits
`dist/main.web.bundle`. That bundle is rendered in a real browser through
`<lynx-view>` + the pre-bundled `@lynx-js/web-core` client.

```bash
npm install
bash scripts/assemble-web-host.sh   # build + serve Lynx-for-web on :8137
```

The web reference lives in `web-reference/` (standalone Vite + `framer-motion`).
Both were loaded in headless Chromium and screenshotted the same way; the
composites are in `evidence/`:

- `evidence/compare-gallery.png` — six live examples (whileTap · loop · keyframes · reverse · color keyframes · staggered entrance)
- `evidence/compare-tap.png` — `whileTap` held under a desktop mouse press (`scale` + `backgroundColor`)

In every pair the original-React render and the ReactLynx render are visually
indistinguishable.

## Scope / notes

- The abstraction implements the most load-bearing slice of the `motion/react`
  surface — `initial`, `animate` (including keyframe arrays), `transition`
  (tween easings, `delay`, `repeat`/`repeatType`), and the `whileTap` gesture —
  enough to make the gallery render identically. Springs,
  layout/`AnimatePresence`, and variants are natural next steps on the same
  imperative foundation. `whileHover` is kept for API parity but is inert on
  Lynx-for-web, which exposes no hover event.
- `web-host/static` (vendored web-core client) and the built bundle are
  git-ignored; re-create them with `scripts/assemble-web-host.sh`.

---

_Bootstrapped with `create-rspeedy` (ReactLynx). `npm run dev` serves the native
bundle for LynxExplorer; `npm run build` additionally emits the web bundle._
