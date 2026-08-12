export type ConformanceStatus = "conformant" | "partial" | "blocked"
export type SupportStatus = "supported" | "partial" | "blocked"
export type EvidenceLevel =
    "dual-renderer" | "lynx-e2e" | "package-test" | "planned"

export interface UpstreamSource {
    repository: "motiondivision/motion"
    sourceVersion: string
    path: string
    testName: string
}

export interface ConformanceCase {
    id: string
    category: string
    title: string
    summary: string
    status: ConformanceStatus
    api: readonly string[]
    upstream: UpstreamSource
    baseline: string
    assertions: readonly string[]
    gap?: string
    evidence: {
        gallery: boolean
        packageTest: boolean
        dualRenderer: boolean
        native: boolean
    }
    expected?: Record<string, number>
    expectedDefinition?: string
    expectedDefinitions?: Record<string, string>
}

export interface AtomicCapability {
    id: string
    group:
        | "Components"
        | "Targets"
        | "Variants"
        | "Gestures"
        | "Lifecycle"
        | "Layout & presence"
        | "Composition"
    api: string
    status: SupportStatus
    evidence: EvidenceLevel
    contract: string
    boundary?: string
    exampleId?: string
}

export interface GalleryExample {
    id: string
    title: string
    summary: string
    api: readonly string[]
    evidence: "dual-renderer" | "lynx-e2e"
}

export interface GapPriority {
    caseId: string
    /** User impact: 1 = niche, 5 = core Motion usage. */
    importance: number
    /** Platform fit: 1 = fundamental Web/Lynx conflict, 5 = direct fit. */
    platformFit: number
    /** Remaining compatibility effort by layer: 0 = none, 5 = architecture. */
    mts: number
    reactLynx: number
    css: number
    rationale: string
    issue?: string
}

export interface ConvergenceRecord {
    id: string
    date: string
    title: string
    kind: "capability" | "architecture" | "evidence" | "regression"
    status: "merged" | "verified" | "stacked" | "pending"
    lynxStackPr?: number
    motionPr?: number
    issue?: number
    caseIds: readonly string[]
    lossBefore: number
    lossAfter: number
    expectedLossAfter?: number
    note: string
}

const source = (path: string, testName: string): UpstreamSource => ({
    repository: "motiondivision/motion",
    sourceVersion: "12.40.0",
    path,
    testName,
})

/**
 * One entry represents one reviewable upstream behavior, not one visual demo.
 * `partial` means that the behavior is executable on at least one Lynx target,
 * but evidence is narrower than upstream or exposes a platform divergence.
 */
