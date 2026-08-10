# Historical: cross-module and shared-runtime Motion blockers

This note records why the original Hux implementation contained a same-file
`mtAnimate` fallback. The fallback and its build flag have now been removed;
the gallery consumes the lynx-stack implementation from
[lynx-stack#3436](https://github.com/lynx-family/lynx-stack/pull/3436).

## 1. Cross-module main-thread worklets

The original reproduction imported a `'main thread'` function from another
module. Dead-code elimination removed the defining module from the main-thread
bundle, so its worklet registration never ran and hydration produced a
non-callable descriptor.

This was tracked in
[lynx-stack#3263](https://github.com/lynx-family/lynx-stack/issues/3263) and
addressed by [lynx-stack#3265](https://github.com/lynx-family/lynx-stack/pull/3265),
which retains captured worklet modules as side-effect imports in the
main-thread transform.

## 2. Shared Motion runtime initialization

After the first problem was bypassed, importing the Motion runtime through the
shared-module path exposed additional initialization and nested-worklet
failures on Lynx for Web:

- Motion read `queueMicrotask` during module initialization before QuickJS had
  a compatible global;
- nested/cross-module worklet references could hydrate as descriptors rather
  than callable functions;
- the generic element bridge crossed another worklet/module boundary.

The stacked declarative implementation handles these at the Lynx adapter
boundary:

- a side-effect dependency module installs main-thread prerequisites before
  Motion initializes;
- shared Motion primitives are imported directly;
- the Lynx `Element` wrapper is constructed inside the owning worklet instead
  of calling a nested cross-module bridge.

## Current verification

The local animator is no longer used. The package-backed path has been verified
with:

- a headless Lynx-for-Web parity test, including infinite animations and a held
  touch sequence;
- native Lynx Sandbox press/release validation;
- package build, declaration generation, publint, formatting, and lint checks.

These fixes unblock the supported declarative subset. They do not create the
DOM visual-element tree, layout/presence system, intersection observer,
cross-platform focus model, or full gesture/orchestration registry required for
complete `motion/react` compatibility; those gaps are tracked from the roadmap
issue linked in `../README.md`.
