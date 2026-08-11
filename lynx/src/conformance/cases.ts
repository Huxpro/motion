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
            "Array keyframes resolve and continue through repeated iterations.",
        status: "partial",
        api: ["animate", "keyframes", "transition"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/transition-keyframes.test.tsx",
            "keyframes as target"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "keyframe animation remains live after its first iteration",
        ],
        gap: "Lynx live-loop assertion exists; Web semantic sampling is not yet paired case-by-case.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "transitions/repeat-infinity",
        category: "Targets",
        title: "Infinite repeat",
        summary:
            "Infinity survives worklet serialization and the animation stays live.",
        status: "partial",
        api: ["transition.repeat", "repeatType"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/waapi.test.tsx",
            "Animates with WAAPI if repeat is Infinity and we need to generate keyframes"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "rotate/reverse/color loops do not freeze after one iteration",
        ],
        gap: "Runtime hardening is covered on Lynx-for-Web; the upstream test uses a DOM-specific WAAPI path.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "variants/named",
        category: "Variants",
        title: "Named variants",
        summary:
            "String labels resolve to local variant targets and transitions.",
        status: "partial",
        api: ["variants", "initial", "animate"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/variant.test.tsx",
            "animates to set variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "rest and active labels resolve to the expected local targets",
        ],
        gap: "Named variants run in Gallery; isolated semantic comparison remains to be added.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "variants/function-custom",
        category: "Variants",
        title: "Function variant + custom",
        summary:
            "Function variants receive custom and return target-local transitions.",
        status: "partial",
        api: ["variants", "custom", "transition"],
        upstream: source(
            "packages/framer-motion/src/render/utils/__tests__/variants.test.ts",
            "Resolves function that returns object"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: ["each custom index resolves a distinct delay"],
        gap: "Gallery verifies settled results and lifecycle; upstream resolver parity is not isolated yet.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "gestures/tap",
        category: "Gestures",
        title: "Tap gesture priority",
        summary:
            "whileTap overrides hover, fires callbacks, then restores the resting state.",
        status: "partial",
        api: ["whileTap", "onTapStart", "onTap", "onTapCancel"],
        upstream: source(
            "packages/framer-motion/src/gestures/__tests__/press.test.tsx",
            "press gesture variant applies and unapplies with whileHover"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "native-style touch hold applies tap target",
            "release restores hover/rest target",
        ],
        gap: "Lynx-for-Web gesture sequence passes; full keyboard/accessibility semantics differ from the DOM gesture layer.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: true,
        },
    },
    {
        id: "gestures/hover",
        category: "Gestures",
        title: "Hover gesture",
        summary: "Mouse-capable clients apply and remove a named hover target.",
        status: "partial",
        api: ["whileHover", "onHoverStart", "onHoverEnd"],
        upstream: source(
            "packages/framer-motion/src/gestures/__tests__/hover.test.tsx",
            "whileHover applied as variant"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "hover applies",
            "tap has higher priority",
            "pointer exit restores rest",
        ],
        gap: "Only mouse-capable Lynx clients participate; DOM pointer filtering is not reused unchanged.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
    },
    {
        id: "lifecycle/base-animate",
        category: "Lifecycle",
        title: "Base animation lifecycle",
        summary:
            "The base animate target reports start and completion definitions.",
        status: "partial",
        api: ["onAnimationStart", "onAnimationComplete"],
        upstream: source(
            "packages/framer-motion/src/motion/__tests__/animate-prop.test.tsx",
            "fires onAnimationStart when animation begins"
        ),
        baseline: "framer-motion@13.0.0",
        assertions: [
            "start reports definition",
            "complete reports the same definition",
        ],
        gap: "Base animate is covered; gesture-triggered animation lifecycle delivery is not.",
        evidence: {
            gallery: true,
            packageTest: true,
            dualRenderer: false,
            native: false,
        },
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
        evidence: "lynx-e2e",
    },
    {
        id: "gesture-priority",
        title: "Gesture priority",
        summary: "Hover, press, callback telemetry, and state restoration.",
        api: ["variants", "whileHover", "whileTap", "onTap"],
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
    },
    {
        id: "keyframes",
        title: "Keyframes",
        summary: "Transform keyframes remain live across iterations.",
        api: ["keyframes", "repeat"],
        evidence: "lynx-e2e",
    },
    {
        id: "repeat-reverse",
        title: "Reverse",
        summary: "Reverse repeat preserves scale endpoints.",
        api: ["repeatType: reverse"],
        evidence: "lynx-e2e",
    },
    {
        id: "color-keyframes",
        title: "Color mixer",
        summary: "Upstream color interpolation drives Lynx styles.",
        api: ["backgroundColor", "keyframes"],
        evidence: "lynx-e2e",
    },
    {
        id: "function-variant",
        title: "Function variants",
        summary: "custom values resolve target-local delay and lifecycle.",
        api: ["variants", "custom", "onAnimationComplete"],
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
        contract: "Animate scalar, transform, and color keyframes.",
        exampleId: "keyframes",
    },
    {
        id: "transition",
        group: "Targets",
        api: "transition",
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Reuse upstream tween/spring transition options.",
    },
    {
        id: "repeat",
        group: "Targets",
        api: "repeat / repeatType",
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Loop and reverse animations, including Infinity.",
        exampleId: "repeat-infinity",
    },
    {
        id: "variants-string",
        group: "Variants",
        api: 'animate="label"',
        status: "supported",
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
        contract: "Resolve function variants on the background thread.",
        exampleId: "function-variant",
    },
    {
        id: "custom",
        group: "Variants",
        api: "custom",
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Supply the argument for a function variant.",
        exampleId: "function-variant",
    },
    {
        id: "target-transition",
        group: "Variants",
        api: "variant.transition",
        status: "supported",
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
        contract: "Apply the tap target while pressed.",
        exampleId: "gesture-priority",
    },
    {
        id: "tap-callbacks",
        group: "Gestures",
        api: "onTapStart / onTap / onTapCancel",
        status: "supported",
        evidence: "lynx-e2e",
        contract: "Report press lifecycle and pointer coordinates.",
        exampleId: "gesture-priority",
    },
    {
        id: "while-hover",
        group: "Gestures",
        api: "whileHover",
        status: "partial",
        evidence: "lynx-e2e",
        contract: "Apply a hover target on mouse-capable clients.",
        boundary:
            "Not available on touch-only clients and not identical to DOM pointer filtering.",
        exampleId: "gesture-priority",
    },
    {
        id: "hover-callbacks",
        group: "Gestures",
        api: "onHoverStart / onHoverEnd",
        status: "partial",
        evidence: "lynx-e2e",
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
        evidence: "lynx-e2e",
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
        boundary: "Not every main-thread ref/handler combination is safe yet.",
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
            "Popular upstream primitive with a small style-sampling gap.",
    },
    {
        caseId: "transitions/repeat-infinity",
        importance: 3,
        platformFit: 4,
        mts: 2,
        reactLynx: 0,
        css: 0,
        rationale:
            "Useful loop behavior; Web baseline follows a different WAAPI path.",
    },
    {
        caseId: "variants/named",
        importance: 5,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Common declarative authoring form with local resolution in place.",
    },
    {
        caseId: "variants/function-custom",
        importance: 3,
        platformFit: 5,
        mts: 1,
        reactLynx: 0,
        css: 0,
        rationale:
            "Useful advanced variant form; isolated resolver evidence remains.",
    },
    {
        caseId: "gestures/tap",
        importance: 5,
        platformFit: 3,
        mts: 3,
        reactLynx: 1,
        css: 0,
        rationale:
            "High-use interaction with real event and accessibility differences.",
    },
    {
        caseId: "gestures/hover",
        importance: 3,
        platformFit: 2,
        mts: 3,
        reactLynx: 1,
        css: 0,
        rationale:
            "Input-platform scoped; touch-only clients cannot match Web hover.",
    },
    {
        caseId: "lifecycle/base-animate",
        importance: 4,
        platformFit: 4,
        mts: 2,
        reactLynx: 1,
        css: 0,
        rationale:
            "Important callback contract crossing main/background execution.",
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
        id: "motion-reactive-animate",
        date: "2026-08-11",
        title: "Reactive animate timing parity",
        kind: "evidence",
        status: "verified",
        caseIds: ["targets/reactive-animate"],
        lossBefore: 61,
        lossAfter: WEIGHTED_LOSS,
        note: "I5/F5/M1/R0/C0 · immutable bd151a1 package · Gallery covered · dual-renderer timing 5/5 · native not required.",
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