export const CONFORMANCE_CASES: readonly ConformanceCase[] = [
    {
        id: "component/motion-create",
        category: "Components",
        title: "motion.create() custom host",
        summary: "Wrap a component that forwards Motion host props and styles.",
        status: "conformant",
        api: ["motion.create", "initial", "animate", "transition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/component.test.tsx",
            "renders custom component"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "custom component forwards host props and ref plumbing",
            "animate settles at opacity 1 and x 24",
            "no runtime or console errors",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { opacity: 1, translateX: 24 },
    },
    {
        id: "targets/reactive-animate",
        category: "Targets",
        title: "Reactive animate target",
        summary:
            "A subsequent render animates to the newly supplied object target.",
        status: "conformant",
        api: ["animate", "transition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "uses transition on subsequent renders"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "later target changes animate instead of jumping",
            "both renderers expose an intermediate frame before settling",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: -38, endX: 38 },
    },
    {
        id: "targets/unseen-property",
        category: "Targets",
        title: "New target property",
        summary:
            "A later target can introduce a previously unseen transform property while retaining existing values.",
        status: "conformant",
        api: ["animate", "dynamic target shape"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "animates previously unseen properties"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first target contains only x",
            "a later target introduces y and settles at its value",
            "the existing x transform is retained in both renderers",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { x: 20, startY: 0, endY: 30 },
    },
    {
        id: "targets/transition-end-subsequent",
        category: "Targets",
        title: "transitionEnd-only target",
        summary:
            "A later target containing only transitionEnd applies after its empty animation phase.",
        status: "conformant",
        api: ["animate", "transitionEnd", "onAnimationComplete"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "uses transitionEnd on subsequent renders"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the transitionEnd-only update applies its final opacity",
            "start and completion lifecycle fire once",
            "no stale transitionEnd overwrites a newer generation",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { opacity: 0.4 },
    },
    {
        id: "targets/removed-animate-original-initial",
        category: "Targets",
        title: "Removed target restores original initial",
        summary:
            "Removing a value from animate restores the value originally declared by initial.",
        status: "conformant",
        api: ["initial", "animate", "dynamic target shape"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "when value is removed from animate, animates back to value originally defined in initial prop"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: ["opacity restores from 1 to the original initial value"],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { opacity: 0 },
    },
    {
        id: "targets/removed-animate-current-initial",
        category: "Targets",
        title: "Removed target uses current initial",
        summary:
            "Removing a value from animate uses the initial value supplied by that render.",
        status: "conformant",
        api: ["initial", "animate", "dynamic target shape"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "when value is removed from animate, animates back to value currently defined in initial prop"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: ["opacity restores from 1 to the current initial value"],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { opacity: 0.5 },
    },
    {
        id: "targets/removed-animate-and-initial",
        category: "Targets",
        title: "Removed target retains current value",
        summary:
            "Removing a value from both animate and initial retains its live value without restarting it.",
        status: "conformant",
        api: ["initial", "animate", "MotionValue ownership"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "when value is removed from both animate and initial, perform no animation"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the last x value remains visible",
            "the stopped animation object is not serialized into later gesture snapshots",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { x: 24 },
    },
    {
        id: "targets/transform-origin",
        category: "Targets",
        title: "Transform-origin aliases",
        summary:
            "originX, originY, and originZ compose a typed transformOrigin on the first frame and later updates.",
        status: "conformant",
        api: ["originX", "originY", "originZ", "transformOrigin"],
        upstream: source(
            "packages/framer-motion/src/render/html/utils/__tests__/build-styles.test.ts",
            "Builds transformOrigin with correct default value types"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "numeric originX/originY values resolve as percentages",
            "the first initial snapshot includes transformOrigin",
            "a plain ReactLynx transformOrigin control follows the same host path",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { start: 0, end: 1 },
    },
    {
        id: "targets/complex-gradient",
        category: "Targets",
        title: "Complex gradient interpolation",
        summary:
            "A gradient angle produces intermediate frames through upstream complex-value mixing.",
        status: "conformant",
        api: ["backgroundImage", "complex value", "transition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "Correctly animates complex value types on first rerender"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "both renderers start at 120deg",
            "an intermediate angle is observable",
            "both renderers settle at 0deg",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startDeg: 120, endDeg: 0, sampleMs: 140 },
    },
    {
        id: "targets/display-reveal",
        category: "Targets",
        title: "Show, then fade in",
        summary:
            "A discrete display target switches from none to block before its opacity entrance continues.",
        status: "conformant",
        api: ["animate", "display", "opacity"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "animate display none => block immediately switches to block"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "display switches to block before the opacity entrance completes",
            "opacity exposes an intermediate entrance frame",
            "both renderers settle at full opacity",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { durationMs: 400, sampleMs: 120 },
    },
    {
        id: "targets/visibility-reveal",
        category: "Targets",
        title: "Reveal, then fade in",
        summary:
            "A discrete visibility target switches from hidden to visible before its opacity entrance continues.",
        status: "conformant",
        api: ["animate", "visibility", "opacity"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "animate visibility hidden => visible immediately switches to visible"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "visibility switches to visible before opacity entrance completes",
            "opacity exposes an intermediate entrance frame",
            "both renderers settle at full opacity",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { durationMs: 400, sampleMs: 120 },
    },
    {
        id: "targets/no-op",
        category: "Targets",
        title: "Equal target no-op",
        summary:
            "Equal initial and animate values return to idle without running a long animation.",
        status: "conformant",
        api: ["animate", "onAnimationStart", "onAnimationComplete"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "doesn't animate no-op values"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "equal opacity and transform targets do not remain active",
            "velocity and spring options do not force a no-op target to run",
            "both renderers report idle after two frames",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { settleMs: 100 },
    },
    {
        id: "targets/no-op-keyframes",
        category: "Targets",
        title: "Equal keyframe no-op",
        summary:
            "Equal keyframe arrays return to idle without starting a long animation.",
        status: "conformant",
        api: ["animate", "keyframes", "onAnimationStart"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "doesn't animate no-op keyframes"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "equal opacity and transform keyframe arrays do not remain active",
            "velocity and spring options do not force equal keyframes to run",
            "both renderers report idle after two frames",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { settleMs: 100 },
    },
    {
        id: "transitions/spring-velocity",
        category: "Transitions",
        title: "Spring velocity lifecycle",
        summary:
            "A non-zero spring velocity starts motion even when the target equals the origin.",
        status: "conformant",
        api: ["transition.type", "transition.velocity", "onAnimationStart"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "does animate no-op values if velocity is non-zero and animation type is spring"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "a spring with non-zero velocity starts for an equal target",
            "the lifecycle remains active after two post-render frames",
            "both renderers expose the same animation state",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { sampleMs: 0 },
    },
    {
        id: "targets/z-index-discrete",
        category: "Targets",
        title: "Discrete zIndex",
        summary:
            "zIndex applies at its target value without numeric interpolation.",
        status: "conformant",
        api: ["animate", "zIndex"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "doesn't animate zIndex"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "zIndex applies its target value on the first observable frame",
            "a long transition does not cause numeric zIndex interpolation",
            "both renderers expose z-index 100",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { target: 100 },
    },
    {
        id: "transitions/unknown-type-fallback",
        category: "Transitions",
        title: "Unknown type fallback",
        summary:
            "An unknown animation type falls back safely without crashing the declarative tree.",
        status: "conformant",
        api: ["transition.type", "fallback"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "doesn't error when provided unknown animation type"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "an unknown transition type does not throw a runtime error",
            "the declarative target remains mounted and visible",
            "both renderers preserve the tree",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
    },
    {
        id: "targets/zero-unit-normalization",
        category: "Targets",
        title: "Zero-unit normalization",
        summary:
            "A zero-valued CSS unit normalizes to an animatable numeric target.",
        status: "conformant",
        api: ["animate", "borderRadius", "value types"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "converts unseen zero unit types to number"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "borderRadius starts from a 0px style value",
            "the numeric target is normalized to the compatible pixel type",
            "both renderers settle at 20px",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { targetPx: 20 },
    },
    {
        id: "targets/css-custom-property",
        category: "Targets",
        title: "CSS custom property target",
        summary:
            "A previously unseen CSS custom property reaches its target through upstream motion-dom.",
        status: "partial",
        api: ["animate", "CSS custom properties", "MotionStyle"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "animates previously unseen CSS variables"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "typed --* keys build without an any cast in the Lynx consumer",
            "Web and Lynx-for-Web settle at --motion-color: #000 and consume it as a black background",
            "Android native keeps both the plain ReactLynx control and Motion target transparent",
        ],
        gap: "lynx-stack #3466 restores the motion-dom setProperty contract and types, but native ReactLynx drops static --* declarations and var() consumption before Motion runs; tracked in issue #57.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
    },
    {
        id: "transitions/repeat-loop-final",
        category: "Transitions",
        title: "Loop final keyframe",
        summary: "An odd finite loop repeat settles at the animation target.",
        status: "conformant",
        api: ["repeat", "repeatType", "repeatDelay", "keyframes"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "Correctly applies final keyframe with repeatType loop and odd numbered repeat"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the loop runs two forward iterations when repeat is one",
            "repeatDelay does not alter the terminal keyframe",
            "both renderers settle at x 20",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: 0, endX: 20, settleMs: 500 },
    },
    {
        id: "targets/keyframes",
        category: "Targets",
        title: "Value keyframes",
        summary:
            "Array keyframes resolve in order and settle at their final value.",
        status: "conformant",
        api: ["animate", "keyframes", "transition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/transition-keyframes.test.tsx",
            "keyframes as target"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "animation passes through a nonterminal keyframe",
            "animation settles at the final keyframe",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startY: 0, peakY: -34, endY: 12 },
    },
    {
        id: "targets/null-keyframe",
        category: "Targets",
        title: "Null keyframe hydration",
        summary:
            "A leading null keyframe resolves from the MotionValue's current value.",
        status: "conformant",
        api: ["animate", "keyframes", "null keyframe"],
        upstream: source(
            "packages/framer-motion/src/animation/animate/__tests__/animate.test.tsx",
            "correctly hydrates keyframes null with current MotionValue"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first sampled frame continues from the current value instead of a default origin",
            "the animation settles at the final keyframe",
            "both renderers expose the same hydration behavior",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startX: -42,
            endX: 42,
            durationMs: 600,
            firstSampleMs: 90,
            maximumFirstX: -20,
        },
    },
    {
        id: "transitions/keyframe-times",
        category: "Targets",
        title: "Keyframe times",
        summary:
            "Custom keyframe offsets preserve duplicate boundary times and their instantaneous jumps.",
        status: "conformant",
        api: ["transition.times"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/transition-keyframes.test.tsx",
            "times works as expected"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first changed frame starts at or beyond the second keyframe",
            "the final pre-completion frame stays at or before the third keyframe",
            "the animation settles at the final keyframe",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startX: -42,
            secondX: -14,
            thirdX: 14,
            endX: 42,
            durationMs: 800,
        },
    },
    {
        id: "transitions/default-fallback",
        category: "Targets",
        title: "Default transition fallback",
        summary:
            "The default transition is selected when no property-specific transition exists.",
        status: "conformant",
        api: ["transition.default"],
        upstream: source(
            "packages/framer-motion/src/animation/__tests__/get-value-transition.test.ts",
            "falls back to default key"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the default delay overrides an immediate top-level transition",
            "the value remains at its start during the default delay",
            "the animation settles at the final value in both renderers",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startX: -40,
            endX: 40,
            delayMs: 450,
            durationMs: 200,
            holdSampleMs: 250,
        },
    },
    {
        id: "transitions/manual-from",
        category: "Targets",
        title: "Manual transition start",
        summary:
            "transition.from overrides the current MotionValue when an animation starts.",
        status: "conformant",
        api: ["transition.from"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "transition accepts manual from value"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the update restarts from the explicit from value instead of the current value",
            "early samples progress from the manual start towards the target",
            "both renderers settle at the final target",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            initialX: 100,
            fromX: 0,
            endX: 50,
            durationMs: 800,
            earlySampleMs: 100,
            maximumEarlyX: 20,
        },
    },
    {
        id: "transitions/instant",
        category: "Targets",
        title: "Instant transition",
        summary:
            "transition.type false applies the next target without intermediate tween values.",
        status: "conformant",
        api: ["transition.type", "type: false"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "uses transition on subsequent renders"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the initial transform remains stable before the update",
            "the first changed frame is already the final target",
            "no intermediate tween values appear in either renderer",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: -40, endX: 40, sampleMs: 300 },
    },
    {
        id: "transitions/named-easing",
        category: "Targets",
        title: "Named easing",
        summary:
            "A named easeInOut curve changes intermediate sampling while preserving endpoints.",
        status: "conformant",
        api: ["transition.ease", 'ease="easeInOut"'],
        upstream: source(
            "packages/motion-utils/src/easing/utils/__tests__/map.test.ts",
            "Maps easing to lookup"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the named curve lags a simultaneous linear tween during its first half",
            "both curves preserve the same start and final values",
            "both renderers expose the same named-easing relationship",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startX: -42,
            endX: 42,
            durationMs: 800,
            minimumLinearLead: 6,
        },
    },
    {
        id: "transitions/easing-function-array",
        category: "Targets",
        title: "Easing function array",
        summary:
            "A distinct easing callback is invoked for each keyframe segment.",
        status: "blocked",
        api: ["transition.ease", "EasingFunction[]"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "keyframes - accepts ease as an array"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first segment invokes its easing callback",
            "the second segment invokes its easing callback",
            "both renderers settle at the final keyframe without runtime errors",
        ],
        gap: "Web invokes both callbacks; Lynx invokes neither while silently settling. Arbitrary nested callables need generic MTS/ReactLynx hydration and lifecycle support; tracked in issue #37.",
        evidence: {
            gallery: false,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "targets/transform-template",
        category: "Targets",
        title: "Transform template",
        summary:
            "A consumer callback composes custom transform text around Motion's generated transform.",
        status: "blocked",
        api: ["transformTemplate", "transform composition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "applies custom transform"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the callback receives the latest transform values",
            "the callback receives Motion's generated transform string",
            "Web, Lynx-for-Web, and native Lynx render translateY(30px) translateX(30px)",
        ],
        gap: "Web composes x/y as 30/30; immutable Lynx-for-Web and Android native render only x/y 30/0. Consumer closures need generic lifecycle-managed main-thread callable handles; tracked in issue #55.",
        evidence: {
            gallery: false,
            packageTest: false,
            dualRenderer: false,
            native: true,
        },
    },
    {
        id: "targets/style-motion-value",
        category: "Targets",
        title: "Live style MotionValue",
        summary:
            "A MotionValue bound through style updates the host directly without a React rerender.",
        status: "conformant",
        api: [
            "useMotionValue",
            "style={{ x: MotionValue }}",
            "MotionValue.set",
        ],
        upstream: source(
            "packages/framer-motion/src/value/__tests__/use-motion-value.test.tsx",
            "can be set manually"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the style starts at the MotionValue initial value",
            "a background MotionValue.set bridges to the main-thread value and updates transform directly",
            "the React render count stays unchanged",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: -36, endX: 36, renderCount: 1 },
    },
    {
        id: "targets/color-keyframes",
        category: "Targets",
        title: "Color keyframes",
        summary:
            "String color keyframes interpolate through the middle color and settle at the final color.",
        status: "conformant",
        api: ["backgroundColor", "keyframes", "color interpolation"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Performs a keyframes animations when to is an array of strings"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the sequence starts red",
            "intermediate samples are green-dominant",
            "the sequence settles blue",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
        expected: { startRed: 255, middleGreen: 255, endBlue: 255 },
    },
    {
        id: "targets/color-hsla-rgba",
        category: "Targets",
        title: "HSLA to RGBA",
        summary:
            "Color animation interpolates across HSLA and RGBA representations.",
        status: "conformant",
        api: ["backgroundColor", "HSLA", "RGBA", "color interpolation"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "Correctly animates from HSLA to RGB"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the animation starts from the HSLA color",
            "an intermediate sample is neither endpoint",
            "both renderers settle at rgba(0, 136, 255, 1)",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startRed: 255,
            startGreen: 51,
            startBlue: 102,
            endRed: 0,
            endGreen: 136,
            endBlue: 255,
            sampleMs: 120,
        },
    },
    {
        id: "transitions/spring",
        category: "Targets",
        title: "Underdamped spring",
        summary:
            "An explicit spring transition overshoots and settles at its target.",
        status: "conformant",
        api: ['transition.type="spring"', "stiffness", "damping"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Correctly animates spring"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the spring passes beyond its target",
            "the spring returns and settles at the target",
            "Web, Lynx-for-Web, and native Lynx reuse the same explicit spring transition",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
        expected: { startX: -46, endX: 46, minimumOvershootX: 50 },
    },
    {
        id: "transitions/delay",
        category: "Targets",
        title: "Positive delay",
        summary:
            "A positive transition delay holds the initial value before animation begins.",
        status: "conformant",
        api: ["transition.delay"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Accepts delay"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the target remains at its initial value during the delay",
            "the target moves only after the delay elapses",
            "the animation settles at its final value",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: -42, endX: 42, delayMs: 400 },
    },
    {
        id: "transitions/negative-delay",
        category: "Targets",
        title: "Negative delay",
        summary:
            "A negative transition delay starts partway through the animation as elapsed time.",
        status: "conformant",
        api: ["transition.delay < 0"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Accepts negative delay as elapsed"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first animated sample skips the nominal start",
            "the animation settles at its final value sooner than a full-duration tween",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startX: -42, endX: 42, delayMs: -200, durationMs: 400 },
    },
    {
        id: "transitions/repeat-infinity",
        category: "Targets",
        title: "Infinite repeat",
        summary:
            "Infinity survives serialization and remains live after the first duration.",
        status: "conformant",
        api: ["transition.repeat", "repeatType"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Correctly samples with infinite repeat"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "animation remains live after its first duration",
            "later samples continue to change on both renderers",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
        expected: { duration: 2 },
    },
    {
        id: "transitions/repeat-reverse",
        category: "Targets",
        title: "Reverse repeat",
        summary:
            "A finite reverse repeat reaches the target, returns, and settles at its origin.",
        status: "conformant",
        api: ["transition.repeat", 'repeatType="reverse"'],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Correctly applies repeat type 'reverse'"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first iteration reaches the target scale",
            "the reverse iteration returns toward the origin",
            "the animation settles at its starting scale",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { startScale: 1, peakScale: 1.35 },
    },
    {
        id: "transitions/repeat-mirror",
        category: "Targets",
        title: "Mirror repeat",
        summary:
            "A mirror repeat swaps keyframes while preserving the named easing direction on the return generator.",
        status: "conformant",
        api: ["transition.repeat", 'repeatType="mirror"'],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Correctly applies repeat type 'mirror'"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the outward first quarter remains near the start under easeIn",
            "the mirrored return first quarter remains near the outward endpoint",
            "the animation settles back at its starting value",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startX: -42,
            endX: 42,
            durationMs: 500,
            outwardQuarterMaximum: -20,
            returnQuarterMinimum: 20,
        },
    },
    {
        id: "transitions/repeat-delay",
        category: "Targets",
        title: "Repeat delay",
        summary:
            "A repeated tween holds its endpoint for repeatDelay before the next iteration begins.",
        status: "conformant",
        api: ["transition.repeatDelay"],
        upstream: source(
            "packages/motion-dom/src/animation/__tests__/JSAnimation.test.ts",
            "Correctly applies repeatDelay"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the first iteration reaches its endpoint",
            "the endpoint remains held throughout repeatDelay",
            "the next iteration restarts only after the hold",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            startScale: 1,
            endScale: 1.35,
            durationMs: 300,
            holdMs: 300,
        },
    },
    {
        id: "variants/named",
        category: "Variants",
        title: "Named variants",
        summary:
            "String labels resolve to local variant targets and transitions.",
        status: "conformant",
        api: ["variants", "initial", "animate"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/variant.test.tsx",
            "animates to set variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "rest and active labels resolve to the expected local targets",
            "a changed string label uses the target-owned transition",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            restX: -30,
            activeX: 30,
            restOpacity: 0.5,
            activeOpacity: 1,
            activeScale: 1.1,
        },
    },
    {
        id: "variants/function-custom",
        category: "Variants",
        title: "Function variant + custom",
        summary:
            "Function variants receive custom and return target-local transitions.",
        status: "conformant",
        api: ["variants", "custom", "transition"],
        upstream: source(
            "packages/framer-motion/src/render/utils/__tests__/variants.test.ts",
            "Resolves function that returns object"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "each custom index resolves a distinct delay",
            "all resolved targets settle at the same visible state",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            count: 4,
            delayStep: 0.12,
            visibleOpacity: 1,
            visibleScale: 1,
        },
    },
    {
        id: "gestures/tap",
        category: "Gestures",
        title: "Tap gesture",
        summary:
            "whileTap applies during a platform press, fires callbacks, then restores rest.",
        status: "conformant",
        api: ["whileTap", "onTapStart", "onTap", "onTapCancel"],
        upstream: source(
            "packages/framer-motion/src/gestures/__tests__/press.test.tsx",
            "press gesture variant applies and unapplies"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "Lynx touch and Web pointer holds apply the tap target",
            "platform press release restores the rest target",
            "native touch applies and releases the tap target",
            "tap callbacks report one completed press",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
        expected: { restScale: 1, tapScale: 1.15 },
    },
    {
        id: "gestures/hover",
        category: "Gestures",
        title: "Hover gesture",
        summary: "Mouse-capable clients apply and remove a named hover target.",
        status: "conformant",
        api: ["whileHover", "onHoverStart", "onHoverEnd"],
        upstream: source(
            "packages/framer-motion/src/gestures/__tests__/hover.test.tsx",
            "whileHover applied as variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "pointer enter applies the named hover target",
            "hover callbacks report one entry",
            "pointer exit restores the rest target",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { restScale: 1, hoverScale: 1.08 },
    },
    {
        id: "gestures/transition-end-only",
        category: "Gestures",
        title: "transitionEnd-only tap target",
        summary:
            "A gesture target containing only transitionEnd applies while pressed and restores the base target on release.",
        status: "conformant",
        api: ["whileTap", "transitionEnd", "onAnimationStart"],
        upstream: source(
            "packages/framer-motion/src/render/utils/__tests__/animation-state.test.ts",
            "Swap between value in target and transitionEnd, target"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "press applies the transitionEnd value",
            "gesture lifecycle reports the pressed definition",
            "release restores the lower-priority base target",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: { restOpacity: 1, pressedOpacity: 0.4 },
    },
    {
        id: "lifecycle/tap-animation",
        category: "Lifecycle",
        title: "Tap animation lifecycle",
        summary:
            "Press and release report the active and restored variant definitions in order.",
        status: "conformant",
        api: ["whileTap", "onAnimationStart", "onAnimationComplete"],
        upstream: source(
            "packages/framer-motion/src/gestures/__tests__/press.test.tsx",
            "press gesture variant applies and unapplies"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "press start and completion report the pressed definition",
            "release start and completion report the restored definition",
            "interrupted press targets do not report stale completion",
            "no runtime or snapshot serialization errors",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expectedDefinitions: {
            pressed: "pressed",
            rest: "rest",
            hover: "hover",
        },
    },
    {
        id: "lifecycle/base-animate",
        category: "Lifecycle",
        title: "Base animation lifecycle",
        summary:
            "The base animate target reports start and completion definitions.",
        status: "conformant",
        api: ["onAnimationStart", "onAnimationComplete"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "fires onAnimationStart when animation begins"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "start reports definition",
            "complete reports the same definition",
            "start is observed before completion",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: true,
        },
        expectedDefinition: "visible",
    },
    {
        id: "initial/false",
        category: "Targets",
        title: "initial={false}",
        summary: "Render the final animate keyframe without a mount animation.",
        status: "conformant",
        api: ["initial={false}"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "mount animation doesn't run if `initial={false}`"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "first frame is final animate state",
            "later target updates still animate",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
    },
    {
        id: "initial/false-propagation",
        category: "Variants",
        title: "Inherited initial={false}",
        summary:
            "Suppress mount animations for descendants that inherit a parent's animate label.",
        status: "conformant",
        api: ["initial={false}", "variants", "inheritance"],
        upstream: source(
            "packages/framer-motion/src/context/MotionContext/__tests__/utils.test.ts",
            "getCurrentTreeVariants preserves initial false for descendants"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the parent publishes initial false in variant context",
            "the inherited child renders its final animate keyframe on the first frame",
            "no intermediate hidden target is observed",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            opacity: 1,
            x: 24,
        },
    },
    {
        id: "variants/propagation",
        category: "Variants",
        title: "Base variant label propagation",
        summary:
            "Children inherit a parent's declarative initial and animate labels.",
        status: "conformant",
        api: ["variants", "initial", "animate", "inheritance"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/variant.test.tsx",
            "child animates to set variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "a child inherits the parent's base animate label",
            "a reactive parent label update reaches the child",
            "an explicit child animate prop overrides the inherited label",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            hiddenOpacity: 0.25,
            hiddenX: -24,
            visibleOpacity: 1,
            visibleX: 24,
        },
    },
    {
        id: "variants/orchestration",
        category: "Variants",
        title: "Variant orchestration + controls",
        summary:
            "Coordinate descendant variants through timing, controls, and gesture state.",
        status: "blocked",
        api: [
            "animation controls",
            "gesture propagation",
            "when",
            "dynamic delayChildren",
            "staggerChildren",
        ],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/variant.test.tsx",
            "when: beforeChildren works correctly"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "parent and child timing honors when",
            "dynamic delayChildren and staggerChildren order descendants",
            "controls and gesture labels propagate through the subtree",
        ],
        gap: "Requires a cross-thread visual-element registry and subtree lifecycle aggregation; tracked in issue #10.",
        evidence: {
            gallery: false,
            packageTest: false,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "variants/delay-children",
        category: "Variants",
        title: "Numeric delayChildren",
        summary:
            "Delay an inherited child variant without introducing a second animation engine.",
        status: "conformant",
        api: ["variants", "inheritance", "delayChildren"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/delay.test.tsx",
            "in variant children via delayChildren"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the inherited child remains at its initial target during the numeric delay",
            "the child settles at the inherited animate target after the delay",
            "nested uncontrolled descendants accumulate delayChildren",
            "an explicit child animate prop starts a new timing owner",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            delayMs: 350,
            holdMs: 150,
            hiddenOpacity: 0,
            hiddenX: -24,
            visibleOpacity: 1,
            visibleX: 24,
        },
    },
    {
        id: "variants/inherit-opt-out",
        category: "Variants",
        title: "Variant inheritance opt-out",
        summary:
            "Stop inherited initial and animate labels at an explicit variant boundary.",
        status: "conformant",
        api: ["variants", "inherit={false}", "inheritance"],
        upstream: source(
            "packages/framer-motion/src/context/MotionContext/__tests__/utils.test.ts",
            "getCurrentTreeVariants returns no inherited labels when inherit is false"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "the boundary publishes no inherited initial label",
            "a descendant keeps its own static style instead of resolving the parent label",
            "the inherit prop is not forwarded to the Lynx host element",
        ],
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: true,
            native: false,
        },
        expected: {
            opacity: 0.5,
            x: 10,
        },
    },
    {
        id: "presence/exit",
        category: "Layout & presence",
        title: "Exit + AnimatePresence",
        summary:
            "Exiting elements remain mounted until their exit animation completes.",
        status: "blocked",
        api: ["exit", "AnimatePresence"],
        upstream: source(
            "packages/framer-motion/src/components/AnimatePresence/__tests__/AnimatePresence.test.tsx",
            "Suppresses initial animation if `initial={false}`"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "exit target runs before removal",
            "presence completion releases the child",
        ],
        gap: "The React DOM presence tree has no Lynx host integration yet.",
        evidence: {
            gallery: false,
            packageTest: false,
            dualRenderer: false,
            native: false,
        },
    },
]

export const MOTION_CREATE_CASE = CONFORMANCE_CASES[0] as ConformanceCase & {
    expected: { opacity: number; translateX: number }
}

export const REACTIVE_ANIMATE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/reactive-animate"
) as ConformanceCase & {
    expected: { startX: number; endX: number }
}

export const UNSEEN_PROPERTY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/unseen-property"
) as ConformanceCase & {
    expected: { x: number; startY: number; endY: number }
}

export const TRANSITION_END_SUBSEQUENT_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/transition-end-subsequent"
) as ConformanceCase & { expected: { opacity: number } }

export const REMOVED_ANIMATE_ORIGINAL_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/removed-animate-original-initial"
) as ConformanceCase & { expected: { opacity: number } }

export const REMOVED_ANIMATE_CURRENT_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/removed-animate-current-initial"
) as ConformanceCase & { expected: { opacity: number } }

export const REMOVED_ANIMATE_RETAIN_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/removed-animate-and-initial"
) as ConformanceCase & { expected: { x: number } }

export const TRANSFORM_ORIGIN_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/transform-origin"
) as ConformanceCase & { expected: { start: number; end: number } }

export const COMPLEX_GRADIENT_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/complex-gradient"
) as ConformanceCase & {
    expected: { startDeg: number; endDeg: number; sampleMs: number }
}

export const DISPLAY_REVEAL_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/display-reveal"
) as ConformanceCase & {
    expected: { durationMs: number; sampleMs: number }
}

export const VISIBILITY_REVEAL_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/visibility-reveal"
) as ConformanceCase & {
    expected: { durationMs: number; sampleMs: number }
}

export const NO_OP_TARGET_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/no-op"
) as ConformanceCase & { expected: { settleMs: number } }

export const NO_OP_KEYFRAMES_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/no-op-keyframes"
) as ConformanceCase & { expected: { settleMs: number } }

export const SPRING_VELOCITY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/spring-velocity"
) as ConformanceCase & { expected: { sampleMs: number } }

export const Z_INDEX_DISCRETE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/z-index-discrete"
) as ConformanceCase & { expected: { target: number } }

export const UNKNOWN_TYPE_FALLBACK_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/unknown-type-fallback"
) as ConformanceCase

export const ZERO_UNIT_NORMALIZATION_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/zero-unit-normalization"
) as ConformanceCase & { expected: { targetPx: number } }

export const CSS_CUSTOM_PROPERTY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/css-custom-property"
) as ConformanceCase

export const REPEAT_LOOP_FINAL_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/repeat-loop-final"
) as ConformanceCase & {
    expected: { startX: number; endX: number; settleMs: number }
}

export const KEYFRAMES_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/keyframes"
) as ConformanceCase & {
    expected: { startY: number; peakY: number; endY: number }
}

export const NULL_KEYFRAME_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/null-keyframe"
) as ConformanceCase & {
    expected: {
        startX: number
        endX: number
        durationMs: number
        firstSampleMs: number
        maximumFirstX: number
    }
}

export const KEYFRAME_TIMES_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/keyframe-times"
) as ConformanceCase & {
    expected: {
        startX: number
        secondX: number
        thirdX: number
        endX: number
        durationMs: number
    }
}

export const DEFAULT_TRANSITION_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/default-fallback"
) as ConformanceCase & {
    expected: {
        startX: number
        endX: number
        delayMs: number
        durationMs: number
        holdSampleMs: number
    }
}

