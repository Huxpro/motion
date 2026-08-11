# Motion conformance cases

The Gallery is a view over executable conformance cases. It is not the source
of truth by itself.

## Case contract

Each case in `src/conformance/cases.ts` represents one upstream behavior and
contains:

-   a stable ID;
-   the upstream repository, version, source path, and test name;
-   the Motion API surface exercised by the case;
-   a compatibility status;
-   semantic assertions shared by the Gallery and Playwright; and
-   the exact Web runtime baseline used for comparison.

One case should be small enough to answer a single review question. A complex
official example must be decomposed into multiple cases when it exercises
independent features such as variants, stagger, SVG, and layout measurement.

## Status

-   `conformant`: the locked Web baseline and Lynx satisfy the same semantic
    assertions.
-   `partial`: the public API is accepted, but a documented part of the behavior
    differs. The missing assertion must be listed.
-   `blocked`: the case has an isolated reproduction and requires a named Lynx
    host/runtime capability. A manually simulated visual result is not a pass.

The evidence portal also shows a separate atomic API inventory:

-   `supported`: the adapter contract is implemented at its documented scope;
-   `partial`: useful behavior exists but a platform or composition boundary is
    narrower than `motion/react`; and
-   `blocked`: the public behavior requires host/runtime architecture that does
    not exist yet.

API support and upstream test conformance are intentionally separate. A
supported API may have only package-test or Lynx Gallery evidence; it becomes a
`conformant` case only after the locked Web baseline and Lynx satisfy the same
semantic assertions.

## Adding a case

1. Pick one named upstream Motion test. Examples can suggest scenarios, but a
   test provides the behavior contract.
2. Add provenance and normalized expected values to the manifest.
3. Render the same Motion props in the Web reference and ReactLynx Gallery.
   Only host tags and documented Lynx layout/event adaptations may differ.
4. Add a Playwright test named after the case ID. Locate the case by stable ID,
   not by Gallery order, and assert computed semantic values rather than raw
   CSS serialization.
5. Run `npm run build` and `npm run test:parity`.
6. Run native Sandbox validation for cases involving the main thread, gestures,
   refs, lifecycle, or platform styles.

## First vertical slice

`component/motion-create` maps the upstream Motion test `renders custom
component` to one Gallery card and one Web/Lynx Playwright test. It verifies
custom-component host-prop/ref forwarding plus a settled declarative target.

While building it, a separate unsupported combination was found:
`motion.create(customComponent)` with React children reaches Lynx-for-Web's
`commitPatchUpdate` with a circular VNode structure. The package-level unit test
does not reproduce this full-runtime boundary. It should become an isolated
upstream blocker case rather than being hidden inside the passing
`component/motion-create` card.

## Coverage denominator

The dashboard reports coverage over the curated entries in
`CONFORMANCE_CASES`, not over Motion's entire test suite. Every entry must name
an upstream version, source path, and test. Adding only a visual example does
not increase this denominator or the exact-conformance numerator.

The evidence ladder currently distinguishes:

1. source-linked upstream contracts tracked;
2. contracts executable in the Gallery;
3. isolated Web/Lynx semantic comparisons; and
4. native evidence recorded for the exact preview build.

These counts are computed from the manifest so a PR diff exposes any metric
change together with the case that caused it.

## Priority and weighted loss

Every tracked contract has five reviewable scores: Motion usage importance,
Web/Lynx platform fit, and remaining MTS, ReactLynx, and CSS effort. The ranked
queue uses:

`importance × platform fit × status loss / (1 + MTS + ReactLynx + CSS)`

`conformant` contributes no status loss, `partial` contributes one half, and
`blocked` contributes the full value. Weighted conformance loss is the sum of
importance-weighted status loss divided by total tracked importance. The
dashboard shows the individual inputs next to the ranking so the ordering can
be challenged without reverse-engineering the score.

`CONVERGENCE_HISTORY` records every capability, architecture, or evidence PR
with loss before/after. A projected value is visually dashed and does not
become the current metric until the exact immutable preview passes the required
package, dual-renderer, and native gates.
