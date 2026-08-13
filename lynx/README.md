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
The current dependency gate is the immutable `013e20e` preview set published
by validation-only [lynx-stack#3491](https://github.com/lynx-family/lynx-stack/pull/3491);
the complete suite passes 74/74 source-linked behaviors. Capability ownership
remains with the atomic #3483–#3507 stack rather than the validation rollup.

The Web reference in `web-reference/` is pinned to the same upstream Motion
major as the lynx-stack preview package.

## Evidence portal

`npm run build:evidence` assembles a local static site in `evidence-dist/` and
refreshes the existing Vercel artifact at `dev/html/motion-lynx-demo/`. The
repository-level config can publish the local output; the established
`dev/html/vercel.json` project serves the committed artifact. Both apply the
cross-origin isolation headers required by Lynx for Web. Every PR preview
exposes four shareable views:

- `/?view=overview` — current verdict, metrics, and the weighted-loss chart;
  every chart point and the latest-steps strip beneath it deep-link into the
  convergence ledger on the Conformance view;
- `/?view=examples` — live Web and ReactLynx galleries with synchronized
  scrolling, mirrored taps, a dual-runtime "run both" trigger per scenario,
  and an overlay slider layout for small screens;
- `/?view=api` — filterable atomic API support/boundary matrix, with each
  API linked to its Motion.dev documentation page; and
- `/?view=conformance` — the convergence ledger plus upstream source paths
  (linked to `motiondivision/motion` at the pinned version), test names,
  acceptance criteria, and per-case evidence marks.

Every view is available in English and Simplified Chinese via the `lang`
query parameter (persisted to `localStorage`); the masthead carries the
toggle. In production the two Examples panes are same-origin, which is what
lets the portal observe scroll positions and dispatch synthetic taps into
both runtimes — including through Lynx for Web's open shadow roots. The
bridge degrades gracefully (controls disable) in `npm run dev`, where the
Lynx preview is served cross-origin; `tests/portal-compare.spec.ts` covers
it against the assembled `evidence-dist/` artifact.

One deliberate userspace shim lives in the Examples view: Lynx for Web's
platform layer synthesizes Lynx touch events from DOM *touch* input only
(no pointer/mouse mapping anywhere in `@lynx-js/web-core`/`web-elements`),
so motion gestures such as `whileTap` cannot be pressed with a mouse.
The portal re-dispatches real mouse clicks in the Lynx pane as synthetic
touch taps — safe because Lynx routes `bindtap` from click and gestures
from touch, two disjoint channels. The proper fix belongs upstream in
lynx-stack's web event synthesis (map pointer events to Lynx touch), at
which point the adapter can be deleted; `@lynx-js/motion`'s use of
`bindtouchstart`/`main-thread:bindtouchstart` is platform-correct as-is.

The portal, Gallery, and Playwright checks consume
[`src/conformance/cases.ts`](./src/conformance/cases.ts). Counts and percentages
are derived from that manifest rather than copied into presentation code.
See [`docs/evidence-portal.md`](./docs/evidence-portal.md) for the PR artifact
contract.

## Implemented declarative subset

- `initial`, `animate`, `style`, and `transition`
- initial named variants apply `transitionEnd` values on the first frame
- stale `transitionEnd` from an instant named variant cannot overwrite a newer variant
- named variants apply discrete `transitionEnd` only after value interpolation completes
- property-specific transition timing routes independently within one target
- discrete `display:none` waits until an opacity exit completes
- scalar targets, keyframes, repeat/reverse, colors, and transform aliases
- live `MotionValue` styles
- string/array/function variants, including left-to-right array merging with
  equivalent inline and hoisted definitions; `custom`, target-local transitions, and
  static style ownership restoration after a named variant is removed; re-entering
  the variant masks later style updates while it remains active, and switching to
  a variant that omits a property restores that property from style; parent
  `initial`/`animate` label inheritance with numeric `delayChildren`
  and `inherit={false}` context boundaries; parent `initial={false}` also
  suppresses inherited child mount animations, and inherited targets re-resolve
  when their variant values change; labels also pass through neutral Motion
  wrapper components, including deep `initial={false}` first-frame semantics;
  numeric `delayChildren` also accumulates through nested descendants, while
  an explicit child `animate` prop starts a new delay-ownership root; nested
  controlled roots also switch their own variants independently, and a parent
  `initial={false}` does not suppress an explicitly controlled child mount
  animation; when an inherited parent variant omits a child property, that
  property returns to the child static style rather than its initial variant;
  if no static style owns a removed transform, a memoized inherited child
  restores Motion's transform identity without needing to rerender; a child
  resolving from a real Suspense boundary also runs its inherited animation
  from the initial state instead of skipping directly to the animate value
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