export const TRANSITION_FROM_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/manual-from"
) as ConformanceCase & {
    expected: {
        initialX: number
        fromX: number
        endX: number
        durationMs: number
        earlySampleMs: number
        maximumEarlyX: number
    }
}

export const INSTANT_TRANSITION_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/instant"
) as ConformanceCase & {
    expected: { startX: number; endX: number; sampleMs: number }
}

export const NAMED_EASING_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/named-easing"
) as ConformanceCase & {
    expected: {
        startX: number
        endX: number
        durationMs: number
        minimumLinearLead: number
    }
}

export const STYLE_MOTION_VALUE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/style-motion-value"
) as ConformanceCase & {
    expected: { startX: number; endX: number; renderCount: number }
}

export const COLOR_KEYFRAMES_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/color-keyframes"
) as ConformanceCase & {
    expected: { startRed: number; middleGreen: number; endBlue: number }
}

export const COLOR_HSLA_RGBA_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "targets/color-hsla-rgba"
) as ConformanceCase & {
    expected: {
        startRed: number
        startGreen: number
        startBlue: number
        endRed: number
        endGreen: number
        endBlue: number
        sampleMs: number
    }
}

export const SPRING_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/spring"
) as ConformanceCase & {
    expected: { startX: number; endX: number; minimumOvershootX: number }
}

export const DELAY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/delay"
) as ConformanceCase & {
    expected: { startX: number; endX: number; delayMs: number }
}

export const NEGATIVE_DELAY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/negative-delay"
) as ConformanceCase & {
    expected: {
        startX: number
        endX: number
        delayMs: number
        durationMs: number
    }
}

export const REPEAT_INFINITY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/repeat-infinity"
) as ConformanceCase & { expected: { duration: number } }

export const REPEAT_REVERSE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/repeat-reverse"
) as ConformanceCase & {
    expected: { startScale: number; peakScale: number }
}

export const REPEAT_MIRROR_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/repeat-mirror"
) as ConformanceCase & {
    expected: {
        startX: number
        endX: number
        durationMs: number
        outwardQuarterMaximum: number
        returnQuarterMinimum: number
    }
}

export const REPEAT_DELAY_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "transitions/repeat-delay"
) as ConformanceCase & {
    expected: {
        startScale: number
        endScale: number
        durationMs: number
        holdMs: number
    }
}

export const TAP_GESTURE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "gestures/tap"
) as ConformanceCase & {
    expected: { restScale: number; tapScale: number }
}

export const HOVER_GESTURE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "gestures/hover"
) as ConformanceCase & {
    expected: { restScale: number; hoverScale: number }
}

export const GESTURE_TRANSITION_END_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "gestures/transition-end-only"
) as ConformanceCase & {
    expected: { restOpacity: number; pressedOpacity: number }
}

