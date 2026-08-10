# Motion × Lynx parity gallery

This ReactLynx project is an integration consumer of the declarative components
implemented in [`@lynx-js/motion`](https://github.com/lynx-family/lynx-stack/pull/3436).
It deliberately contains no second animation backend: `src/motion/index.ts`
only re-exports the lynx-stack package.

The project has two jobs:

1. compare the supported Lynx declarative API with the same scene rendered by
   upstream `framer-motion`; and
2. fail when a lynx-stack change breaks a gallery behavior that has already
   converged.

## Run it

```bash
npm install
npm run build
npm run test:parity
```

`npm run build` emits native and Lynx-for-Web bundles. `npm run test:parity`
uses headless Chromium and verifies live/infinite animation, variants,
function variants, lifecycle callbacks, hover/tap priority, a held CDP touch
sequence, release restoration, and public callback labels.

The Web reference in `web-reference/` is pinned to the same upstream Motion
major as the lynx-stack preview package.

## Verified declarative subset

- `initial`, `animate`, `style`, and `transition`
- scalar targets, keyframes, repeat/reverse, colors, and transform aliases
- live `MotionValue` styles
- string/array/function variants, `custom`, and target-local transitions
- `whileTap` plus tap callbacks
- `whileHover` plus hover callbacks on mouse-capable clients
- `onAnimationStart` / `onAnimationComplete` for base `animate` targets

The authoring shape is intentionally the same for those cases, apart from
ReactLynx host element names (`motion.view`/`text` instead of
`motion.div`/`span`). This is not a claim of complete `motion/react`
compatibility.

## Known boundaries

The source-backed roadmap and reproduced blockers live in
[Huxpro/motion#3](https://github.com/Huxpro/motion/issues/3). They cover
focus/in-view/drag, layout and presence, consumer main-thread ref/handler
composition, gesture lifecycle delivery, animation controls, and propagated or
orchestrated variants.

The main long-term reuse boundary is:

- upstream `motion` / `motion-dom` own animation generators, MotionValues,
  interpolation, transitions, and style effects;
- Lynx code owns host elements, dual-thread worklets/events, focus/intersection
  and gesture primitives, layout measurement, and component-tree
  orchestration.

See `docs/web-mts-crossmodule-bug.md` for the historical runtime failures that
made the original local fallback necessary and how the lynx-stack work now
avoids them.
