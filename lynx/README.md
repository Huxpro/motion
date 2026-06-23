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

- **`convert.ts`** — turns a Framer-Motion target + transition into Lynx
  `animate()` arguments: composes `x/y/scale/rotate/…` shorthands into one
  `transform` string (in motion-dom's `transformPropOrder`, with the same
  default units — `px`/`deg`/unitless), maps `ease` names to timing functions,
  and converts `duration`/`delay` (seconds) → ms, `repeat` → `iterations`.
- **`motion.tsx`** — `motion.view` / `motion.text` / `motion.image`. On mount
  and whenever `animate` changes it calls
  `lynx.getElementById(id).animate([from, to], options)` (the official Lynx
  imperative path). `initial` is painted as the first-frame inline style;
  `whileTap` / `whileHover` are wired through `bindtouchstart` /
  `bindtouchend` and animate to/from the gesture target.

## Lynx for Web + verification

`lynx.config.ts` enables the `web` environment, so `npm run build` emits
`dist/main.web.bundle`. That bundle is rendered in a real browser through
`<lynx-view>` + the pre-bundled `@lynx-js/web-core` client.

```bash
npm install
bash scripts/assemble-web-host.sh   # build + serve Lynx-for-web on :8137
```

The web reference lives in `web-reference/` (standalone Vite + `framer-motion`).
Both were loaded in headless Chromium at 480×720 and screenshotted at the same
moments; the composites are in `evidence/`:

- `evidence/compare-settled.png` — entrance settled (`initial → animate`)
- `evidence/compare-mid.png` — mid-entrance @ ~500ms (staggered `delay` + `easeOut`)
- `evidence/compare-tap.png` — `whileTap` held (`scale` + `backgroundColor`)

In every pair the original-React render and the ReactLynx render are visually
indistinguishable.

## Scope / notes

- The abstraction implements the most load-bearing slice of the `motion/react`
  surface — `initial`, `animate`, `transition` (tween easings, `delay`,
  `repeat`), and the `whileTap` / `whileHover` gestures — enough to make the
  parity examples render identically. Springs, layout/`AnimatePresence`, and
  variants are natural next steps on the same imperative foundation.
- `web-host/static` (vendored web-core client) and the built bundle are
  git-ignored; re-create them with `scripts/assemble-web-host.sh`.

---

_Bootstrapped with `create-rspeedy` (ReactLynx). `npm run dev` serves the native
bundle for LynxExplorer; `npm run build` additionally emits the web bundle._