export const NAMED_VARIANTS_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "variants/named"
) as ConformanceCase & {
    expected: {
        restX: number
        activeX: number
        restOpacity: number
        activeOpacity: number
        activeScale: number
    }
}

export const FUNCTION_VARIANTS_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "variants/function-custom"
) as ConformanceCase & {
    expected: {
        count: number
        delayStep: number
        visibleOpacity: number
        visibleScale: number
    }
}

export const ANIMATION_LIFECYCLE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "lifecycle/base-animate"
) as ConformanceCase & { expectedDefinition: string }

export const TAP_ANIMATION_LIFECYCLE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "lifecycle/tap-animation"
) as ConformanceCase & {
    expectedDefinitions: { pressed: string; rest: string; hover: string }
}

export const INITIAL_FALSE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "initial/false"
) as ConformanceCase

export const INITIAL_FALSE_PROPAGATION_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "initial/false-propagation"
) as ConformanceCase & {
    expected: { opacity: number; x: number }
}

export const VARIANT_PROPAGATION_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "variants/propagation"
) as ConformanceCase & {
    expected: {
        hiddenOpacity: number
        hiddenX: number
        visibleOpacity: number
        visibleX: number
    }
}

export const DELAY_CHILDREN_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "variants/delay-children"
) as ConformanceCase & {
    expected: {
        delayMs: number
        holdMs: number
        hiddenOpacity: number
        hiddenX: number
        visibleOpacity: number
        visibleX: number
    }
}

export const VARIANT_INHERIT_OPT_OUT_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "variants/inherit-opt-out"
) as ConformanceCase & {
    expected: { opacity: number; x: number }
}

export const GALLERY_EXAMPLES: readonly GalleryExample[] = [
    {
        id: "custom-host",
        title: "Custom host",
        summary: "motion.create forwards and animates a custom component.",
        api: ["motion.create", "initial", "animate"],
        evidence: "dual-renderer",
    },
    {
        id: "reactive-target",
        title: "Reactive target",
        summary: "Tap to drive a later animate target update.",
        api: ["animate", "transition"],
        evidence: "dual-renderer",
    },
    {
        id: "initial-false",
        title: "No mount animation",
        summary:
            "Render the final keyframe immediately, then animate later target changes.",
        api: ["initial={false}", "keyframes", "onAnimationStart"],
        evidence: "dual-renderer",
    },
    {
        id: "unseen-property",
        title: "New target property",
        summary: "Introduce y on a later target while retaining x.",
        api: ["animate", "dynamic target shape"],
        evidence: "dual-renderer",
    },
    {
        id: "noop-target",
        title: "Equal target no-op",
        summary: "Equal targets return to idle without a long animation.",
        api: ["animate", "onAnimationComplete"],
        evidence: "dual-renderer",
    },
    {
        id: "noop-keyframes",
        title: "Equal keyframe no-op",
        summary: "Equal keyframe arrays remain idle instead of running.",
        api: ["animate", "keyframes", "onAnimationStart"],
        evidence: "dual-renderer",
    },
    {
        id: "spring-velocity",
        title: "Spring velocity lifecycle",
        summary: "Non-zero velocity starts a spring for an equal target.",
        api: ["transition.type", "transition.velocity"],
        evidence: "dual-renderer",
    },
    {
        id: "z-index-discrete",
        title: "Discrete zIndex",
        summary: "zIndex applies directly instead of interpolating.",
        api: ["animate", "zIndex"],
        evidence: "dual-renderer",
    },
    {
        id: "unknown-type-fallback",
        title: "Unknown type fallback",
        summary: "Unknown transition types do not crash the tree.",
        api: ["transition.type", "fallback"],
        evidence: "dual-renderer",
    },
    {
        id: "zero-unit-normalization",
        title: "Zero-unit normalization",
        summary: "Normalize 0px to a compatible numeric target.",
        api: ["borderRadius", "value types"],
        evidence: "dual-renderer",
    },
    {
        id: "css-variable",
        title: "CSS custom property",
        summary:
            "Animate a typed design token on Web/Lynx-for-Web while exposing the native host gap.",
        api: ["animate", "--*", "var()"],
        evidence: "dual-renderer",
    },
    {
        id: "repeat-loop-final",
        title: "Loop final keyframe",
        summary: "An odd finite loop settles at its target.",
        api: ["repeat", "repeatType: loop", "repeatDelay"],
        evidence: "dual-renderer",
    },
    {
        id: "named-variants",
        title: "Named variants",
        summary:
            "Switch string labels and use the transition declared by the resolved target.",
        api: ["variants", "initial", "animate"],
        evidence: "dual-renderer",
    },
    {
        id: "gesture-priority",
        title: "Gesture priority",
        summary: "Hover, press, callback telemetry, and state restoration.",
        api: ["variants", "whileHover", "whileTap", "onTap"],
        evidence: "dual-renderer",
    },
    {
        id: "array-variants",
        title: "Array variants",
        summary: "Multiple labels merge from left to right.",
        api: ["variants", "animate: string[]"],
        evidence: "lynx-e2e",
    },
    {
        id: "repeat-infinity",
        title: "Infinite repeat",
        summary: "Infinity survives the Lynx worklet boundary.",
        api: ["repeat: Infinity", "rotate"],
        evidence: "dual-renderer",
    },
    {
        id: "keyframes",
        title: "Keyframes",
        summary: "Transform keyframes remain live across iterations.",
        api: ["keyframes", "repeat"],
        evidence: "dual-renderer",
    },
    {
        id: "null-keyframe",
        title: "Null keyframe",
        summary: "Start a keyframe animation from its current live value.",
        api: ["keyframes", "[null, value]"],
        evidence: "dual-renderer",
    },
    {
        id: "keyframe-times",
        title: "Keyframe times",
        summary: "Custom offsets preserve duplicate-time boundary jumps.",
        api: ["transition.times"],
        evidence: "dual-renderer",
    },
    {
        id: "default-transition",
        title: "Default transition",
        summary:
            "Use transition.default when no property-specific override exists.",
        api: ["transition.default"],
        evidence: "dual-renderer",
    },
    {
        id: "transition-from",
        title: "Manual transition start",
        summary: "Override the current value with transition.from.",
        api: ["transition.from"],
        evidence: "dual-renderer",
    },
    {
        id: "instant-transition",
        title: "Instant transition",
        summary: "Apply a new target without intermediate tween values.",
        api: ["transition.type", "type: false"],
        evidence: "dual-renderer",
    },
    {
        id: "named-easing",
        title: "Named easing",
        summary: "Compare easeInOut sampling with a simultaneous linear tween.",
        api: ["transition.ease", "easeInOut"],
        evidence: "dual-renderer",
    },
    {
        id: "style-motion-value",
        title: "Live MotionValue",
        summary: "A style-bound MotionValue updates without a React rerender.",
        api: ["useMotionValue", "style={{ x }}", "x.set"],
        evidence: "dual-renderer",
    },
    {
        id: "spring",
        title: "Spring",
        summary: "An underdamped upstream spring overshoots, then settles.",
        api: ["type: spring", "stiffness", "damping"],
        evidence: "dual-renderer",
    },
    {
        id: "transition-delay",
        title: "Delay",
        summary: "A positive delay holds the initial value before movement.",
        api: ["transition.delay"],
        evidence: "dual-renderer",
    },
    {
        id: "transition-negative-delay",
        title: "Negative delay",
        summary: "Elapsed time starts a tween partway through its timeline.",
        api: ["transition.delay < 0"],
        evidence: "dual-renderer",
    },
    {
        id: "repeat-reverse",
        title: "Reverse",
        summary: "Reverse repeat preserves scale endpoints.",
        api: ["repeatType: reverse"],
        evidence: "dual-renderer",
    },
    {
        id: "repeat-mirror",
        title: "Mirror",
        summary:
            "Mirror repeat swaps endpoints without reversing its easing curve.",
        api: ["repeatType: mirror", "easeIn"],
        evidence: "dual-renderer",
    },
    {
        id: "repeat-delay",
        title: "Repeat delay",
        summary: "A repeated tween pauses at its endpoint between iterations.",
        api: ["repeatDelay"],
        evidence: "dual-renderer",
    },
    {
        id: "color-keyframes",
        title: "Color mixer",
        summary: "Upstream color interpolation drives Lynx styles.",
        api: ["backgroundColor", "keyframes"],
        evidence: "dual-renderer",
    },
    {
        id: "color-hsla-rgba",
        title: "HSLA to RGBA",
        summary: "Interpolate between common color representations.",
        api: ["backgroundColor", "HSLA", "RGBA"],
        evidence: "dual-renderer",
    },
    {
        id: "function-variant",
        title: "Function variants",
        summary: "custom values resolve target-local delay and lifecycle.",
        api: ["variants", "custom", "onAnimationComplete"],
        evidence: "dual-renderer",
    },
]

