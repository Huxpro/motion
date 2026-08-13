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
```

Feature-base PRs do not trigger the repository's `pkg.pr.new` workflow. Draft
#3491 is therefore a validation-only rollup against `main`; it must not be
merged. Its immutable `f6b0e90` motion/react/react-umd package set contains the
stack through #3495 and passes the Hux evidence build. The manifest records the
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
