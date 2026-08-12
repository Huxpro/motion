export type ConformanceStatus = "conformant" | "partial" | "blocked"
export type SupportStatus = "supported" | "partial" | "blocked"
export type EvidenceLevel =
    | "dual-renderer"
    | "lynx-e2e"
    | "package-test"
    | "planned"

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
    kind: "capability" | "architecture" | "evidence"
    status: "merged" | "verified" | "stacked" | "pending"
    lynxStackPr?: number
    motionPr?: number
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
 * `partial` means that the Lynx behavior is executable but the isolated
 * Web/Lynx semantic comparison is still missing or narrower than upstream.
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
        id: "targets/style-motion-value",
        category: "Targets",
        title: "Live style MotionValue",
        summary:
            "A MotionValue bound through style updates the host directly without a React rerender.",
        status: "blocked",
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
            "a main-thread MotionValue.set updates transform directly",
            "the React render count stays unchanged",
        ],
        gap: "Runtime support exists, but the immutable consumer package rejects MotionValue<number> in MotionStyle. Fixed in stacked lynx-stack #3458; exact preview-package validation is pending.",
        evidence: {
            gallery: false,
            packageTest: true,
            dualRenderer: false,
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
        status: "blocked",
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
        gap: "Implemented in stacked lynx-stack PR #3457; immutable preview, dual-renderer, and native evidence are pending.",
        evidence: {
            gallery: false,
            packageTest: false,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "variants/propagation",
        category: "Variants",
        title: "Variant propagation",
        summary: "Children inherit labels through the Motion component tree.",
        status: "blocked",
        api: ["variants", "inheritance", "staggerChildren"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/variant.test.tsx",
            "child animates to set variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "parent label reaches descendants",
            "orchestration preserves child order",
        ],
        gap: "Requires a Lynx-side visual-element/component orchestration tree.",
        evidence: {
            gallery: false,
            packageTest: false,
            dualRenderer: false,
            native: false,
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

export const INITIAL_FALSE_CASE = CONFORMANCE_CASES.find(
    (item) => item.id === "initial/false"
) as ConformanceCase

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
        status: "blocked",
        evidence: "planned",
        contract: "Skip the mount animation and render the final keyframe.",
        boundary:
            "Stacked PR #3457 passes package tests; consumer preview evidence is pending.",
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
        id: "style-motion-value",
        group: "Targets",
        api: "style={{ value: MotionValue }}",
        status: "supported",
        evidence: "package-test",
        contract: "Bind upstream MotionValues to Lynx styles.",
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
        status: "blocked",
        evidence: "planned",
        contract: "Inherit labels through descendant Motion components.",
        boundary: "Requires a Lynx component orchestration tree.",
    },
    {
        id: "variant-orchestration",
        group: "Variants",
        api: "staggerChildren / when",
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
        status: "partial",
        evidence: "dual-renderer",
        contract: "Report base animate target lifecycle.",
        boundary: "Gesture animation lifecycle is not delivered yet.",
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
        caseId: "targets/style-motion-value",
        importance: 5,
        platformFit: 4,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale:
            "Core composition primitive; a main-thread MotionValue updates a bound transform without React rerendering.",
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
        caseId: "variants/propagation",
        importance: 5,
        platformFit: 2,
        mts: 2,
        reactLynx: 4,
        css: 0,
        rationale:
            "High-value pattern blocked on a cross-thread visual-element tree.",
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
        id: "lynx-3458",
        date: "2026-08-12",
        title: "Typed style MotionValues",
        kind: "capability",
        status: "pending",
        lynxStackPr: 3458,
        caseIds: ["targets/style-motion-value"],
        lossBefore: WEIGHTED_LOSS,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F4/M2/R1/C0 · 119/119 package tests · local declaration hypothesis passes dual-renderer 5/5 · immutable preview-package dual/native evidence pending.",
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
        id: "lynx-3457",
        date: "2026-08-11",
        title: "initial={false}",
        kind: "capability",
        status: "pending",
        lynxStackPr: 3457,
        caseIds: ["initial/false"],
        lossBefore: WEIGHTED_LOSS,
        lossAfter: WEIGHTED_LOSS,
        expectedLossAfter: INITIAL_FALSE_PROJECTED_LOSS,
        note: "I5/F5/M1/R0/C0 · package 119/119 · pre-preview dual/native pass · exact immutable preview evidence still required.",
    },
]