export const ATOMIC_CAPABILITIES: readonly AtomicCapability[] = [
    {
        id: "motion-view",
        group: "Components",
        api: "motion.view",
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Built-in animated Lynx view host.",
        exampleId: "reactive-target",
    },
    {
        id: "motion-text",
        group: "Components",
        api: "motion.text",
        status: "supported",
        evidence: "package-test",
        contract: "Built-in animated Lynx text host.",
    },
    {
        id: "motion-image",
        group: "Components",
        api: "motion.image",
        status: "supported",
        evidence: "package-test",
        contract: "Built-in animated Lynx image host.",
    },
    {
        id: "motion-create",
        group: "Components",
        api: "motion.create(Component)",
        status: "partial",
        evidence: "dual-renderer",
        contract:
            "Wrap a component that forwards host props and main-thread ref.",
        boundary:
            "React children on a custom host currently reproduce a circular Lynx-for-Web patch payload.",
        exampleId: "custom-host",
    },
    {
        id: "initial-object",
        group: "Targets",
        api: "initial={{…}}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Render the starting object target.",
    },
    {
        id: "initial-false",
        group: "Targets",
        api: "initial={false}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Skip the mount animation and render the final keyframe.",
        exampleId: "initial-false",
    },
    {
        id: "initial-false-propagation",
        group: "Variants",
        api: "parent initial={false}",
        status: "supported",
        evidence: "dual-renderer",
        contract:
            "Suppress mount animations for descendants that inherit the parent's animate label.",
        exampleId: "initial-false-propagation",
    },
    {
        id: "animate-object",
        group: "Targets",
        api: "animate={{…}}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Animate to an object target.",
    },
    {
        id: "animate-reactive",
        group: "Targets",
        api: "animate updates",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Animate when the target changes after mount.",
        exampleId: "reactive-target",
    },
    {
        id: "animate-unseen-property",
        group: "Targets",
        api: "dynamic animate keys",
        status: "supported",
        evidence: "dual-renderer",
        contract:
            "Create MotionValues for properties introduced by later targets.",
        exampleId: "unseen-property",
    },
    {
        id: "css-custom-properties",
        group: "Targets",
        api: "style/animate {{ '--*': value }}",
        status: "partial",
        evidence: "dual-renderer",
        contract:
            "Animate typed CSS custom properties through motion-dom setProperty.",
        boundary:
            "Web and Lynx-for-Web conform on immutable 9aff526; native ReactLynx drops the same static custom property and var() control before Motion runs (issue #57).",
        exampleId: "css-variable",
    },
    {
        id: "animate-noop",
        group: "Targets",
        api: "equal animate targets",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Avoid keeping an animation active for unchanged values.",
        exampleId: "noop-target",
    },
    {
        id: "style-motion-value",
        group: "Targets",
        api: "style={{ value: MotionValue }}",
        status: "supported",
        evidence: "package-test",
        contract: "Bind upstream MotionValues to Lynx styles.",
    },
    {
        id: "transform-template",
        group: "Targets",
        api: "transformTemplate",
        status: "blocked",
        evidence: "planned",
        contract:
            "Compose consumer transform text around Motion's generated transform each frame.",
        boundary:
            "Consumer closures are not lifecycle-managed callables in the main-thread declarative style path; tracked in issue #55.",
    },
    {
        id: "keyframes",
        group: "Targets",
        api: "animate={{ x: […] }}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Animate scalar, transform, and color keyframes.",
        exampleId: "keyframes",
    },
    {
        id: "null-keyframe",
        group: "Targets",
        api: "animate={{ x: [null, value] }}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Hydrate a leading null keyframe from the current value.",
        exampleId: "null-keyframe",
    },
    {
        id: "transition",
        group: "Targets",
        api: "transition",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Reuse upstream tween/spring transition options.",
    },
    {
        id: "transition-default",
        group: "Targets",
        api: "transition.default",
        status: "supported",
        evidence: "dual-renderer",
        contract:
            "Use default options when no value-specific transition exists.",
        exampleId: "default-transition",
    },
    {
        id: "transition-from",
        group: "Targets",
        api: "transition.from",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Override the current value used to start an animation.",
        exampleId: "transition-from",
    },
    {
        id: "transition-instant",
        group: "Targets",
        api: "transition={{ type: false }}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Apply the next target without generating tween frames.",
        exampleId: "instant-transition",
    },
    {
        id: "repeat",
        group: "Targets",
        api: "repeat / repeatType",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Loop and reverse animations, including Infinity.",
        exampleId: "repeat-infinity",
    },
    {
        id: "variants-string",
        group: "Variants",
        api: 'animate="label"',
        status: "supported",
        evidence: "dual-renderer",
        contract: "Resolve local named variants.",
        exampleId: "gesture-priority",
    },
    {
        id: "variants-array",
        group: "Variants",
        api: 'animate={["a", "b"]}',
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Merge local variant labels left to right.",
        exampleId: "array-variants",
    },
    {
        id: "variants-function",
        group: "Variants",
        api: "variants={{ visible: custom => … }}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Resolve function variants on the background thread.",
        exampleId: "function-variant",
    },
    {
        id: "custom",
        group: "Variants",
        api: "custom",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Supply the argument for a function variant.",
        exampleId: "function-variant",
    },
    {
        id: "target-transition",
        group: "Variants",
        api: "variant.transition",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Prefer transition options owned by the resolved target.",
    },
    {
        id: "variant-propagation",
        group: "Variants",
        api: "variant propagation",
        status: "supported",
        evidence: "dual-renderer",
        contract:
            "Inherit declarative initial and animate labels through descendant Motion components.",
        exampleId: "variant-propagation",
    },
    {
        id: "variant-delay-children",
        group: "Variants",
        api: "delayChildren: number",
        status: "supported",
        evidence: "dual-renderer",
        contract:
            "Delay inherited child variants while preserving each child's upstream MotionValue animation path.",
        exampleId: "delay-children",
    },
    {
        id: "variant-inherit-opt-out",
        group: "Variants",
        api: "inherit={false}",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Stop inherited labels at an explicit variant boundary.",
        exampleId: "variant-inherit-opt-out",
    },
    {
        id: "variant-orchestration",
        group: "Variants",
        api: "dynamic delayChildren / staggerChildren / when",
        status: "blocked",
        evidence: "planned",
        contract: "Orchestrate descendant animations.",
        boundary:
            "The Gallery custom-delay example is not parent/child stagger orchestration.",
    },
    {
        id: "while-tap",
        group: "Gestures",
        api: "whileTap",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Apply the tap target while pressed.",
        exampleId: "gesture-priority",
    },
    {
        id: "tap-callbacks",
        group: "Gestures",
        api: "onTapStart / onTap / onTapCancel",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Report press lifecycle and pointer coordinates.",
        exampleId: "gesture-priority",
    },
    {
        id: "while-hover",
        group: "Gestures",
        api: "whileHover",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Apply a hover target on mouse-capable clients.",
        boundary:
            "Not available on touch-only clients and not identical to DOM pointer filtering.",
        exampleId: "gesture-priority",
    },
    {
        id: "hover-callbacks",
        group: "Gestures",
        api: "onHoverStart / onHoverEnd",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Report hover entry and exit on mouse-capable clients.",
        boundary: "Platform-scoped to clients with hover input.",
    },
    {
        id: "focus",
        group: "Gestures",
        api: "whileFocus",
        status: "blocked",
        evidence: "planned",
        contract: "Drive animation from focus state.",
        boundary: "Needs Lynx focus primitives and accessibility mapping.",
    },
    {
        id: "in-view",
        group: "Gestures",
        api: "whileInView",
        status: "blocked",
        evidence: "planned",
        contract: "Drive animation from viewport intersection.",
        boundary: "Needs a Lynx intersection observer adapter.",
    },
    {
        id: "drag",
        group: "Gestures",
        api: "drag / whileDrag",
        status: "blocked",
        evidence: "planned",
        contract: "Track drag gestures, constraints, and velocity.",
        boundary: "DOM pan/drag observers cannot be reused unchanged.",
    },
    {
        id: "animation-lifecycle",
        group: "Lifecycle",
        api: "onAnimationStart / onAnimationComplete",
        status: "supported",
        evidence: "dual-renderer",
        contract: "Report base and tap animation target lifecycle.",
        exampleId: "function-variant",
    },
    {
        id: "animation-controls",
        group: "Lifecycle",
        api: "AnimationControls",
        status: "blocked",
        evidence: "planned",
        contract: "Imperatively start declarative component targets.",
        boundary: "No declarative controls bridge exists.",
    },
    {
        id: "layout",
        group: "Layout & presence",
        api: "layout / layoutId",
        status: "blocked",
        evidence: "planned",
        contract: "Measure and animate layout deltas.",
        boundary:
            "Requires Lynx layout measurement and projection integration.",
    },
    {
        id: "presence",
        group: "Layout & presence",
        api: "exit / AnimatePresence",
        status: "blocked",
        evidence: "planned",
        contract: "Keep exiting children alive until animation completion.",
        boundary: "No Lynx presence tree integration exists.",
    },
    {
        id: "consumer-composition",
        group: "Composition",
        api: "consumer refs / host handlers",
        status: "partial",
        evidence: "package-test",
        contract: "Compose Motion-owned refs and handlers with consumer props.",
        boundary:
            "Parent rerenders can invalidate main-thread gesture entry bindings on Lynx-for-Web; consumer ref/handler composition is also pending in issue #6.",
    },
]

export const API_METRICS = {
    total: ATOMIC_CAPABILITIES.length,
    supported: ATOMIC_CAPABILITIES.filter((item) => item.status === "supported")
        .length,
    partial: ATOMIC_CAPABILITIES.filter((item) => item.status === "partial")
        .length,
    blocked: ATOMIC_CAPABILITIES.filter((item) => item.status === "blocked")
        .length,
}

export const CONFORMANCE_METRICS = {
    tracked: CONFORMANCE_CASES.length,
    conformant: CONFORMANCE_CASES.filter((item) => item.status === "conformant")
        .length,
    partial: CONFORMANCE_CASES.filter((item) => item.status === "partial")
        .length,
    blocked: CONFORMANCE_CASES.filter((item) => item.status === "blocked")
        .length,
    gallery: CONFORMANCE_CASES.filter((item) => item.evidence.gallery).length,
    dualRenderer: CONFORMANCE_CASES.filter((item) => item.evidence.dualRenderer)
        .length,
    native: CONFORMANCE_CASES.filter((item) => item.evidence.native).length,
}

/**
 * Selection score = remaining semantic loss × platform fit ÷ layer effort.
 * It favors important, unresolved contracts that fit Lynx without hiding
 * expensive architecture work. The five input dimensions remain visible so
 * reviewers can challenge the ranking instead of trusting one opaque number.
 */
