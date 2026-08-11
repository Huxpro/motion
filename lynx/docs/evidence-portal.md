# Vercel evidence contract for stacked Motion PRs

The Vercel preview is a review artifact, not a marketing compatibility claim.
It must make three different questions independently observable.

## Visual reference and source boundary

The Motion package repository does not contain the `motion.dev` application
source. Its root README states that the website is built with Framer. The
portal therefore follows the public site's rendered product language without
claiming to reuse private site code:

-   TASA Orbiter for interface and content typography;
-   near-black surfaces, hard grid lines, and no ornamental card chrome;
-   one high-contrast accent per evidence view;
-   readable interface type: 16px body copy, 14px secondary copy, and a 12px
    minimum for metadata and table headers;
-   monospaced type only for indexes, source identifiers, versions, and statuses;
    and
-   progressive disclosure for detailed upstream assertions.

The visual system exists to support the review path: run examples, inspect the
API surface, then audit source-linked conformance. Decorative themes must not
compete with this sequence. Labels that merely restate a visible heading are
omitted so the information hierarchy is carried by the content itself.

## Overview monitor contract

`/?view=overview` is the operational front page for reviewers, not a product
landing page. It derives every count from the shared conformance manifest and
keeps four kinds of information visible together:

-   atomic API progress grouped by capability area;
-   the complete list of currently blocked atomic APIs;
-   the ranked conformance backlog with importance, platform fit, and
    MTS/ReactLynx/CSS effort;
-   weighted loss over time, tied to the PR that changed or preserved it;
-   evidence availability for every tracked upstream contract; and
-   the current conformance result for each contract.

Evidence availability is a repository snapshot, not live CI health. GitHub PR
checks remain authoritative for the current build and test result. The Gallery
is an executable showcase and evidence surface, but it is intentionally
secondary to the progress and test monitor.

## 1. Can a human execute the capability?

`/?view=examples` presents the locked Web Motion baseline and the ReactLynx
preview side by side. A scenario may combine related props to make interaction
and visual differences legible. It must have a stable `example-*` container
and `target-*` element so Playwright does not depend on Gallery order.

The scenario index labels its evidence level. `lynx-e2e` means the Lynx runtime
behavior is asserted; it does not mean exact upstream conformance.

## 2. What public API contract is supported?

`/?view=api` lists atomic component factories, props, target forms, callbacks,
and architecture-dependent features. Each entry has:

-   a support status;
-   its strongest evidence level;
-   a concise contract;
-   a platform/composition boundary when the status is partial or blocked; and
-   an executable example link when one exists.

This is the public support document for reviewers. README prose should not be a
second, independently maintained matrix.

## 3. How far has upstream convergence progressed?

`/?view=conformance` uses a curated, source-linked upstream test slice. Each
case names the upstream version, source path, test, assertions, and missing
evidence. Only cases with the same semantic assertions passing on locked Web
Motion and Lynx are counted as exact conformance.

The dashboard must label its denominator. It must never present the curated
slice as coverage of Motion's complete upstream suite.

## Stacked PR workflow

1. A lynx-stack capability PR lands focused package tests and a preview package.
2. A dependent Huxpro/motion PR updates only the preview pin and manifest status
   needed for that capability.
3. Add or promote one upstream contract per commit, including its dual-renderer
   assertion when possible.
4. Link the Vercel URLs for Overview, Examples, API, and
   Conformance in the PR description.
5. Do not promote `partial` to `conformant` until the evidence tier shown in the
   dashboard agrees with the claim.
6. Record every Lynx and consumer PR in the convergence ledger. Keep projected
   loss separate from accepted loss while an immutable preview gate is pending.

## Build and gates

```bash
npm run build:evidence
npm run test:parity
```

The root `vercel.json` runs the same evidence build and serves
`lynx/evidence-dist`. The pre-existing `dev/html/vercel.json` deployment serves
the committed mirror in `dev/html/motion-lynx-demo`, so projects configured
with either root continue to receive the same portal. Playwright verifies the
two runtime galleries, manifest semantics, all four portal views, computed
counts, and mobile overflow.
