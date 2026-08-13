# Reviewable PR stack for declarative Motion

## Current problem

PR [lynx-stack#3436](https://github.com/lynx-family/lynx-stack/pull/3436)
targets `main` while depending on
[lynx-stack#3405](https://github.com/lynx-family/lynx-stack/pull/3405).
GitHub therefore presents the base PR plus variants, tap, hover, lifecycle,
runtime fixes, tests, examples, and docs as one 40+ file review.

The first mechanical correction is to set #3436's base to
`feat/declarative-motion`, the head of #3405. The follow-ups should then be
split by behavior contract rather than by implementation file.

## Proposed dependency graph

```text
#3405 declarative core
└── A. cross-runtime animation hardening
    ├── B. named/array/function variants
    ├── C. whileTap + tap callback/event bridge
    │   └── D. whileHover + tap/hover priority
    ├── E. base animation lifecycle callbacks
    │   └── G. whileTap target/restoration lifecycle
    └── F. initial={false} mount semantics
```

Each PR includes its production code, focused unit tests, compatibility-table
row, and changeset when public behavior changes. Gallery changes stay in this
harness and link back to the preview package for that PR.

### A. Cross-runtime hardening

- Preserve infinite repeat across worklet serialization.
- Normalize generated style keys and transform identities.
- Cover Web and native QuickJS behavior.
- Exclude variants and gestures.

### B. Variants

- String and array labels, function variants, `custom`, target-local
  transitions.
- Explicitly exclude parent propagation/orchestration and stagger.

### C. Tap

- `whileTap`, `onTapStart`, `onTap`, `onTapCancel`.
- Include the event-bridge/fallback fixes required by those callbacks.
- No hover code.

### D. Hover

- `whileHover`, `onHoverStart`, `onHoverEnd`.
- Depend on C only where tap-over-hover priority is tested.

### E. Lifecycle

- `onAnimationStart` and `onAnimationComplete` for base `animate`.
- G adds `whileTap` target/restoration definitions, multi-property completion
  aggregation, and interrupted-animation suppression without claiming hover,
  focus, drag, or presence lifecycle coverage.

### F. `initial={false}`

- Base: cross-runtime hardening commit `86de08b1e`, not the variants, gesture,
  or lifecycle stack.
- Diff: `declarative/style.ts`, `declarative/motion.tsx`, the focused
  declarative test file, README contract, and one package changeset.
- Contract: render the final animate/keyframe state on the first frame, skip
  the mount animation, and animate later target changes.
- Lifecycle callback suppression is not asserted here because E is an
  independent sibling. Add that integration assertion only after both E and F
  land; otherwise F silently depends on unrelated lifecycle code.

The worktree `/home/xuan.huang/github/lynx-stack-initial-false-atomic` on local
branch `agent/motion-initial-false-atomic` demonstrates this five-file review
unit. It was derived from the upstream Motion tests `mount animation doesn't
run if initial={false}` and `if initial={false}, take state of final keyframe`.
The two focused assertions pass independently; the full package build also
passes. The hardening base's existing `whilePressed` test currently exposes a
separate asynchronous element-polyfill failure when the complete declarative
test file runs, so that blocker belongs to A rather than being hidden in F.

## Harness PR rule

A lynx-stack capability PR and its Gallery proof should not share a repository
or review unit:

1. land or publish the lynx-stack preview package with focused package tests;
2. update the harness preview pin in a dependency-only commit;
3. add one manifest case, dual renderer, and Playwright assertion;
4. promote the manifest status from `blocked`/`partial` to `conformant` only
   after Web, Lynx-for-Web, and required native checks pass.

This keeps the implementation review concerned with runtime correctness while
the harness review is concerned with upstream provenance and observable
conformance.

## Current completion stack

The next verified stack is based on the previous Motion PR head and keeps each
behavior independently reviewable:

```text
#3483 upstream MotionValue hydration
└── #3484 hover lifecycle ownership
    └── #3485 gesture transitionEnd values
        └── #3486 gesture rest transition ownership
            └── #3487 transitionEnd-only gestures
                └── #3488 transitionEnd-only base animate
                    └── #3489 values removed from animate
                        └── #3490 initial transform origin
                            └── #3492 base variant label propagation
                                └── #3493 numeric delayChildren
                                    └── #3494 variant inheritance opt-out
                                        └── #3495 inherited initial=false
                                            └── #3496 explicit child mount ownership
                                                └── #3497 initial variant transitionEnd
                                                    └── #3498 inherited removed-key style fallback
                                                        └── #3499 inherited removed-key identity fallback
```

Feature-base PRs do not trigger the repository's `pkg.pr.new` workflow. Draft
#3491 is therefore a validation-only rollup against `main`; it must not be
merged. Its immutable `ed0c9f2` motion/react/react-umd package set contains the
stack through #3499 and passes the Hux evidence build. The manifest records the
capability PR that owns each contract, while #3491 records only the immutable
validation gate. Numeric `delayChildren` is deliberately separate from the
dynamic stagger/`when`/controls boundary tracked in issue #10.

Hux evidence PR #72 adds the upstream inherited-child lifecycle contract against
the same immutable package set. It requires no lynx-stack source diff: the child
already reports the inherited variant label at animation start and completion.

Hux evidence PR #73 adds the upstream reactive inherited-value contract against
the same immutable package set. It also requires no lynx-stack source diff: a
child re-resolves the inherited label when its variant target values change.

Hux evidence PR #74 adds the upstream neutral-wrapper propagation contract
against the same immutable package set. It needs no lynx-stack source diff:
variant context already survives intermediate Motion components without an
`animate` prop.

Hux evidence PR #75 adds the upstream deep `initial={false}` propagation
contract against the same immutable package set. It needs no lynx-stack source
diff: the no-mount-animation context already survives a neutral Motion wrapper.

Hux evidence PR #76 adds the upstream nested numeric `delayChildren` contract
against the same immutable package set. The matching lynx-stack package test and
the dual-renderer integration both show descendant delays accumulating; dynamic
delay/stagger/`when` remains in issue #10.

Hux evidence PR #77 adds the complementary explicit-child ownership contract:
an explicit child `animate` prop starts a new delay root instead of inheriting a
parent's numeric `delayChildren`. No lynx-stack source diff is required.

Hux evidence PR #78 adds the upstream nested-controlled-roots contract. Parent
and child explicit `animate` props reactively switch their own named variants
without ownership collisions; no lynx-stack source diff is required.

Atomic lynx-stack PR #3496 narrows inherited `initial={false}` to children that
also inherit the parent animate label. Explicit object children retain their
mount animation and lifecycle, verified from immutable `dfb913f`.

Hux evidence PR #80 promotes array variant labels from Lynx-only gallery proof
to the upstream inline-versus-hoisted definition contract. The existing
`dfb913f` runtime merges labels left to right with no lynx-stack source diff.

Atomic lynx-stack PR #3497 composes an initial named variant's `transitionEnd`
over its ordinary target on the first frame, matching upstream's discrete
initial-value contract. Immutable `2c805a2` provides the exact validation gate.

Hux evidence PR #82 links lynx-stack #3459's existing property-specific
transition routing to an upstream multi-property contract. Opacity settles while
x remains in its own delay, then both reach their targets on immutable `2c805a2`.

Hux evidence PR #83 adds the reverse discrete-display contract: `display`
remains `block` during an opacity exit and switches to `none` only after the
animation completes on immutable `2c805a2`.

Hux evidence PR #84 adds the upstream named-variant style-ownership contract.
Removing `animate` restores the current static opacity/rotate values, later
style updates remain reactive, and re-entering the variant masks style changes
while active on immutable `2c805a2`; lynx-stack #3489 owns the adjacent removed-
target capability.

Hux evidence PR #85 adds the complementary partial-variant contract. Switching
from an opacity variant to an x-only variant restores opacity from static style
while applying x on immutable `2c805a2`; this also reuses lynx-stack #3489's
removed-key ownership without a new source patch.

Hux evidence PR #86 adds the upstream instant-variant `transitionEnd` race.
After proving the `on` variant can apply `display:flex`, a same-turn `on`→`off`
switch remains `display:none` after deferred completion work on immutable
`2c805a2`; lynx-stack #3488 owns the adjacent generation guard.

Hux evidence PR #87 adds the ordinary named-variant completion contract. Web
and Lynx remain visible through a blue→red intermediate frame, then apply
`display:none` only after settling red on immutable `2c805a2`; lynx-stack #3462
owns declarative `transitionEnd` support.

Atomic lynx-stack PR #3498 separates inherited removed-key fallback from the
child's initial animation values. Parent `a→b→c({})` now restores the child's
static style rather than its initial variant on immutable `cd567e7`, without
changing direct animate or delayed inherited animation starts.

Hux evidence PR #89 adds upstream's dynamic inherited-child contract. After a
parent has settled at `visible`, a newly mounted child beneath a neutral Motion
wrapper still resolves inherited `hidden` and reaches `visible` on immutable
`cd567e7`; no lynx-stack source diff is required. The native Sandbox attempt is
not claimed because Playground SDK 0.0.1 cannot decode the current Rspeedy
bundle. This closes list-entry composition only, so presence-driven exit remains
the boundary before a complete dynamic-list Full Demo.

Atomic lynx-stack PR #3499 adds the complementary no-style ownership rule from
upstream: when a memoized child inherits `visible { x: 100, opacity: 1 }` and
then `hidden { opacity: 0 }`, the omitted transform returns to Motion's x=0
identity instead of retaining x=100. Hux evidence PR #90 verifies the exact
hidden→visible→hidden contract against immutable `ed0c9f2`; static child style
from #3498 still has higher precedence. This is an ownership correction rather
than a new complete Gallery usage pattern, so it does not add a Full Demo.

Hux evidence PR #91 covers upstream's asynchronous variant-propagation
contract with a real React/ReactLynx Suspense boundary. The fallback renders
after the parent starts `visible`; resolving the boundary mounts a child that
reports its own inherited animation start and settles at opacity 1 on immutable
`ed0c9f2`. No lynx-stack source diff is required. The Sandbox lease endpoint
returned no serial and timed out on a bounded retry, so native remains
unclaimed. This evidence does not add a Full Demo because it confirms an
already-supported lazy-entry composition rather than unlocking a broader
presence or orchestration pattern.

Hux evidence PR #92 tightens that Suspense contract to the first animation
sample. With a ten-second inherited tween, the asynchronously resolved child
remains below opacity 0.5 shortly after mount in both renderers instead of
jumping directly to opacity 1. It reuses immutable `ed0c9f2` with no lynx-stack
source diff. Native remains unclaimed after the immediately preceding bounded
Sandbox lease timeout, and the stronger assertion is still not a distinct Full
Demo usage pattern.