export const CONFORMANCE_PRIORITIES: readonly GapPriority[] = [
    {
        caseId: "component/motion-create",
        importance: 4,
        platformFit: 4,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale: "Core factory already has exact dual-renderer evidence.",
    },
    {
        caseId: "targets/reactive-animate",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Core target update with exact timing proof and no host-specific adaptation.",
    },
    {
        caseId: "targets/unseen-property",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common dynamic target shape is created through upstream MotionValues with no platform-specific path.",
    },
    {
        caseId: "targets/transition-end-subsequent",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common exit/cleanup primitive now preserves lifecycle and generation ownership without a host-specific animation engine.",
    },
    {
        caseId: "targets/removed-animate-original-initial",
        importance: 4,
        platformFit: 5,
        mts: 2,
        reactLynx: 0,
        css: 0,
        rationale:
            "Dynamic target ownership is resolved in the adapter while retaining upstream MotionValues.",
    },
    {
        caseId: "targets/removed-animate-current-initial",
        importance: 4,
        platformFit: 5,
        mts: 2,
        reactLynx: 0,
        css: 0,
        rationale:
            "The latest declarative initial value can be restored without a ReactLynx or host change.",
    },
    {
        caseId: "targets/removed-animate-and-initial",
        importance: 4,
        platformFit: 5,
        mts: 2,
        reactLynx: 0,
        css: 0,
        rationale:
            "A fresh upstream MotionValue snapshot retains the scalar while keeping animation internals out of cross-thread serialization.",
    },
    {
        caseId: "targets/transform-origin",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "Transform-origin aliases only require first-snapshot style composition; later updates already use upstream motion-dom.",
    },
    {
        caseId: "targets/complex-gradient",
        importance: 4,
        platformFit: 4,
        mts: 1,
        reactLynx: 0,
        css: 2,
        rationale:
            "Complex-value interpolation already reuses the upstream mixer; evidence confirms the Lynx style path preserves intermediate gradients.",
    },
    {
        caseId: "targets/display-reveal",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "Common fade-in visibility pattern already reuses upstream discrete value mixing on immutable Lynx.",
    },
    {
        caseId: "targets/visibility-reveal",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "Common visibility fade-in pattern directly reuses upstream invisible-value mixing on immutable Lynx.",
    },
    {
        caseId: "targets/no-op",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common lifecycle and efficiency invariant is handled by the upstream MotionValue animation.",
    },
    {
        caseId: "targets/no-op-keyframes",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Core keyframe lifecycle invariant is already handled by the upstream MotionValue animation on immutable Lynx.",
    },
    {
        caseId: "transitions/spring-velocity",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Spring physics and lifecycle semantics directly reuse the upstream MotionValue generator on immutable Lynx.",
    },
    {
        caseId: "targets/z-index-discrete",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "Layering is common but narrower than transform/opacity; upstream property classification already applies zIndex discretely on immutable Lynx.",
    },
    {
        caseId: "transitions/unknown-type-fallback",
        importance: 2,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "A narrow resilience contract: upstream generator fallback preserves the declarative tree without claiming custom type support.",
    },
    {
        caseId: "targets/zero-unit-normalization",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "A common CSS value-type edge directly reuses upstream normalization and settles through Lynx style serialization.",
    },
    {
        caseId: "targets/css-custom-property",
        importance: 3,
        platformFit: 2,
        mts: 1,
        reactLynx: 4,
        css: 4,
        rationale:
            "Design-token composition is useful and the Motion adapter is small, but plain native ReactLynx drops --* declarations and var() consumption before animation.",
        issue: "https://github.com/Huxpro/motion/issues/57",
    },
    {
        caseId: "transitions/repeat-loop-final",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Finite loop terminal semantics are handled entirely by the upstream repeat generator on immutable Lynx.",
    },
    {
        caseId: "targets/keyframes",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 1,
        rationale:
            "Popular upstream primitive with exact ordered-keyframe sampling.",
    },
    {
        caseId: "targets/null-keyframe",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common from-current-value keyframes reuse upstream MotionValue hydration without host adaptation.",
    },
    {
        caseId: "transitions/keyframe-times",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Useful keyframe orchestration option reuses upstream offset sampling without host-specific adaptation.",
    },
    {
        caseId: "transitions/default-fallback",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common transition routing fallback reuses upstream getValueTransition without host adaptation.",
    },
    {
        caseId: "transitions/manual-from",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Useful start-value override is consumed directly by the upstream MotionValue animation.",
    },
    {
        caseId: "transitions/instant",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common state-switch primitive reuses upstream instant MotionValue completion without host adaptation.",
    },
    {
        caseId: "transitions/named-easing",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common transition shaping maps directly to upstream easing functions and needs no host-specific adaptation.",
    },
    {
        caseId: "transitions/easing-function-array",
        importance: 3,
        platformFit: 2,
        mts: 5,
        reactLynx: 4,
        css: 0,
        rationale:
            "Useful per-segment customization is blocked on generic nested callable hydration across the background/main boundary.",
        issue: "https://github.com/Huxpro/motion/issues/37",
    },
    {
        caseId: "targets/transform-template",
        importance: 4,
        platformFit: 2,
        mts: 5,
        reactLynx: 4,
        css: 0,
        rationale:
            "Useful transform composition escape hatch requires an arbitrary consumer closure to run on every main-thread style frame.",
        issue: "https://github.com/Huxpro/motion/issues/55",
    },
    {
        caseId: "targets/style-motion-value",
        importance: 5,
        platformFit: 4,
        mts: 2,
        reactLynx: 3,
        css: 0,
        rationale:
            "Core composition primitive; one-way set fits an async bridge, while synchronous reads and subscriptions remain a ReactLynx architecture boundary in issue #62.",
        issue: "https://github.com/Huxpro/motion/issues/62",
    },
    {
        caseId: "targets/color-keyframes",
        importance: 4,
        platformFit: 4,
        mts: 1,
        reactLynx: 0,
        css: 2,
        rationale:
            "Common style animation reuses upstream color parsing/mixing; host CSS serialization is the remaining platform-sensitive layer.",
    },
    {
        caseId: "targets/color-hsla-rgba",
        importance: 4,
        platformFit: 4,
        mts: 1,
        reactLynx: 0,
        css: 2,
        rationale:
            "Common cross-representation color animation reuses the upstream mixer; Lynx accepts every emitted intermediate RGB value.",
    },
    {
        caseId: "transitions/spring",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Core Motion transition reuses the upstream spring generator without host-specific adaptation.",
    },
    {
        caseId: "transitions/delay",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common sequencing primitive reuses upstream delay sampling without host-specific adaptation.",
    },
    {
        caseId: "transitions/negative-delay",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Useful timeline-offset primitive reuses upstream elapsed-time sampling without host-specific adaptation.",
    },
    {
        caseId: "transitions/repeat-infinity",
        importance: 3,
        platformFit: 4,
        mts: 2,
        reactLynx: 0,
        css: 0,
        rationale:
            "Public infinite-sampling semantics are exact; DOM-only WAAPI routing is documented separately.",
        issue: "https://github.com/Huxpro/motion/issues/19",
    },
    {
        caseId: "transitions/repeat-reverse",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Finite repeat direction is implemented by the upstream animation sampler with no host-specific adaptation.",
    },
    {
        caseId: "transitions/repeat-mirror",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Mirror's distinct easing direction reuses the upstream mirrored generator without host-specific adaptation.",
    },
    {
        caseId: "transitions/repeat-delay",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common loop-rhythm option reuses upstream endpoint hold sampling without host-specific adaptation.",
    },
    {
        caseId: "variants/named",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common declarative authoring form with exact label and transition evidence.",
    },
    {
        caseId: "variants/function-custom",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Custom resolver arguments and target-owned delays have exact evidence.",
    },
    {
        caseId: "gestures/tap",
        importance: 5,
        platformFit: 3,
        mts: 3,
        reactLynx: 1,
        css: 0,
        rationale:
            "Portable hold/release priority is exact; DOM keyboard accessibility is tracked separately.",
        issue: "https://github.com/Huxpro/motion/issues/21",
    },
    {
        caseId: "gestures/hover",
        importance: 3,
        platformFit: 3,
        mts: 3,
        reactLynx: 1,
        css: 0,
        rationale:
            "Exact on hover-capable clients; touch-only clients have no physical hover input.",
        issue: "https://github.com/Huxpro/motion/issues/23",
    },
    {
        caseId: "gestures/transition-end-only",
        importance: 4,
        platformFit: 5,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale:
            "Gesture priority can reuse the same upstream target semantics once empty animation phases retain lifecycle ownership.",
    },
    {
        caseId: "lifecycle/base-animate",
        importance: 4,
        platformFit: 4,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale:
            "Callback order and definitions are verified across Web, Lynx, and native Explorer.",
    },
    {
        caseId: "lifecycle/tap-animation",
        importance: 4,
        platformFit: 4,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale:
            "Common gesture telemetry reuses upstream MotionValue animations with a narrow main-thread lifecycle bridge.",
    },
    {
        caseId: "initial/false",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Core mount semantic; isolated Motion-adapter change with no host gap.",
    },
    {
        caseId: "initial/false-propagation",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 1,
        css: 0,
        rationale:
            "Core first-frame semantics extend directly through the existing ReactLynx variant context and upstream MotionValue hydration.",
    },
    {
        caseId: "variants/propagation",
        importance: 5,
        platformFit: 4,
        mts: 1,
        reactLynx: 1,
        css: 0,
        rationale:
            "Core declarative composition now fits ReactLynx context and reuses each child's existing upstream MotionValue path.",
    },
    {
        caseId: "variants/delay-children",
        importance: 4,
        platformFit: 4,
        mts: 1,
        reactLynx: 2,
        css: 0,
        rationale:
            "Common parent/child timing composes through ReactLynx context and leaves animation execution on each child's upstream MotionValue.",
    },
    {
        caseId: "variants/inherit-opt-out",
        importance: 4,
        platformFit: 5,
        mts: 1,
        reactLynx: 1,
        css: 0,
        rationale:
            "A common variant-composition boundary maps directly to ReactLynx context without host, callable, or CSS adaptation.",
    },
    {
        caseId: "variants/orchestration",
        importance: 5,
        platformFit: 2,
        mts: 2,
        reactLynx: 4,
        css: 0,
        rationale:
            "Controls, gesture propagation, dynamic stagger, and ordered subtree lifecycle still need a cross-thread visual-element registry and aggregation.",
        issue: "https://github.com/Huxpro/motion/issues/10",
    },
    {
        caseId: "presence/exit",
        importance: 5,
        platformFit: 2,
        mts: 2,
        reactLynx: 5,
        css: 0,
        rationale:
            "High-value pattern needs projection and delayed-unmount ownership.",
        issue: "https://github.com/Huxpro/motion/issues/5",
    },
]

const priorityByCase = new Map(
    CONFORMANCE_PRIORITIES.map((priority) => [priority.caseId, priority])
)
const lossWeight: Record<ConformanceStatus, number> = {
    conformant: 0,
    // Partial also covers an evidenced platform divergence, even when both web
    // renderers conform. It must retain loss until the native boundary closes.
    partial: 0.5,
    blocked: 1,
}

export function calculateWeightedLoss(
    cases: readonly ConformanceCase[] = CONFORMANCE_CASES
): number {
    const totalImportance = cases.reduce(
        (total, item) => total + (priorityByCase.get(item.id)?.importance ?? 0),
        0
    )
    const unresolved = cases.reduce((total, item) => {
        const importance = priorityByCase.get(item.id)?.importance ?? 0
        return total + importance * lossWeight[item.status]
    }, 0)
    return Math.round((unresolved / totalImportance) * 100)
}

export const PRIORITIZED_GAPS = CONFORMANCE_CASES.filter(
    (item) => item.status !== "conformant"
)
    .map((item) => {
        const priority = priorityByCase.get(item.id) as GapPriority
        const effort = 1 + priority.mts + priority.reactLynx + priority.css
        const score =
            (priority.importance *
                priority.platformFit *
                lossWeight[item.status]) /
            effort
        return {
            case: item,
            priority,
            score: Math.round(score * 10) / 10,
        }
    })
    .sort((left, right) => right.score - left.score)

export const WEIGHTED_LOSS = calculateWeightedLoss()
export const INITIAL_FALSE_PROJECTED_LOSS = calculateWeightedLoss(
    CONFORMANCE_CASES.map((item) =>
        item.id === "initial/false" ? { ...item, status: "conformant" } : item
    )
)

