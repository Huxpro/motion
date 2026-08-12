# Motion × Lynx parity gallery

This ReactLynx project is an integration consumer of the declarative components
implemented in [`@lynx-js/motion`](https://github.com/lynx-family/lynx-stack/pull/3436).
It deliberately contains no second animation backend: `src/motion/index.ts`
only re-exports the lynx-stack package.

The project has three jobs:

1. compare the supported Lynx declarative API with the same scene rendered by
   upstream `framer-motion`; and
2. fail when a lynx-stack change breaks a gallery behavior that has already
   converged; and
3. publish a Vercel-ready evidence portal for human reviewers, with live
   Web/Lynx panes, an atomic API matrix, and source-linked conformance metrics.

Manifest-backed cases and their migration contract live in
[`conformance/README.md`](./conformance/README.md). New coverage is added as one
upstream behavior per card/test rather than by growing the original monolithic
showcase. The proposed lynx-stack review stack is documented in
[`docs/atomic-pr-stack.md`](./docs/atomic-pr-stack.md).

## Run it

```bash
npm install
npm run build
npm run test:parity
npm run build:evidence
```

`npm run build` emits native and Lynx-for-Web bundles. `npm run test:parity`
starts both the locked upstream Web reference and Lynx-for-Web, then uses
headless Chromium to verify manifest-backed semantic assertions as well as the
legacy live/infinite animation, variants, lifecycle, and gesture checks.
The current dependency gate is the immutable `f6b0e90` preview set published
by validation-only [lynx-stack#3491](https://github.com/lynx-family/lynx-stack/pull/3491);
the complete suite passes 52/52 source-linked behaviors. Capability ownership
remains with the atomic #3483–#3495 stack rather than the validation rollup.

The Web reference in `web-reference/` is pinned to the same upstream Motion
major as the lynx-stack preview package.

## Evidence portal

`npm run build:evidence` assembles a local static site in `evidence-dist/` and
refreshes the existing Vercel artifact at `dev/html/motion-lynx-demo/`. The
repository-level config can publish the local output; the established
`dev/html/vercel.json` project serves the committed artifact. Both apply the
cross-origin isolation headers required by Lynx for Web. Every PR preview
exposes four shareable views:

- `/?view=overview` — current verdict and evidence ladder;
- `/?view=examples` — live, side-by-side Web and ReactLynx galleries;
- `/?view=api` — filterable atomic API support/boundary matrix; and
- `/?view=conformance` — upstream source paths, test names, acceptance
  criteria, and coverage status.

The portal, Gallery, and Playwright checks consume
[`src/conformance/cases.ts`](./src/conformance/cases.ts). Counts and percentages
are derived from that manifest rather than copied into presentation code.
See [`docs/evidence-portal.md`](./docs/evidence-portal.md) for the PR artifact
contract.

## Implemented declarative subset

- `initial`, `animate`, `style`, and `transition`
- scalar targets, keyframes, repeat/reverse, colors, and transform aliases
- live `MotionValue` styles
- string/array/function variants, `custom`, target-local transitions, and
  parent `initial`/`animate` label inheritance with numeric `delayChildren`
  and `inherit={false}` context boundaries; parent `initial={false}` also
  suppresses inherited child mount animations
- `whileTap` plus tap callbacks
- `whileHover` plus hover callbacks on mouse-capable clients
- `onAnimationStart` / `onAnimationComplete` for base `animate`, inherited
  variant children, and `whileTap` target/restoration lifecycles

The authoring shape is intentionally the same for those examples, apart from
ReactLynx host element names (`motion.view`/`text` instead of
`motion.div`/`span`). This is not a claim of complete `motion/react`
compatibility.

## Known boundaries

The source-backed roadmap and reproduced blockers live in
[Huxpro/motion#3](https://github.com/Huxpro/motion/issues/3). They cover
focus/in-view/drag, layout and presence, consumer main-thread ref/handler
composition, remaining gesture lifecycles, animation controls, gesture variant
propagation, and dynamic/staggered child timing orchestration.

The main long-term reuse boundary is:

- upstream `motion` / `motion-dom` own animation generators, MotionValues,
  interpolation, transitions, and style effects;
- Lynx code owns host elements, dual-thread worklets/events, focus/intersection
  and gesture primitives, layout measurement, and component-tree
  orchestration.

See `docs/web-mts-crossmodule-bug.md` for the historical runtime failures that
made the original local fallback necessary and how the lynx-stack work now
avoids them.