export const CONVERGENCE_HISTORY: readonly ConvergenceRecord[] = [
    {
        id: "lynx-3405",
        date: "2026-08-07",
        title: "Declarative component foundation",
        kind: "capability",
        status: "stacked",
        lynxStackPr: 3405,
        caseIds: [],
        lossBefore: 100,
        lossAfter: 100,
        note: "Public component surface opened; no consumer conformance claim yet.",
    },
    {
        id: "lynx-3436-motion-2",
        date: "2026-08-11",
        title: "Hardened subset + parity harness",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3436,
        motionPr: 2,
        caseIds: [
            "component/motion-create",
            "targets/reactive-animate",
            "targets/keyframes",
            "transitions/repeat-infinity",
            "variants/named",
            "variants/function-custom",
            "gestures/tap",
            "gestures/hover",
            "lifecycle/base-animate",
        ],
        lossBefore: 100,
        lossAfter: 61,
        note: "Package, dual-renderer, and native evidence established the first measured slice.",
    },
    {
        id: "motion-13",
        date: "2026-08-11",
        title: "Evidence monitor",
        kind: "evidence",
        status: "merged",
        motionPr: 13,
        caseIds: [],
        lossBefore: 61,
        lossAfter: 61,
        note: "Made the denominator and evidence ladder auditable; no semantic claim moved.",
    },
    {
        id: "lynx-3453",
        date: "2026-08-11",
        title: "MainThreadObject core",
        kind: "architecture",
        status: "stacked",
        lynxStackPr: 3453,
        caseIds: [],
        lossBefore: 61,
        lossAfter: 61,
        note: "Typed object identity removes a long-term adapter dependency without changing conformance status.",
    },
    {
        id: "lynx-3455",
        date: "2026-08-11",
        title: "Motion on MainThreadObject",
        kind: "architecture",
        status: "stacked",
        lynxStackPr: 3455,
        caseIds: [],
        lossBefore: 61,
        lossAfter: 61,
        note: "Moves MotionValue hydration onto the reusable Core primitive; consumer preview pending.",
    },
    {
        id: "motion-14",
        date: "2026-08-11",
        title: "Reactive animate timing parity",
        kind: "evidence",
        status: "merged",
        motionPr: 14,
        caseIds: ["targets/reactive-animate"],
        lossBefore: 61,
        lossAfter: 56,
        note: "I5/F5/M1/R0/C0 · immutable bd151a1 package · Gallery covered · dual-renderer timing 5/5 · native not required.",
    },
    {
        id: "motion-15",
        date: "2026-08-11",
        title: "Named variants parity",
        kind: "evidence",
        status: "merged",
        motionPr: 15,
        caseIds: ["variants/named"],
        lossBefore: 56,
        lossAfter: 51,
        note: "I5/F5/M1/R0/C0 · immutable bd151a1 package · focused Gallery case · dual-renderer label transition · native not required.",
    },
    {
        id: "motion-16",
        date: "2026-08-11",
        title: "Ordered keyframes parity",
        kind: "evidence",
        status: "merged",
        motionPr: 16,
        caseIds: ["targets/keyframes"],
        lossBefore: 51,
        lossAfter: 46,
        note: "I5/F5/M1/R0/C1 · immutable bd151a1 package · focused Gallery case · dual-renderer peak/final sampling · native not required.",
    },
    {
        id: "motion-17",
        date: "2026-08-11",
        title: "Function variants + custom parity",
        kind: "evidence",
        status: "merged",
        motionPr: 17,
        caseIds: ["variants/function-custom"],
        lossBefore: 46,
        lossAfter: 43,
        note: "I3/F5/M1/R0/C0 · immutable bd151a1 package · existing Gallery pattern · dual-renderer custom-delay ordering · native not required.",
    },
    {
        id: "motion-18",
        date: "2026-08-11",
        title: "Base animation lifecycle parity",
        kind: "evidence",
        status: "merged",
        motionPr: 18,
        caseIds: ["lifecycle/base-animate"],
        lossBefore: 43,
        lossAfter: 39,
        note: "I4/F4/M2/R1/C0 · immutable bd151a1 package · headless start→complete order · native Explorer event log · clean console.",
    },
    {
        id: "motion-20",
        date: "2026-08-11",
        title: "Infinite repeat sampling parity",
        kind: "evidence",
        status: "merged",
        motionPr: 20,
        caseIds: ["transitions/repeat-infinity"],
        lossBefore: 39,
        lossAfter: 37,
        note: "I3/F4/M2/R0/C0 · immutable bd151a1 package · dual-renderer post-duration sampling · native loop evidence · WAAPI boundary issue #19.",
    },
    {
        id: "motion-22",
        date: "2026-08-11",
        title: "Tap gesture parity",
        kind: "evidence",
        status: "merged",
        motionPr: 22,
        caseIds: ["gestures/tap"],
        lossBefore: 37,
        lossAfter: 32,
        note: "I5/F3/M3/R1/C0 · immutable bd151a1 package · dual-renderer press apply/unapply · existing native evidence · keyboard boundary issue #21.",
    },
    {
        id: "motion-24",
        date: "2026-08-11",
        title: "Hover gesture parity",
        kind: "evidence",
        status: "verified",
        motionPr: 24,
        caseIds: ["gestures/hover"],
        lossBefore: 32,
        lossAfter: 29,
        note: "I3/F3/M3/R1/C0 · immutable bd151a1 package · dual-renderer enter/apply/leave evidence · touch-only platform scope issue #23.",
    },
    {
        id: "motion-25",
        date: "2026-08-11",
        title: "Spring transition parity",
        kind: "evidence",
        status: "verified",
        motionPr: 25,
        caseIds: ["transitions/spring"],
        lossBefore: 29,
        lossAfter: 26,
        note: "I5/F5/M1/R0/C0 · immutable bd151a1 package · dual-renderer overshoot/settle · native centers 785→1112→1069 · clean console.",
    },
    {
        id: "motion-26",
        date: "2026-08-12",
        title: "Reverse repeat parity",
        kind: "evidence",
        status: "verified",
        motionPr: 26,
        caseIds: ["transitions/repeat-reverse"],
        lossBefore: 26,
        lossAfter: 25,
        note: "I3/F5/M1/R0/C0 · immutable bd151a1 package · dual-renderer 1→1.35→1 sampling · no new native host boundary.",
    },
    {
        id: "motion-28",
        date: "2026-08-12",
        title: "Verified evidence inventory sync",
        kind: "evidence",
        status: "verified",
        motionPr: 28,
        caseIds: ["gestures/hover"],
        lossBefore: 25,
        lossAfter: 25,
        note: "Reconciles atomic/API evidence with merged exact cases; hover supported at its documented scope; no new semantic claim.",
    },
    {
        id: "motion-29",
        date: "2026-08-12",
        title: "Color keyframes parity",
        kind: "evidence",
        status: "verified",
        motionPr: 29,
        caseIds: ["targets/color-keyframes"],
        lossBefore: 25,
        lossAfter: 23,
        note: "I4/F4/M1/R0/C2 · immutable bd151a1 package · dual-renderer red→green→blue sampling · native frame sequence · clean console.",
    },
    {
        id: "motion-30",
        date: "2026-08-12",
        title: "Tap harness readiness gate",
        kind: "evidence",
        status: "verified",
        motionPr: 30,
        caseIds: ["gestures/tap"],
        lossBefore: 23,
        lossAfter: 23,
        note: "Waits for observable main-thread ref hydration; tap 10/10 serial and full suite 15/15; no retry or semantic change.",
    },
    {
        id: "motion-31",
        date: "2026-08-12",
        title: "Positive transition delay",
        kind: "evidence",
        status: "verified",
        motionPr: 31,
        caseIds: ["transitions/delay"],
        lossBefore: 23,
        lossAfter: 22,
        note: "I4/F5/M1/R0/C0 · upstream Accepts delay · dual-renderer hold→move→settle 5/5 · full suite 16/16 · native visual start/end and clean console; exact native timing not claimed.",
    },
    {
        id: "lynx-3478",
        date: "2026-08-12",
        title: "Background MotionValue.set bridge",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3478,
        issue: 62,
        caseIds: ["targets/style-motion-value"],
        lossBefore: 15,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F4/M2/R3/C0 · #3458 supplies typed style MotionValues; immutable 72c4fe0 adds #3478's opt-in, one-way background set bridge · focused dual-renderer 5/5 and full suite 40/40 · x moves -36→36 while React render count stays 1 · synchronous get/subscription parity remains issue #62 · native Sandbox host cannot load the current bundle, so no exact-preview native claim.",
    },
    {
        id: "lynx-3479",
        date: "2026-08-12",
        title: "Tap animation lifecycle",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3479,
        caseIds: ["lifecycle/tap-animation"],
        lossBefore: 12,
        lossAfter: WEIGHTED_LOSS,
        note: "I4/F4/M2/R1/C0 · immutable e784419 full package set · press reports pressed lifecycle and release restores the active lower-priority definition across multi-property targets; package tests also cover the rest fallback and stale-completion suppression · ReactLynx snapshot excludes the circular active-animation edge while direct MotionValue animation access remains available.",
    },
    {
        id: "motion-33",
        date: "2026-08-12",
        title: "Negative transition delay",
        kind: "evidence",
        status: "verified",
        motionPr: 33,
        caseIds: ["transitions/negative-delay"],
        lossBefore: 27,
        lossAfter: 26,
        note: "I3/F5/M1/R0/C0 · upstream negative delay as elapsed · dual-renderer first-change skip and early settle 5/5 · full suite 17/17 · no native timing claim.",
    },
    {
        id: "motion-34",
        date: "2026-08-12",
        title: "Repeat delay",
        kind: "evidence",
        status: "verified",
        motionPr: 34,
        caseIds: ["transitions/repeat-delay"],
        lossBefore: 26,
        lossAfter: 25,
        note: "I4/F5/M1/R0/C0 · upstream endpoint hold semantics · full-timeline dual-renderer hold→restart→settle 5/5 · full suite 18/18 · no native timing claim.",
    },
    {
        id: "motion-35",
        date: "2026-08-12",
        title: "Keyframe times",
        kind: "evidence",
        status: "verified",
        motionPr: 35,
        caseIds: ["transitions/keyframe-times"],
        lossBefore: 25,
        lossAfter: 24,
        note: "I3/F5/M1/R0/C0 · upstream duplicate-offset semantics · focused times + gesture regression 15/15 · full suite 19/19 · no native host boundary.",
    },
    {
        id: "motion-36",
        date: "2026-08-12",
        title: "Named easing",
        kind: "evidence",
        status: "verified",
        motionPr: 36,
        caseIds: ["transitions/named-easing"],
        lossBefore: 24,
        lossAfter: 23,
        note: "I4/F5/M1/R0/C0 · upstream easing lookup · simultaneous easeInOut/linear focused + gesture regression 15/15 · full suite 20/20 · no native host boundary.",
    },
    {
        id: "motion-38",
        date: "2026-08-12",
        title: "Easing function array gap",
        kind: "evidence",
        status: "verified",
        motionPr: 38,
        caseIds: ["transitions/easing-function-array"],
        lossBefore: 23,
        lossAfter: WEIGHTED_LOSS,
        note: "I3/F2/M5/R4/C0 · Web invokes both per-segment callbacks; Lynx invokes neither and silently settles · architecture blocker issue #37 · no Gallery claim.",
    },
    {
        id: "motion-39",
        date: "2026-08-12",
        title: "Mirror repeat",
        kind: "evidence",
        status: "verified",
        motionPr: 39,
        caseIds: ["transitions/repeat-mirror"],
        lossBefore: 26,
        lossAfter: 25,
        note: "I3/F5/M1/R0/C0 · upstream mirrored-generator semantics · named easeIn outward/return focused + gesture regression 15/15 · full suite 21/21 · no native host boundary.",
    },
    {
        id: "motion-40",
        date: "2026-08-12",
        title: "Null keyframe hydration",
        kind: "evidence",
        status: "verified",
        motionPr: 40,
        caseIds: ["targets/null-keyframe"],
        lossBefore: 25,
        lossAfter: 24,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · upstream current-MotionValue hydration · focused null keyframe + gesture regression 15/15 · full suite 22/22 · no native host boundary.",
    },
    {
        id: "motion-41",
        date: "2026-08-12",
        title: "Default transition fallback",
        kind: "evidence",
        status: "verified",
        motionPr: 41,
        caseIds: ["transitions/default-fallback"],
        lossBefore: 24,
        lossAfter: 23,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · upstream default-key routing · focused fallback + gesture regression 15/15 · full suite 23/23 · no native host boundary; property-specific override remains #3459.",
    },
    {
        id: "motion-42",
        date: "2026-08-12",
        title: "Manual transition start",
        kind: "evidence",
        status: "verified",
        motionPr: 42,
        caseIds: ["transitions/manual-from"],
        lossBefore: 23,
        lossAfter: 22,
        note: "I3/F5/M1/R0/C0 · immutable bd151a1 package · upstream transition.from restart semantics · focused from + gesture regression 15/15 · full suite 24/24 · no native host boundary.",
    },
    {
        id: "motion-43",
        date: "2026-08-12",
        title: "Equal target no-op",
        kind: "evidence",
        status: "verified",
        motionPr: 43,
        caseIds: ["targets/no-op"],
        lossBefore: 22,
        lossAfter: 21,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · upstream equal-target idle semantics · focused no-op + gesture regression 15/15 · full suite 25/25 · no native host boundary.",
    },
    {
        id: "motion-44",
        date: "2026-08-12",
        title: "Instant transition",
        kind: "evidence",
        status: "verified",
        motionPr: 44,
        caseIds: ["transitions/instant"],
        lossBefore: 21,
        lossAfter: 21,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · first changed frame is the final target · focused instant + gesture regression 15/15 · full suite 26/26 · rounded loss remains 21 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-45",
        date: "2026-08-12",
        title: "New target property",
        kind: "evidence",
        status: "verified",
        motionPr: 45,
        caseIds: ["targets/unseen-property"],
        lossBefore: 21,
        lossAfter: 20,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · later target adds y while retaining x · focused unseen property + gesture regression 15/15 · full suite 27/27 · no removed-key claim and no native host boundary.",
    },
    {
        id: "motion-46",
        date: "2026-08-12",
        title: "Discrete display reveal",
        kind: "evidence",
        status: "verified",
        motionPr: 46,
        caseIds: ["targets/display-reveal"],
        lossBefore: 20,
        lossAfter: 19,
        note: "I4/F5/M1/R0/C1 · immutable bd151a1 package · display switches from none to block before opacity entrance completes · focused display + gesture regression 15/15 · full suite 28/28 · no native host boundary.",
    },
    {
        id: "motion-47",
        date: "2026-08-12",
        title: "Discrete visibility reveal",
        kind: "evidence",
        status: "verified",
        motionPr: 47,
        caseIds: ["targets/visibility-reveal"],
        lossBefore: 19,
        lossAfter: 19,
        note: "I4/F5/M1/R0/C1 · immutable bd151a1 package · visibility switches from hidden to visible before opacity entrance completes · focused visibility + gesture regression 15/15 · full suite 29/29 · rounded loss remains 19 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-48",
        date: "2026-08-12",
        title: "Equal keyframe no-op",
        kind: "evidence",
        status: "verified",
        motionPr: 48,
        caseIds: ["targets/no-op-keyframes"],
        lossBefore: 19,
        lossAfter: 18,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · equal opacity and transform keyframe arrays remain idle · focused scalar/keyframe no-op + hover regression 15/15 · full suite 30/30 · no native host boundary.",
    },
    {
        id: "motion-49",
        date: "2026-08-12",
        title: "Spring velocity lifecycle",
        kind: "evidence",
        status: "verified",
        motionPr: 49,
        caseIds: ["transitions/spring-velocity"],
        lossBefore: 18,
        lossAfter: 17,
        note: "I4/F5/M1/R0/C0 · immutable bd151a1 package · non-zero velocity starts an equal-target spring through the upstream generator · focused spring/keyframe no-op + hover regression 15/15 · full suite 31/31 · no native host boundary.",
    },
    {
        id: "motion-50",
        date: "2026-08-12",
        title: "Discrete zIndex",
        kind: "evidence",
        status: "verified",
        motionPr: 50,
        caseIds: ["targets/z-index-discrete"],
        lossBefore: 17,
        lossAfter: 17,
        note: "I3/F5/M1/R0/C1 · immutable bd151a1 package · zIndex applies target 100 immediately despite a long transition · focused zIndex/spring + hover regression 15/15 · full suite 32/32 · rounded loss remains 17 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-51",
        date: "2026-08-12",
        title: "HSLA to RGBA",
        kind: "evidence",
        status: "verified",
        motionPr: 51,
        caseIds: ["targets/color-hsla-rgba"],
        lossBefore: 17,
        lossAfter: 17,
        note: "I4/F4/M1/R0/C2 · immutable bd151a1 package · upstream mixer produces observable cross-representation intermediate colors and settles rgba(0,136,255,1) · focused color + hover regression 15/15 · full suite 33/33 · rounded loss remains 17 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-52",
        date: "2026-08-12",
        title: "Unknown type fallback",
        kind: "evidence",
        status: "verified",
        motionPr: 52,
        caseIds: ["transitions/unknown-type-fallback"],
        lossBefore: 17,
        lossAfter: 16,
        note: "I2/F5/M1/R0/C0 · immutable bd151a1 package · unknown transition types preserve both declarative trees without runtime or console errors; this does not claim custom generator support · focused fallback/zIndex + hover regression 15/15 · full suite 34/34 · no native host boundary.",
    },
    {
        id: "motion-53",
        date: "2026-08-12",
        title: "Zero-unit normalization",
        kind: "evidence",
        status: "verified",
        motionPr: 53,
        caseIds: ["targets/zero-unit-normalization"],
        lossBefore: 16,
        lossAfter: 16,
        note: "I3/F5/M1/R0/C1 · immutable bd151a1 package · upstream value-type conversion normalizes borderRadius 0px to numeric target 20/20px · focused zero-unit/fallback + hover regression 15/15 · full suite 35/35 · rounded loss remains 16 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-54",
        date: "2026-08-12",
        title: "Loop final keyframe",
        kind: "evidence",
        status: "verified",
        motionPr: 54,
        caseIds: ["transitions/repeat-loop-final"],
        lossBefore: 16,
        lossAfter: 16,
        note: "I3/F5/M1/R0/C0 · immutable bd151a1 package · repeat 1 + loop runs two forward iterations and settles at x 20 through the upstream repeat generator · focused loop/reverse + hover regression 15/15 · full suite 36/36 · rounded loss remains 16 while raw coverage grows · no native host boundary.",
    },
    {
        id: "motion-56-issue-55",
        date: "2026-08-12",
        title: "Transform template blocker",
        kind: "architecture",
        status: "verified",
        motionPr: 56,
        caseIds: ["targets/transform-template"],
        lossBefore: 16,
        lossAfter: 18,
        note: "I4/F2/M5/R4/C0 · issue #55 · Web x/y 30/30; immutable Lynx-for-Web 30/0 across 5 repeats; Android native DOM transform is translateX(30px) only · known scope expands tracked 38→39 and blocked 5→6, so loss rises honestly rather than hiding the public API gap.",
    },
    {
        id: "lynx-3466-issue-57",
        date: "2026-08-12",
        title: "CSS custom property target",
        kind: "architecture",
        status: "verified",
        lynxStackPr: 3466,
        motionPr: 59,
        caseIds: ["targets/css-custom-property"],
        lossBefore: 18,
        lossAfter: WEIGHTED_LOSS,
        note: "I3/F2/M1/R4/C4 · immutable 9aff526 full package set · typed MotionStyle + upstream motion-dom setProperty · Web/Lynx-for-Web variable and consumed background pass 5/5 · Android static ReactLynx control and Motion target both compute transparent · issue #57 · tracked 39→40 and partial 0→1, so rounded loss rises 18→19 as native scope becomes explicit.",
    },
    {
        id: "issue-58-stack-regression",
        date: "2026-08-12",
        title: "Full-stack lifecycle regression",
        kind: "regression",
        status: "verified",
        issue: 58,
        caseIds: [
            "targets/no-op",
            "targets/no-op-keyframes",
            "lifecycle/base-animate",
        ],
        lossBefore: WEIGHTED_LOSS,
        lossAfter: WEIGHTED_LOSS,
        note: "immutable 9aff526 · CSS custom property focused case passes, but the full headless suite is 33/37: both no-op statuses and declarative onAnimationComplete remain active/missing on Lynx-for-Web · previous bd151a1 suite was 36/36 · issue #58 · metrics stay unchanged until the regression is fixed and revalidated.",
    },
    {
        id: "lynx-3474-issue-58",
        date: "2026-08-12",
        title: "Completion lifecycle regression repaired",
        kind: "regression",
        status: "verified",
        lynxStackPr: 3474,
        motionPr: 60,
        issue: 58,
        caseIds: [
            "targets/no-op",
            "targets/no-op-keyframes",
            "lifecycle/base-animate",
        ],
        lossBefore: WEIGHTED_LOSS,
        lossAfter: WEIGHTED_LOSS,
        note: "I4/F4/M1/R1/C0 · immutable 48fc271 full package set · restores declarative onAnimationComplete while the existing main-thread generation guard still suppresses completion after unmount · focused lifecycle/no-op/unmount 5/5 · full dual-renderer suite 38/38 (from 33/37) · rounded loss remains 19 because this repairs accepted coverage rather than adding an API claim · native Sandbox blocker: Playground SDK 0.0.1 cannot decode the current Rspeedy bundle and Explorer does not implement App.openPage.",
    },
    {
        id: "lynx-3457",
        date: "2026-08-11",
        title: "initial={false}",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3457,
        motionPr: 61,
        caseIds: ["initial/false"],
        lossBefore: 19,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F5/M1/R0/C0 · #3457 is already an ancestor of immutable full-stack 48fc271 · package 119/119 · first frame renders the final keyframe with zero mount starts, then a later update animates once in both renderers · native Sandbox host cannot load the current bundle, so no exact-preview native claim.",
    },
    {
        id: "lynx-3483",
        date: "2026-08-12",
        title: "Upstream MotionValue hydration",
        kind: "architecture",
        status: "stacked",
        lynxStackPr: 3483,
        caseIds: [],
        lossBefore: 12,
        lossAfter: 12,
        note: "Moves hydration and animation ownership onto upstream MotionValue primitives; architectural reuse improves without adding a separate conformance claim.",
    },
    {
        id: "lynx-3484",
        date: "2026-08-12",
        title: "Hover lifecycle ownership",
        kind: "regression",
        status: "stacked",
        lynxStackPr: 3484,
        caseIds: ["gestures/hover", "lifecycle/tap-animation"],
        lossBefore: 12,
        lossAfter: 12,
        note: "Preserves gesture priority and suppresses stale restoration completion; this protects accepted contracts without moving loss.",
    },
    {
        id: "lynx-3485",
        date: "2026-08-12",
        title: "Gesture transitionEnd values",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3485,
        caseIds: ["gestures/transition-end-only"],
        lossBefore: 12,
        lossAfter: 11,
        note: "I4/F5/M2/R1/C0 · immutable d4d34c7 · transitionEnd-only press applies 0.4, reports lifecycle, and restores 1 · package coverage plus complete dual-renderer suite 47/47 · no new native claim.",
    },
    {
        id: "lynx-3486",
        date: "2026-08-12",
        title: "Gesture rest transition ownership",
        kind: "regression",
        status: "verified",
        lynxStackPr: 3486,
        caseIds: ["gestures/tap", "gestures/hover"],
        lossBefore: 11,
        lossAfter: 11,
        note: "Uses the active lower-priority target transition when gestures restore; immutable d4d34c7 retains exact tap/hover restoration in the complete 47/47 suite.",
    },
    {
        id: "lynx-3487",
        date: "2026-08-12",
        title: "transitionEnd-only gesture lifecycle",
        kind: "regression",
        status: "verified",
        lynxStackPr: 3487,
        caseIds: ["gestures/transition-end-only"],
        lossBefore: 11,
        lossAfter: 11,
        note: "Empty animation phases keep generation and lifecycle ownership, including stale-release suppression; immutable d4d34c7 complete suite 47/47.",
    },
    {
        id: "lynx-3488",
        date: "2026-08-12",
        title: "Base transitionEnd-only target",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3488,
        caseIds: ["targets/transition-end-subsequent"],
        lossBefore: 11,
        lossAfter: 11,
        note: "I4/F5/M1/R0/C0 · immutable d4d34c7 · a subsequent transitionEnd-only target applies opacity 0.4 with start→complete lifecycle and generation protection · complete suite 47/47.",
    },
    {
        id: "lynx-3489",
        date: "2026-08-12",
        title: "Removed animate ownership",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3489,
        caseIds: [
            "targets/removed-animate-original-initial",
            "targets/removed-animate-current-initial",
            "targets/removed-animate-and-initial",
        ],
        lossBefore: 11,
        lossAfter: 10,
        note: "I4/F5/M2/R0/C0 · immutable d4d34c7 · three upstream ownership contracts restore original initial, use current initial, or retain the live scalar · fresh upstream MotionValue snapshots avoid serializing animation objects · package 140/140 and complete dual-renderer suite 47/47.",
    },
    {
        id: "lynx-3490",
        date: "2026-08-12",
        title: "Initial transform origin",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3490,
        caseIds: ["targets/transform-origin"],
        lossBefore: 10,
        lossAfter: 10,
        note: "I3/F5/M1/R0/C1 · immutable d4d34c7 · numeric origin aliases render as percentages on the first snapshot and update through upstream motion-dom; plain ReactLynx control confirms no host blocker · package 142/142 and complete suite 47/47.",
    },
    {
        id: "lynx-3491",
        date: "2026-08-12",
        title: "Immutable stack validation",
        kind: "evidence",
        status: "verified",
        lynxStackPr: 3491,
        caseIds: [
            "gestures/transition-end-only",
            "targets/transition-end-subsequent",
            "targets/removed-animate-original-initial",
            "targets/removed-animate-current-initial",
            "targets/removed-animate-and-initial",
            "targets/transform-origin",
            "targets/complex-gradient",
        ],
        lossBefore: 10,
        lossAfter: WEIGHTED_LOSS,
        note: "Validation-only draft publishes exact motion/react/react-umd packages at d4d34c7 because feature-base PRs do not trigger pkg.pr.new · full Hux evidence build and headless Web/Lynx suite pass 47/47 · complex gradient I4/F4/M1/R0/C2 was already supported and adds source-linked evidence without a Lynx source patch · no Full Demo or native claim.",
    },
    {
        id: "lynx-3492",
        date: "2026-08-12",
        title: "Base variant label propagation",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3492,
        caseIds: ["variants/propagation"],
        lossBefore: 10,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F4/M1/R1/C0 · immutable e17bcaf motion/react/react-umd set · parent initial/animate labels propagate reactively while explicit child animate wins · package 144/144 and complete dual-renderer suite 48/48 · orchestration, controls, and gesture propagation remain scoped to issue #10 · no Full Demo or native claim.",
    },
    {
        id: "lynx-3493",
        date: "2026-08-12",
        title: "Numeric delayChildren",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3493,
        caseIds: ["variants/delay-children"],
        lossBefore: 10,
        lossAfter: WEIGHTED_LOSS,
        note: "I4/F4/M1/R2/C0 · immutable b9850fc motion/react/react-umd set · numeric delayChildren holds and then settles inherited child targets while explicit child animate resets ownership · package 147/147 and complete dual-renderer suite 49/49 · synthetic Web press retries preserve the unchanged transitionEnd assertion after an isolated 3/3 diagnosis · dynamic delay, stagger, when, controls, and gesture propagation remain scoped to issue #10 · no Full Demo or native claim.",
    },
    {
        id: "lynx-3494",
        date: "2026-08-12",
        title: "Variant inheritance opt-out",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3494,
        caseIds: ["variants/inherit-opt-out"],
        lossBefore: 10,
        lossAfter: WEIGHTED_LOSS,
        note: "I4/F5/M1/R1/C0 · immutable c394dd3 motion/react/react-umd set · inherit={false} publishes an empty variant context so an inherited initial label stops at the boundary · package 148/148 and complete dual-renderer suite 50/50 · parent-driven dynamic orchestration remains scoped to issue #10 · no Full Demo or native claim.",
    },
    {
        id: "lynx-3495",
        date: "2026-08-12",
        title: "Inherited initial={false}",
        kind: "capability",
        status: "verified",
        lynxStackPr: 3495,
        caseIds: ["initial/false-propagation"],
        lossBefore: 10,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F5/M1/R1/C0 · immutable f6b0e90 motion/react/react-umd set · parent initial={false} reaches inherited variant children so their first frame is the final animate keyframe · package 149/149 and complete dual-renderer suite 51/51 · no Full Demo or native claim.",
    },
]
