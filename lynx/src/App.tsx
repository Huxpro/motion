import type { CSSProperties } from "@lynx-js/types"
import type { IntrinsicElements } from "@lynx-js/types"
import { useState } from "@lynx-js/react"
import {
    ARRAY_VARIANT_DEFINITION_PARITY_CASE,
    DELAY_CASE,
    DELAY_CHILDREN_CASE,
    DEEP_DELAY_CHILDREN_CASE,
    DEEP_INITIAL_FALSE_PROPAGATION_CASE,
    DEEP_VARIANT_PROPAGATION_CASE,
    DEFAULT_TRANSITION_CASE,
    DISPLAY_REVEAL_CASE,
    EXPLICIT_CHILD_DELAY_ROOT_CASE,
    FUNCTION_VARIANTS_CASE,
    INHERITED_VARIANT_VALUE_UPDATE_CASE,
    INSTANT_TRANSITION_CASE,
    INITIAL_FALSE_CASE,
    INITIAL_FALSE_EXPLICIT_CHILD_CASE,
    INITIAL_FALSE_PROPAGATION_CASE,
    KEYFRAME_TIMES_CASE,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_EASING_CASE,
    NAMED_VARIANTS_CASE,
    NESTED_CONTROLLED_VARIANTS_CASE,
    NEGATIVE_DELAY_CASE,
    NULL_KEYFRAME_CASE,
    REACTIVE_ANIMATE_CASE,
    REPEAT_REVERSE_CASE,
    REPEAT_DELAY_CASE,
    REPEAT_MIRROR_CASE,
    SPRING_CASE,
    STYLE_MOTION_VALUE_CASE,
    TRANSITION_FROM_CASE,
    UNSEEN_PROPERTY_CASE,
    VARIANT_INHERIT_OPT_OUT_CASE,
    VARIANT_PROPAGATION_CASE,
    VISIBILITY_REVEAL_CASE,
} from "./conformance/cases.js"
import { motion, useMotionValue } from "./motion/index.js"
import "./App.css"

/**
 * DECLARATIVE API GALLERY — ReactLynx edition.
 *
 * Kept equivalent to the Framer Motion web reference at
 * `lynx/web-reference/src/scene.tsx` (and `dev/react/src/tests/lynx-parity.tsx`).
 * The only differences are element names (`view`/`text`/`scroll-view` vs
 * `div`/`span`) and the `motion` import source. Every motion prop is identical.
 */

const page: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    backgroundColor: "#0b0b14",
}
const scroll: CSSProperties = { width: "100%", height: "100%" }
const inner: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    paddingTop: "28px",
    paddingBottom: "28px",
    paddingLeft: "20px",
    paddingRight: "20px",
}
const h1: CSSProperties = {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
}
const sub: CSSProperties = {
    color: "#8a8aa0",
    fontSize: "14px",
    fontFamily: "sans-serif",
    marginTop: "4px",
    marginBottom: "20px",
}
const card: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#14141f",
    borderRadius: "16px",
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingLeft: "20px",
    paddingRight: "20px",
    marginBottom: "14px",
    height: "104px",
}
const info: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0px",
    minWidth: "0px",
    marginRight: "12px",
}
const cardTitle: CSSProperties = {
    width: "100%",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    marginBottom: "4px",
}
const code: CSSProperties = {
    width: "100%",
    color: "#8ab4ff",
    fontSize: "12px",
    fontFamily: "monospace",
}
const demo: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "148px",
    height: "80px",
}
const dot: CSSProperties = {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const glyph: CSSProperties = {
    color: "#ffffff",
    fontSize: "26px",
    fontFamily: "sans-serif",
}
const small: CSSProperties = {
    width: "26px",
    height: "26px",
    borderRadius: "7px",
    marginLeft: "5px",
    marginRight: "5px",
}
const COLORS = ["#ff0088", "#ff8800", "#22cc88", "#3366ff"]

const HOISTED_ARRAY_VARIANTS = {
    base: { opacity: 1, scale: 1 },
    offset: { x: -28 },
    active: { x: 28, scale: 1.12, opacity: 0.8 },
}

const conformanceCard: CSSProperties = {
    ...card,
    height: "164px",
}
const badge: CSSProperties = {
    alignSelf: "flex-start",
    color: "#22cc88",
    fontSize: "11px",
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: "6px",
}
const provenance: CSSProperties = {
    width: "100%",
    color: "#a4a4b8",
    fontSize: "10px",
    fontFamily: "monospace",
    marginTop: "5px",
}

function ForwardingView(props: IntrinsicElements["view"]) {
    return <view {...props} />
}

const MotionForwardingView = motion.create(ForwardingView)

export function App() {
    const conformanceMode = lynx.__globalProps.conformanceMode
    const isolateTapLifecycle =
        conformanceMode === "tap-lifecycle" ||
        conformanceMode === "tap-rest-transition" ||
        conformanceMode === "tap-transition-end-only"
    const instantGestureRest =
        conformanceMode === "tap-rest-transition" ||
        conformanceMode === "hover-rest-transition"
    const animateTransitionEndOnly =
        conformanceMode === "animate-transition-end-only"
    const removedAnimateValues = conformanceMode === "removed-animate-values"
    const transformOriginMode = conformanceMode === "transform-origin"
    const complexGradientMode = conformanceMode === "complex-gradient"
    const variantPropagationMode = conformanceMode === "variant-propagation"
    const delayChildrenMode = conformanceMode === "delay-children"
    const variantInheritOptOutMode =
        conformanceMode === "variant-inherit-opt-out"
    const initialFalsePropagationMode =
        conformanceMode === "initial-false-propagation"
    const inheritedVariantLifecycleMode =
        conformanceMode === "inherited-variant-lifecycle"
    const inheritedVariantValueUpdateMode =
        conformanceMode === "inherited-variant-value-update"
    const deepVariantPropagationMode =
        conformanceMode === "deep-variant-propagation"
    const deepInitialFalsePropagationMode =
        conformanceMode === "deep-initial-false-propagation"
    const deepDelayChildrenMode =
        conformanceMode === "deep-delay-children"
    const explicitChildDelayRootMode =
        conformanceMode === "explicit-child-delay-root"
    const nestedControlledVariantsMode =
        conformanceMode === "nested-controlled-variants"
    const initialFalseExplicitChildMode =
        conformanceMode === "initial-false-explicit-child"
    const arrayVariantDefinitionParityMode =
        conformanceMode === "array-variant-definition-parity"
    const liveX = useMotionValue(STYLE_MOTION_VALUE_CASE.expected.startX)
    let styleMotionValueRenders = 0
    styleMotionValueRenders += 1
    function moveLiveValue() {
        liveX.set(STYLE_MOTION_VALUE_CASE.expected.endX)
    }
    const [tapCount, setTapCount] = useState(0)
    const [hoverCount, setHoverCount] = useState(0)
    const [gestureStatus, setGestureStatus] = useState("resting")
    const [unmountVisible, setUnmountVisible] = useState(true)
    const [unmountComplete, setUnmountComplete] = useState(0)
    const [initialFalseActive, setInitialFalseActive] = useState(false)
    const [initialFalseStarts, setInitialFalseStarts] = useState(0)
    const [displayRevealed, setDisplayRevealed] = useState(false)
    const [visibilityRevealed, setVisibilityRevealed] = useState(false)
    const [unseenPropertyActive, setUnseenPropertyActive] = useState(false)
    const [instantActive, setInstantActive] = useState(false)
    const [noOpStatus, setNoOpStatus] = useState("idle")
    const [noOpKeyframesStatus, setNoOpKeyframesStatus] = useState("idle")
    const [springVelocityStatus, setSpringVelocityStatus] = useState("idle")
    const [transitionFromActive, setTransitionFromActive] = useState(false)
    const [animateTransitionEndActive, setAnimateTransitionEndActive] =
        useState(false)
    const [animateTransitionEndLifecycle, setAnimateTransitionEndLifecycle] =
        useState<string[]>([])
    const [removedAnimateActive, setRemovedAnimateActive] = useState(true)
    const [transformOriginActive, setTransformOriginActive] = useState(false)
    const [complexGradientActive, setComplexGradientActive] = useState(false)
    const [variantPropagationActive, setVariantPropagationActive] =
        useState(false)
    const [delayChildrenActive, setDelayChildrenActive] = useState(false)
    const [deepDelayChildrenActive, setDeepDelayChildrenActive] =
        useState(false)
    const [nestedControlledOpen, setNestedControlledOpen] = useState(false)
    const [defaultTransitionActive, setDefaultTransitionActive] =
        useState(false)
    const [nullKeyframeActive, setNullKeyframeActive] = useState(false)
    const [reactiveActive, setReactiveActive] = useState(false)
    const [springActive, setSpringActive] = useState(false)
    const [delayActive, setDelayActive] = useState(false)
    const [negativeDelayActive, setNegativeDelayActive] = useState(false)
    const [reverseActive, setReverseActive] = useState(false)
    const [loopActive, setLoopActive] = useState(false)
    const [repeatDelayActive, setRepeatDelayActive] = useState(false)
    const [mirrorActive, setMirrorActive] = useState(false)
    const [keyframeTimesActive, setKeyframeTimesActive] = useState(false)
    const [namedEasingActive, setNamedEasingActive] = useState(false)
    const [namedActive, setNamedActive] = useState(false)
    const [arrayActive, setArrayActive] = useState(false)
    const [keyframesActive, setKeyframesActive] = useState(false)
    const [colorActive, setColorActive] = useState(false)
    const [colorRepresentationActive, setColorRepresentationActive] =
        useState(false)
    const [functionActive, setFunctionActive] = useState(false)
    const [lifecycleStatus, setLifecycleStatus] = useState("idle")
    const [lifecycleEvents, setLifecycleEvents] = useState("events")
    const [tapLifecycle, setTapLifecycle] = useState<string[]>([])
    const [inheritedVariantLifecycle, setInheritedVariantLifecycle] = useState<
        string[]
    >([])
    const [explicitChildLifecycle, setExplicitChildLifecycle] = useState<
        string[]
    >([])
    const [inheritedVariantX, setInheritedVariantX] = useState(
        INHERITED_VARIANT_VALUE_UPDATE_CASE.expected.initialX
    )

    return (
        <view style={page}>
            <scroll-view scroll-orientation="vertical" style={scroll}>
                <view style={inner}>
                    <text style={h1}>motion-lynx</text>
                    <text style={sub}>
                        the declarative motion/react API, running on Lynx
                    </text>

                    <text style={{ ...cardTitle, marginBottom: "10px" }}>
                        Conformance cases
                    </text>

                    {arrayVariantDefinitionParityMode && (
                        <view
                            id="example-array-variant-definition-parity"
                            style={conformanceCard}
                            bindtap={() => setArrayActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Array definition parity
                                </text>
                                <text style={code}>
                                    {arrayActive ? '["base", "active"]' : '["base", "offset"]'}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    id="target-array-variant-inline"
                                    style={{ ...small, backgroundColor: "#d3df63" }}
                                    initial={["base", "offset"]}
                                    animate={arrayActive ? ["base", "active"] : ["base", "offset"]}
                                    variants={{
                                        base: { opacity: 1, scale: 1 },
                                        offset: { x: ARRAY_VARIANT_DEFINITION_PARITY_CASE.expected.restX },
                                        active: {
                                            x: ARRAY_VARIANT_DEFINITION_PARITY_CASE.expected.activeX,
                                            scale: ARRAY_VARIANT_DEFINITION_PARITY_CASE.expected.activeScale,
                                            opacity: ARRAY_VARIANT_DEFINITION_PARITY_CASE.expected.activeOpacity,
                                        },
                                    }}
                                    transition={{ type: false }}
                                />
                                <motion.view
                                    id="target-array-variant-hoisted"
                                    style={{ ...small, backgroundColor: "#9b72f2" }}
                                    initial={["base", "offset"]}
                                    animate={arrayActive ? ["base", "active"] : ["base", "offset"]}
                                    variants={HOISTED_ARRAY_VARIANTS}
                                    transition={{ type: false }}
                                />
                            </view>
                        </view>
                    )}

                    {variantPropagationMode && (
                        <view
                            id="example-variant-propagation"
                            style={conformanceCard}
                            bindtap={() => setVariantPropagationActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Parent variant label
                                </text>
                                <text style={code}>
                                    {variantPropagationActive
                                        ? 'parent animate="visible"'
                                        : 'parent animate="hidden"'}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    animate={
                                        variantPropagationActive
                                            ? "visible"
                                            : "hidden"
                                    }
                                >
                                    <motion.view
                                        id="target-variant-propagation"
                                        style={{
                                            ...dot,
                                            backgroundColor: "#d3df63",
                                        }}
                                        variants={{
                                            hidden: {
                                                opacity:
                                                    VARIANT_PROPAGATION_CASE
                                                        .expected.hiddenOpacity,
                                                x: VARIANT_PROPAGATION_CASE
                                                    .expected.hiddenX,
                                            },
                                            visible: {
                                                opacity:
                                                    VARIANT_PROPAGATION_CASE
                                                        .expected.visibleOpacity,
                                                x: VARIANT_PROPAGATION_CASE
                                                    .expected.visibleX,
                                            },
                                        }}
                                        transition={{ type: false }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {delayChildrenMode && (
                        <view
                            id="example-delay-children"
                            style={conformanceCard}
                            bindtap={() => setDelayChildrenActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>Child delay</text>
                                <text style={code}>
                                    {`delayChildren: ${DELAY_CHILDREN_CASE.expected.delayMs / 1000}`}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial="hidden"
                                    animate={
                                        delayChildrenActive
                                            ? "visible"
                                            : "hidden"
                                    }
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                delayChildren:
                                                    DELAY_CHILDREN_CASE.expected
                                                        .delayMs / 1000,
                                            },
                                        },
                                    }}
                                >
                                    <motion.view
                                        id="target-delay-children"
                                        style={{
                                            ...dot,
                                            backgroundColor: "#d3df63",
                                        }}
                                        variants={{
                                            hidden: {
                                                opacity:
                                                    DELAY_CHILDREN_CASE.expected
                                                        .hiddenOpacity,
                                                x: DELAY_CHILDREN_CASE.expected
                                                    .hiddenX,
                                            },
                                            visible: {
                                                opacity:
                                                    DELAY_CHILDREN_CASE.expected
                                                        .visibleOpacity,
                                                x: DELAY_CHILDREN_CASE.expected
                                                    .visibleX,
                                            },
                                        }}
                                        transition={{ type: false }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {variantInheritOptOutMode && (
                        <view
                            id="example-variant-inherit-opt-out"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>Variant boundary</text>
                                <text style={code}>inherit={"{false}"}</text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial="hidden"
                                >
                                    <motion.view
                                        inherit={false}
                                        variants={{}}
                                    >
                                        <motion.view
                                            id="target-variant-inherit-opt-out"
                                            style={{
                                                ...dot,
                                                opacity:
                                                    VARIANT_INHERIT_OPT_OUT_CASE
                                                        .expected.opacity,
                                                x: VARIANT_INHERIT_OPT_OUT_CASE
                                                    .expected.x,
                                                backgroundColor: "#d3df63",
                                            }}
                                            variants={{
                                                hidden: {
                                                    opacity: 0,
                                                    x: -24,
                                                },
                                            }}
                                            transition={{ type: false }}
                                        />
                                    </motion.view>
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {initialFalsePropagationMode && (
                        <view
                            id="example-initial-false-propagation"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Inherited initial=false
                                </text>
                                <text style={code}>first frame: visible</text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial={false}
                                    animate="visible"
                                >
                                    <motion.view
                                        id="target-initial-false-propagation"
                                        style={{
                                            ...dot,
                                            backgroundColor: "#d3df63",
                                        }}
                                        variants={{
                                            hidden: { opacity: 0, x: -24 },
                                            visible: {
                                                opacity:
                                                    INITIAL_FALSE_PROPAGATION_CASE
                                                        .expected.opacity,
                                                x: INITIAL_FALSE_PROPAGATION_CASE
                                                    .expected.x,
                                            },
                                        }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {inheritedVariantLifecycleMode && (
                        <view
                            id="example-inherited-variant-lifecycle"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Inherited variant lifecycle
                                </text>
                                <text
                                    id="status-inherited-variant-lifecycle"
                                    style={code}
                                >
                                    {inheritedVariantLifecycle.join("|")}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view animate="visible">
                                    <motion.view
                                        id="target-inherited-variant-lifecycle"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1 },
                                        }}
                                        transition={{ duration: 0.05 }}
                                        onAnimationStart={(definition) =>
                                            setInheritedVariantLifecycle(
                                                (events) => [
                                                    ...events,
                                                    `start:${String(definition)}`,
                                                ]
                                            )
                                        }
                                        onAnimationComplete={(definition) =>
                                            setInheritedVariantLifecycle(
                                                (events) => [
                                                    ...events,
                                                    `complete:${String(definition)}`,
                                                ]
                                            )
                                        }
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {inheritedVariantValueUpdateMode && (
                        <view
                            id="example-inherited-variant-value-update"
                            style={conformanceCard}
                            bindtap={() =>
                                setInheritedVariantX(
                                    INHERITED_VARIANT_VALUE_UPDATE_CASE.expected
                                        .updatedX
                                )
                            }
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Reactive inherited variant
                                </text>
                                <text style={code}>x: {inheritedVariantX}</text>
                            </view>
                            <view style={demo}>
                                <motion.view initial={false} animate="variant">
                                    <motion.view
                                        id="target-inherited-variant-value-update"
                                        style={{
                                            ...dot,
                                            backgroundColor: "#d3df63",
                                        }}
                                        variants={{
                                            variant: { x: inheritedVariantX },
                                        }}
                                        transition={{ type: false }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {deepVariantPropagationMode && (
                        <view
                            id="example-deep-variant-propagation"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Deep variant propagation
                                </text>
                                <text style={code}>parent → wrapper → child</text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial="hidden"
                                    animate="visible"
                                    variants={{ hidden: {}, visible: {} }}
                                    transition={{ type: false }}
                                >
                                    <motion.view>
                                        <motion.view
                                            id="target-deep-variant-propagation"
                                            style={{
                                                ...dot,
                                                backgroundColor: "#d3df63",
                                            }}
                                            variants={{
                                                hidden: { opacity: 0.2 },
                                                visible: {
                                                    opacity:
                                                        DEEP_VARIANT_PROPAGATION_CASE
                                                            .expected.opacity,
                                                },
                                            }}
                                            transition={{ type: false }}
                                        />
                                    </motion.view>
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {deepInitialFalsePropagationMode && (
                        <view
                            id="example-deep-initial-false-propagation"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Deep initial=false
                                </text>
                                <text style={code}>first frame: visible</text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial={false}
                                    animate="visible"
                                >
                                    <motion.view>
                                        <motion.view
                                            id="target-deep-initial-false-propagation"
                                            style={{
                                                ...dot,
                                                backgroundColor: "#d3df63",
                                            }}
                                            variants={{
                                                hidden: { opacity: 0, x: -24 },
                                                visible: {
                                                    opacity:
                                                        DEEP_INITIAL_FALSE_PROPAGATION_CASE
                                                            .expected.opacity,
                                                    x: DEEP_INITIAL_FALSE_PROPAGATION_CASE
                                                        .expected.x,
                                                },
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </motion.view>
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {deepDelayChildrenMode && (
                        <view
                            id="example-deep-delay-children"
                            style={conformanceCard}
                            bindtap={() => setDeepDelayChildrenActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Accumulated child delay
                                </text>
                                <text style={code}>
                                    {`${DEEP_DELAY_CHILDREN_CASE.expected.delayStepMs}ms + ${DEEP_DELAY_CHILDREN_CASE.expected.delayStepMs}ms`}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    initial="hidden"
                                    animate={
                                        deepDelayChildrenActive
                                            ? "visible"
                                            : "hidden"
                                    }
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                delayChildren:
                                                    DEEP_DELAY_CHILDREN_CASE
                                                        .expected.delayStepMs /
                                                    1000,
                                            },
                                        },
                                    }}
                                >
                                    <motion.view
                                        variants={{
                                            hidden: {},
                                            visible: {
                                                transition: {
                                                    delayChildren:
                                                        DEEP_DELAY_CHILDREN_CASE
                                                            .expected
                                                            .delayStepMs / 1000,
                                                },
                                            },
                                        }}
                                    >
                                        <motion.view
                                            id="target-deep-delay-children"
                                            style={{
                                                ...dot,
                                                backgroundColor: "#d3df63",
                                            }}
                                            variants={{
                                                hidden: {
                                                    opacity:
                                                        DEEP_DELAY_CHILDREN_CASE
                                                            .expected
                                                            .hiddenOpacity,
                                                },
                                                visible: {
                                                    opacity:
                                                        DEEP_DELAY_CHILDREN_CASE
                                                            .expected
                                                            .visibleOpacity,
                                                },
                                            }}
                                            transition={{ type: false }}
                                        />
                                    </motion.view>
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {explicitChildDelayRootMode && (
                        <view
                            id="example-explicit-child-delay-root"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Explicit child delay root
                                </text>
                                <text style={code}>
                                    {`parent delay: ${EXPLICIT_CHILD_DELAY_ROOT_CASE.expected.parentDelayMs}ms`}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                delayChildren:
                                                    EXPLICIT_CHILD_DELAY_ROOT_CASE
                                                        .expected.parentDelayMs /
                                                    1000,
                                            },
                                        },
                                    }}
                                >
                                    <motion.view
                                        id="target-explicit-child-delay-root"
                                        style={{
                                            ...dot,
                                            backgroundColor: "#d3df63",
                                        }}
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: {
                                                opacity:
                                                    EXPLICIT_CHILD_DELAY_ROOT_CASE
                                                        .expected.hiddenOpacity,
                                            },
                                            visible: {
                                                opacity:
                                                    EXPLICIT_CHILD_DELAY_ROOT_CASE
                                                        .expected.visibleOpacity,
                                            },
                                        }}
                                        transition={{ type: false }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {nestedControlledVariantsMode && (
                        <view
                            id="example-nested-controlled-variants"
                            style={conformanceCard}
                            bindtap={() => setNestedControlledOpen(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Nested controlled variants
                                </text>
                                <text style={code}>
                                    {nestedControlledOpen ? "visible" : "hidden"}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    id="target-nested-controlled-parent"
                                    initial="hidden"
                                    animate={
                                        nestedControlledOpen
                                            ? "visible"
                                            : "hidden"
                                    }
                                    variants={{
                                        hidden: {
                                            opacity:
                                                NESTED_CONTROLLED_VARIANTS_CASE
                                                    .expected
                                                    .parentHiddenOpacity,
                                        },
                                        visible: {
                                            opacity:
                                                NESTED_CONTROLLED_VARIANTS_CASE
                                                    .expected
                                                    .parentVisibleOpacity,
                                        },
                                    }}
                                    transition={{ type: false }}
                                >
                                    <motion.view
                                        id="target-nested-controlled-child"
                                        style={{ ...dot, backgroundColor: "#d3df63" }}
                                        initial="hidden"
                                        animate={
                                            nestedControlledOpen
                                                ? "visible"
                                                : "hidden"
                                        }
                                        variants={{
                                            hidden: {
                                                opacity:
                                                    NESTED_CONTROLLED_VARIANTS_CASE
                                                        .expected
                                                        .childHiddenOpacity,
                                            },
                                            visible: {
                                                opacity:
                                                    NESTED_CONTROLLED_VARIANTS_CASE
                                                        .expected
                                                        .childVisibleOpacity,
                                            },
                                        }}
                                        transition={{ type: false }}
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {initialFalseExplicitChildMode && (
                        <view
                            id="example-initial-false-explicit-child"
                            style={conformanceCard}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Independent child mount animation
                                </text>
                                <text
                                    id="status-initial-false-explicit-child"
                                    style={code}
                                >
                                    {explicitChildLifecycle.join("|")}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view initial={false} animate="visible">
                                    <motion.view
                                        id="target-initial-false-explicit-child"
                                        style={{
                                            ...dot,
                                            opacity: 1,
                                            backgroundColor: "#d3df63",
                                        }}
                                        animate={{
                                            opacity:
                                                INITIAL_FALSE_EXPLICIT_CHILD_CASE
                                                    .expected.opacity,
                                        }}
                                        transition={{ duration: 0.05 }}
                                        onAnimationStart={() =>
                                            setExplicitChildLifecycle(
                                                (events) => [...events, "start"]
                                            )
                                        }
                                        onAnimationComplete={() =>
                                            setExplicitChildLifecycle(
                                                (events) => [
                                                    ...events,
                                                    "complete",
                                                ]
                                            )
                                        }
                                    />
                                </motion.view>
                            </view>
                        </view>
                    )}

                    {/* One manifest entry maps one upstream behavior to one card. */}
                    <view
                        id={`case-${MOTION_CREATE_CASE.id}`}
                        style={conformanceCard}
                    >
                        <view style={info}>
                            <text style={badge}>
                                {MOTION_CREATE_CASE.status.toUpperCase()}
                            </text>
                            <text style={cardTitle}>
                                {MOTION_CREATE_CASE.title}
                            </text>
                            <text style={code}>
                                {MOTION_CREATE_CASE.api.join(" · ")}
                            </text>
                            <text style={provenance}>
                                {`${MOTION_CREATE_CASE.upstream.sourceVersion} · ${MOTION_CREATE_CASE.upstream.testName}`}
                            </text>
                        </view>
                        <view style={demo}>
                            <MotionForwardingView
                                id={`target-${MOTION_CREATE_CASE.id}`}
                                style={{
                                    ...dot,
                                    backgroundColor: "#7c5cff",
                                }}
                                initial={{ opacity: 0.2, x: -24 }}
                                animate={{
                                    opacity:
                                        MOTION_CREATE_CASE.expected.opacity,
                                    x: MOTION_CREATE_CASE.expected.translateX,
                                }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            />
                        </view>
                    </view>

                    {/* reactive animate target */}
                    <view
                        id="example-reactive-target"
                        style={card}
                        bindtap={() => setReactiveActive((active) => !active)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Reactive target</text>
                            <text style={code}>
                                {reactiveActive
                                    ? `animate={{ x: ${REACTIVE_ANIMATE_CASE.expected.endX}, rotate: 12 }}`
                                    : `animate={{ x: ${REACTIVE_ANIMATE_CASE.expected.startX}, rotate: -12 }}`}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-reactive-target"
                                style={{
                                    ...dot,
                                    width: "76px",
                                    height: "42px",
                                    backgroundColor: "#d3df63",
                                }}
                                initial={{
                                    opacity: 0.4,
                                    x: REACTIVE_ANIMATE_CASE.expected.startX,
                                    rotate: -12,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: reactiveActive
                                        ? REACTIVE_ANIMATE_CASE.expected.endX
                                        : REACTIVE_ANIMATE_CASE.expected.startX,
                                    rotate: reactiveActive ? 12 : -12,
                                }}
                                transition={{
                                    duration:
                                        DISPLAY_REVEAL_CASE.expected
                                            .durationMs / 1000,
                                    ease: "linear",
                                }}
                            >
                                <text
                                    style={{
                                        ...glyph,
                                        color: "#202722",
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    TAP
                                </text>
                            </motion.view>
                        </view>
                    </view>

                    {/* explicit underdamped spring */}
                    <view
                        id="example-spring"
                        style={card}
                        bindtap={() => setSpringActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Spring — overshoot</text>
                            <text style={code}>
                                {springActive
                                    ? 'type: "spring" · settling'
                                    : "tap to run upstream spring"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-spring"
                                style={{ ...dot, backgroundColor: "#f06f44" }}
                                initial={{ x: SPRING_CASE.expected.startX }}
                                animate={{
                                    x: springActive
                                        ? SPRING_CASE.expected.endX
                                        : SPRING_CASE.expected.startX,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 140,
                                    damping: 10,
                                    mass: 1,
                                }}
                            />
                        </view>
                    </view>

                    {/* positive transition delay */}
                    <view
                        id="example-transition-delay"
                        style={card}
                        bindtap={() => setDelayActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>
                                Delay — hold, then move
                            </text>
                            <text style={code}>
                                {delayActive
                                    ? "delay: 0.4 · running"
                                    : "tap to verify delayed start"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-transition-delay"
                                style={{ ...dot, backgroundColor: "#21b8a6" }}
                                initial={{ x: DELAY_CASE.expected.startX }}
                                animate={{
                                    x: delayActive
                                        ? DELAY_CASE.expected.endX
                                        : DELAY_CASE.expected.startX,
                                }}
                                transition={{
                                    delay: DELAY_CASE.expected.delayMs / 1000,
                                    duration: 0.4,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* exact named variant target */}
                    <view
                        id="example-named-variants"
                        style={card}
                        bindtap={() => setNamedActive((active) => !active)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Named variants</text>
                            <text style={code}>
                                {namedActive
                                    ? 'animate="active"'
                                    : 'animate="rest"'}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-named-variants"
                                style={{
                                    ...dot,
                                    width: "76px",
                                    height: "42px",
                                    backgroundColor: "#7c5cff",
                                }}
                                initial="rest"
                                animate={namedActive ? "active" : "rest"}
                                variants={{
                                    rest: {
                                        opacity:
                                            NAMED_VARIANTS_CASE.expected
                                                .restOpacity,
                                        x: NAMED_VARIANTS_CASE.expected.restX,
                                        scale: 0.9,
                                    },
                                    active: {
                                        opacity:
                                            NAMED_VARIANTS_CASE.expected
                                                .activeOpacity,
                                        x: NAMED_VARIANTS_CASE.expected.activeX,
                                        scale: NAMED_VARIANTS_CASE.expected
                                            .activeScale,
                                        transition: {
                                            duration: 0.4,
                                            ease: "linear",
                                        },
                                    },
                                }}
                            />
                        </view>
                    </view>

                    {/* whileTap — interactive */}
                    <view id="example-gesture-priority" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Variants + whileTap</text>
                            <text style={code}>
                                {`whileTap="pressed" · ${gestureStatus}`}
                            </text>
                            <text
                                id="status-tap-animation-lifecycle"
                                style={code}
                            >
                                {tapLifecycle.length > 0
                                    ? tapLifecycle.join(" | ")
                                    : "lifecycle: waiting for press"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-gesture-priority"
                                style={{
                                    ...dot,
                                    width: "112px",
                                    backgroundColor: "#ffffff",
                                }}
                                initial="rest"
                                animate="rest"
                                whileHover={
                                    isolateTapLifecycle ? undefined : "hover"
                                }
                                whileTap="pressed"
                                variants={{
                                    rest: {
                                        scale: 1,
                                        opacity: 1,
                                        backgroundColor: "#ffffff",
                                        transition: instantGestureRest
                                            ? { type: false }
                                            : undefined,
                                    },
                                    pressed:
                                        conformanceMode ===
                                            "tap-transition-end-only"
                                            ? {
                                                  transition: { type: false },
                                                  transitionEnd: {
                                                      opacity: 0.4,
                                                  },
                                              }
                                            : {
                                                  scale: 1.15,
                                                  backgroundColor: "#ffcc00",
                                                  transition: {
                                                      duration: 0.2,
                                                      ease: "easeOut",
                                                  },
                                                  transitionEnd: {
                                                      opacity: 0.75,
                                                  },
                                              },
                                    hover: {
                                        scale: 1.08,
                                        opacity: 0.9,
                                        backgroundColor: "#8ab4ff",
                                        transition: { duration: 0.15 },
                                        transitionEnd: { opacity: 0.8 },
                                    },
                                }}
                                onHoverStart={() => {
                                    setHoverCount((count) => count + 1)
                                    setGestureStatus("hovering")
                                }}
                                onHoverEnd={() => setGestureStatus("resting")}
                                onTapStart={() => setGestureStatus("pressed")}
                                onTap={() => {
                                    setTapCount((count) => count + 1)
                                    setGestureStatus("tap complete")
                                }}
                                onTapCancel={() =>
                                    setGestureStatus("tap cancelled")
                                }
                                onAnimationStart={(definition) =>
                                    setTapLifecycle((events) => [
                                        ...events,
                                        `start:${String(definition)}`,
                                    ])
                                }
                                onAnimationComplete={(definition) =>
                                    setTapLifecycle((events) => [
                                        ...events,
                                        `complete:${String(definition)}`,
                                    ])
                                }
                            >
                                <text
                                    style={{
                                        ...glyph,
                                        color: "#0b0b14",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {tapCount
                                        ? `Tapped ${tapCount}`
                                        : hoverCount
                                          ? `Hovered ${hoverCount}`
                                          : "Press"}
                                </text>
                            </motion.view>
                        </view>
                    </view>

                    <view
                        id="case-initial-false"
                        style={conformanceCard}
                        bindtap={() =>
                            setInitialFalseActive((active) => !active)
                        }
                    >
                        <view style={info}>
                            <text style={badge}>
                                {INITIAL_FALSE_CASE.status.toUpperCase()}
                            </text>
                            <text style={cardTitle}>
                                {INITIAL_FALSE_CASE.title}
                            </text>
                            <text id="status-initial-false" style={code}>
                                {`initial={false} · starts:${initialFalseStarts}`}
                            </text>
                            <text style={provenance}>
                                {`${INITIAL_FALSE_CASE.upstream.sourceVersion} · ${INITIAL_FALSE_CASE.upstream.testName}`}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-initial-false"
                                style={{ ...dot, backgroundColor: "#ff4f7b" }}
                                initial={false}
                                animate={{
                                    opacity: 1,
                                    x: initialFalseActive ? 48 : [0, 24],
                                }}
                                transition={{ duration: 0.12 }}
                                onAnimationStart={() =>
                                    setInitialFalseStarts((count) => count + 1)
                                }
                            />
                        </view>
                    </view>

                    <view id="case-style-motion-value" style={conformanceCard}>
                        <view style={info}>
                            <text style={badge}>
                                {STYLE_MOTION_VALUE_CASE.status.toUpperCase()}
                            </text>
                            <text style={cardTitle}>
                                {STYLE_MOTION_VALUE_CASE.title}
                            </text>
                            <text id="status-style-motion-value" style={code}>
                                renders: {styleMotionValueRenders}
                            </text>
                            <text style={provenance}>
                                {`${STYLE_MOTION_VALUE_CASE.upstream.sourceVersion} · ${STYLE_MOTION_VALUE_CASE.upstream.testName}`}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-style-motion-value"
                                bindtap={moveLiveValue}
                                style={{
                                    ...dot,
                                    backgroundColor: "#45b7a7",
                                    x: liveX,
                                }}
                            />
                        </view>
                    </view>

                    {/* transition.from overrides the current value */}
                    <view
                        id="example-transition-from"
                        style={card}
                        bindtap={() => setTransitionFromActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>
                                Manual transition start
                            </text>
                            <text style={code}>from: 0 · target: 50</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-transition-from"
                                style={{ ...dot, backgroundColor: "#43a6c6" }}
                                initial={{
                                    x: TRANSITION_FROM_CASE.expected.initialX,
                                }}
                                animate={{
                                    x: transitionFromActive
                                        ? TRANSITION_FROM_CASE.expected.endX
                                        : TRANSITION_FROM_CASE.expected
                                              .initialX,
                                }}
                                transition={{
                                    from: TRANSITION_FROM_CASE.expected.fromX,
                                    duration:
                                        TRANSITION_FROM_CASE.expected
                                            .durationMs / 1000,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {animateTransitionEndOnly ? (
                        <view
                            id="example-animate-transition-end-only"
                            style={card}
                            bindtap={() =>
                                setAnimateTransitionEndActive(true)
                            }
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    transitionEnd-only animate
                                </text>
                                <text style={code}>tap · opacity 1 → 0.4</text>
                                <text
                                    id="status-animate-transition-end-only"
                                    style={code}
                                >
                                    {animateTransitionEndLifecycle.length > 0
                                        ? animateTransitionEndLifecycle.join(
                                              " | "
                                          )
                                        : "lifecycle: idle"}
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    id="target-animate-transition-end-only"
                                    style={{ ...dot, opacity: 1 }}
                                    animate={
                                        animateTransitionEndActive
                                            ? {
                                                  transitionEnd: {
                                                      opacity: 0.4,
                                                  },
                                              }
                                            : {}
                                    }
                                    transition={{ type: false }}
                                    onAnimationStart={() =>
                                        setAnimateTransitionEndLifecycle(
                                            (events) => [...events, "start"]
                                        )
                                    }
                                    onAnimationComplete={() =>
                                        setAnimateTransitionEndLifecycle(
                                            (events) => [...events, "complete"]
                                        )
                                    }
                                />
                            </view>
                        </view>
                    ) : null}

                    {removedAnimateValues ? (
                        <view
                            id="example-removed-animate-values"
                            style={card}
                            bindtap={() => setRemovedAnimateActive(false)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>
                                    Removed animate values
                                </text>
                                <text style={code}>
                                    initial fallback · current initial · retain
                                </text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    id="target-removed-original"
                                    style={{ ...dot, backgroundColor: "#7784c8" }}
                                    initial={{ opacity: 0 }}
                                    animate={
                                        removedAnimateActive
                                            ? { opacity: 1 }
                                            : {}
                                    }
                                    transition={{ type: false }}
                                />
                                <motion.view
                                    id="target-removed-current"
                                    style={{ ...dot, backgroundColor: "#43a6c6" }}
                                    initial={{
                                        opacity: removedAnimateActive ? 0 : 0.5,
                                    }}
                                    animate={
                                        removedAnimateActive
                                            ? { opacity: 1 }
                                            : {}
                                    }
                                    transition={{ type: false }}
                                />
                                <motion.view
                                    id="target-removed-both"
                                    style={{ ...dot, backgroundColor: "#22cc88" }}
                                    initial={
                                        removedAnimateActive ? { x: 0 } : {}
                                    }
                                    animate={
                                        removedAnimateActive ? { x: 24 } : {}
                                    }
                                    transition={{ type: false }}
                                />
                            </view>
                        </view>
                    ) : null}

                    {transformOriginMode ? (
                        <view
                            id="example-transform-origin"
                            style={card}
                            bindtap={() => setTransformOriginActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>Transform origin</text>
                                <text style={code}>0% 0% → 100% 100%</text>
                            </view>
                            <view style={demo}>
                                <view
                                    id="control-transform-origin"
                                    style={{
                                        ...dot,
                                        backgroundColor: "#7784c8",
                                        transformOrigin: transformOriginActive
                                            ? "100% 100%"
                                            : "0% 0%",
                                    }}
                                />
                                <motion.view
                                    id="target-transform-origin"
                                    style={{ ...dot, backgroundColor: "#9368c7" }}
                                    initial={{ originX: 0, originY: 0 }}
                                    animate={
                                        transformOriginActive
                                            ? { originX: 1, originY: 1 }
                                            : { originX: 0, originY: 0 }
                                    }
                                    transition={{ type: false }}
                                />
                            </view>
                        </view>
                    ) : null}

                    {complexGradientMode ? (
                        <view
                            id="example-complex-gradient"
                            style={card}
                            bindtap={() => setComplexGradientActive(true)}
                        >
                            <view style={info}>
                                <text style={cardTitle}>Complex gradient</text>
                                <text style={code}>120deg → 0deg</text>
                            </view>
                            <view style={demo}>
                                <motion.view
                                    id="target-complex-gradient"
                                    style={{
                                        ...dot,
                                        width: "96px",
                                        background:
                                            "linear-gradient(120deg, hsl(216, 100%, 50%) 0%, hsl(301, 100%, 50%) 100%)",
                                    }}
                                    animate={{
                                        background: complexGradientActive
                                            ? "linear-gradient(0deg, hsl(216, 100%, 50%) 0%, hsl(301, 100%, 50%) 100%)"
                                            : "linear-gradient(120deg, hsl(216, 100%, 50%) 0%, hsl(301, 100%, 50%) 100%)",
                                    }}
                                    transition={{ duration: 0.4, ease: "linear" }}
                                />
                            </view>
                        </view>
                    ) : null}

                    {/* equal initial/animate values remain a no-op */}
                    <view id="example-noop-target" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>No-op target</text>
                            <text id="status-noop-target" style={code}>
                                {noOpStatus}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-noop-target"
                                style={{ ...dot, backgroundColor: "#7784c8" }}
                                initial={{ opacity: 1, x: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    opacity: { duration: 0.4, velocity: 100 },
                                    x: { type: "spring", velocity: 0 },
                                }}
                                onAnimationStart={() =>
                                    setNoOpStatus("animating")
                                }
                                onAnimationComplete={() =>
                                    setNoOpStatus("idle")
                                }
                            />
                        </view>
                    </view>

                    {/* equal keyframe arrays remain a no-op */}
                    <view id="example-noop-keyframes" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>No-op keyframes</text>
                            <text id="status-noop-keyframes" style={code}>
                                {noOpKeyframesStatus}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-noop-keyframes"
                                style={{ ...dot, backgroundColor: "#9368c7" }}
                                initial={{ opacity: 1, x: 0 }}
                                animate={{ opacity: [1, 1], x: [0, 0] }}
                                transition={{
                                    opacity: {
                                        duration: 2,
                                        type: "tween",
                                        velocity: 100,
                                    },
                                    x: { type: "spring", velocity: 0 },
                                }}
                                onAnimationStart={() =>
                                    setNoOpKeyframesStatus("animating")
                                }
                                onAnimationComplete={() =>
                                    setNoOpKeyframesStatus("idle")
                                }
                            />
                        </view>
                    </view>

                    {/* spring velocity animates even when target equals origin */}
                    <view id="example-spring-velocity" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Spring velocity</text>
                            <text id="status-spring-velocity" style={code}>
                                {springVelocityStatus}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-spring-velocity"
                                style={{ ...dot, backgroundColor: "#cf6b61" }}
                                initial={{ opacity: 1 }}
                                animate={{
                                    opacity: 1,
                                    transition: {
                                        type: "spring",
                                        velocity: 100,
                                    },
                                }}
                                onAnimationStart={() =>
                                    setSpringVelocityStatus("animating")
                                }
                                onAnimationComplete={() =>
                                    setSpringVelocityStatus("idle")
                                }
                            />
                        </view>
                    </view>

                    {/* zIndex is applied discretely rather than interpolated */}
                    <view id="example-z-index" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Discrete zIndex</text>
                            <text style={code}>
                                animate: 100 · no interpolation
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-z-index"
                                style={{ ...dot, backgroundColor: "#5e8fc7" }}
                                animate={{ zIndex: 100 }}
                                transition={{ duration: 2 }}
                            />
                        </view>
                    </view>

                    {/* unknown animation types fall back without crashing */}
                    <view id="example-unknown-animation-type" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>
                                Unknown animation type
                            </text>
                            <text style={code}>
                                type: "test" · resilient fallback
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-unknown-animation-type"
                                style={{ ...dot, backgroundColor: "#6e9b71" }}
                                animate={{ x: 20 }}
                                transition={{ type: "test" } as any}
                            />
                        </view>
                    </view>

                    {/* zero-valued units normalize to an animatable number */}
                    <view id="example-zero-unit" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>
                                Zero-unit normalization
                            </text>
                            <text style={code}>borderRadius: 0px → 20</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-zero-unit"
                                style={{
                                    ...dot,
                                    backgroundColor: "#b27b51",
                                    borderRadius: "0px",
                                }}
                                animate={{ borderRadius: 20 }}
                                transition={{ duration: 0.01 }}
                            />
                        </view>
                    </view>

                    {/* CSS custom properties pass through the style path */}
                    <view id="example-css-variable" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>
                                CSS variable · partial
                            </text>
                            <text style={code}>Web #000 · native gap #57</text>
                        </view>
                        <view style={demo}>
                            <view
                                id="target-css-variable-static-control"
                                style={
                                    {
                                        ...dot,
                                        backgroundColor: "var(--static-color)",
                                        "--static-color": "#000",
                                    } as any
                                }
                            />
                            <motion.view
                                id="target-css-variable"
                                style={{
                                    ...dot,
                                    backgroundColor: "var(--motion-color)",
                                    "--motion-color": "#fff",
                                }}
                                animate={{ "--motion-color": "#000" }}
                                transition={{ type: false }}
                            />
                        </view>
                    </view>

                    {/* transition type false applies the target immediately */}
                    <view
                        id="example-instant-transition"
                        style={card}
                        bindtap={() => setInstantActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Instant transition</text>
                            <text style={code}>type: false · no tween</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-instant-transition"
                                style={{ ...dot, backgroundColor: "#db6e62" }}
                                initial={{
                                    x: INSTANT_TRANSITION_CASE.expected.startX,
                                }}
                                animate={{
                                    x: instantActive
                                        ? INSTANT_TRANSITION_CASE.expected.endX
                                        : INSTANT_TRANSITION_CASE.expected
                                              .startX,
                                }}
                                transition={{ type: false }}
                            />
                        </view>
                    </view>

                    {/* a later target can introduce a new transform property */}
                    <view
                        id="example-unseen-property"
                        style={card}
                        bindtap={() => setUnseenPropertyActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>New target property</text>
                            <text style={code}>
                                x retained · y introduced later
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-unseen-property"
                                style={{ ...dot, backgroundColor: "#4cb79d" }}
                                initial={{
                                    x: UNSEEN_PROPERTY_CASE.expected.x,
                                }}
                                animate={
                                    unseenPropertyActive
                                        ? {
                                              x: UNSEEN_PROPERTY_CASE.expected
                                                  .x,
                                              y: UNSEEN_PROPERTY_CASE.expected
                                                  .endY,
                                          }
                                        : {
                                              x: UNSEEN_PROPERTY_CASE.expected
                                                  .x,
                                          }
                                }
                                transition={{ duration: 0.2, ease: "linear" }}
                            />
                        </view>
                    </view>

                    {/* discrete display reveals before the opacity entrance */}
                    <view
                        id="example-display-reveal"
                        style={card}
                        bindtap={() => setDisplayRevealed(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Show, then fade in</text>
                            <text style={code}>display: none → block</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-display-reveal"
                                style={{ ...dot, backgroundColor: "#55b89e" }}
                                initial={{ display: "none", opacity: 0 }}
                                animate={
                                    displayRevealed
                                        ? { display: "block", opacity: 1 }
                                        : { display: "none", opacity: 0 }
                                }
                                transition={{
                                    duration:
                                        VISIBILITY_REVEAL_CASE.expected
                                            .durationMs / 1000,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* discrete visibility reveals before opacity entrance */}
                    <view
                        id="example-visibility-reveal"
                        style={card}
                        bindtap={() => setVisibilityRevealed(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Reveal, then fade in</text>
                            <text style={code}>
                                visibility: hidden → visible
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-visibility-reveal"
                                style={{ ...dot, backgroundColor: "#7e85dc" }}
                                initial={{ visibility: "hidden", opacity: 0 }}
                                animate={
                                    visibilityRevealed
                                        ? { visibility: "visible", opacity: 1 }
                                        : { visibility: "hidden", opacity: 0 }
                                }
                                transition={{ duration: 0.4, ease: "linear" }}
                            />
                        </view>
                    </view>

                    {/* unmount cancels an active animation */}
                    <view
                        id="example-unmount-cancel"
                        style={card}
                        bindtap={() => setUnmountVisible(false)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Unmount cancellation</text>
                            <text id="status-unmount-cancel" style={code}>
                                complete: {unmountComplete}
                            </text>
                        </view>
                        <view style={demo}>
                            {unmountVisible ? (
                                <motion.view
                                    id="target-unmount-cancel"
                                    style={{
                                        ...dot,
                                        backgroundColor: "#cf76a4",
                                    }}
                                    initial={{ x: -40 }}
                                    animate={{ x: 40 }}
                                    transition={{ duration: 2, ease: "linear" }}
                                    onAnimationComplete={() =>
                                        setUnmountComplete((count) => count + 1)
                                    }
                                />
                            ) : (
                                <text
                                    id="target-unmount-placeholder"
                                    style={code}
                                >
                                    unmounted
                                </text>
                            )}
                        </view>
                    </view>

                    {/* null keyframe hydrates from the current MotionValue */}
                    <view
                        id="example-null-keyframe"
                        style={card}
                        bindtap={() => setNullKeyframeActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Null keyframe</text>
                            <text style={code}>
                                [null, end] · current value
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-null-keyframe"
                                style={{ ...dot, backgroundColor: "#e074b8" }}
                                initial={{
                                    x: NULL_KEYFRAME_CASE.expected.startX,
                                }}
                                animate={{
                                    x: nullKeyframeActive
                                        ? [
                                              null,
                                              NULL_KEYFRAME_CASE.expected.endX,
                                          ]
                                        : NULL_KEYFRAME_CASE.expected.startX,
                                }}
                                transition={{
                                    duration:
                                        NULL_KEYFRAME_CASE.expected.durationMs /
                                        1000,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* transition.default overrides top-level fallback */}
                    <view
                        id="example-default-transition"
                        style={card}
                        bindtap={() => setDefaultTransitionActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Default transition</text>
                            <text style={code}>
                                default delay · top-level ignored
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-default-transition"
                                style={{ ...dot, backgroundColor: "#75b95b" }}
                                initial={{
                                    x: DEFAULT_TRANSITION_CASE.expected.startX,
                                }}
                                animate={{
                                    x: defaultTransitionActive
                                        ? DEFAULT_TRANSITION_CASE.expected.endX
                                        : DEFAULT_TRANSITION_CASE.expected
                                              .startX,
                                }}
                                transition={{
                                    duration: 0.01,
                                    default: {
                                        delay:
                                            DEFAULT_TRANSITION_CASE.expected
                                                .delayMs / 1000,
                                        duration:
                                            DEFAULT_TRANSITION_CASE.expected
                                                .durationMs / 1000,
                                        ease: "linear",
                                    },
                                }}
                            />
                        </view>
                    </view>

                    {/* negative delay starts from elapsed time */}
                    <view
                        id="example-negative-delay"
                        style={card}
                        bindtap={() => setNegativeDelayActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Negative delay</text>
                            <text style={code}>
                                {negativeDelayActive
                                    ? "delay: -0.2 · elapsed"
                                    : "tap to start halfway"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-negative-delay"
                                style={{ ...dot, backgroundColor: "#e4588c" }}
                                initial={{
                                    x: NEGATIVE_DELAY_CASE.expected.startX,
                                }}
                                animate={{
                                    x: negativeDelayActive
                                        ? NEGATIVE_DELAY_CASE.expected.endX
                                        : NEGATIVE_DELAY_CASE.expected.startX,
                                }}
                                transition={{
                                    delay:
                                        NEGATIVE_DELAY_CASE.expected.delayMs /
                                        1000,
                                    duration:
                                        NEGATIVE_DELAY_CASE.expected
                                            .durationMs / 1000,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* repeat endpoint hold */}
                    <view
                        id="example-repeat-delay"
                        style={card}
                        bindtap={() => setRepeatDelayActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Repeat delay</text>
                            <text style={code}>
                                {repeatDelayActive
                                    ? "run · hold · run"
                                    : "tap to verify endpoint hold"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-repeat-delay"
                                style={{ ...dot, backgroundColor: "#f2a93b" }}
                                initial={{
                                    scale: REPEAT_DELAY_CASE.expected
                                        .startScale,
                                }}
                                animate={{
                                    scale: repeatDelayActive
                                        ? REPEAT_DELAY_CASE.expected.endScale
                                        : REPEAT_DELAY_CASE.expected.startScale,
                                }}
                                transition={{
                                    duration:
                                        REPEAT_DELAY_CASE.expected.durationMs /
                                        1000,
                                    ease: "linear",
                                    repeat: 1,
                                    repeatDelay:
                                        REPEAT_DELAY_CASE.expected.holdMs /
                                        1000,
                                }}
                            />
                        </view>
                    </view>

                    {/* mirror swaps endpoints without reversing easeIn */}
                    <view
                        id="example-repeat-mirror"
                        style={card}
                        bindtap={() => setMirrorActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Mirror repeat</text>
                            <text style={code}>
                                {mirrorActive
                                    ? "easeIn · mirror · easeIn"
                                    : "tap to mirror easing"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-repeat-mirror"
                                style={{ ...dot, backgroundColor: "#35b6a0" }}
                                initial={{
                                    x: REPEAT_MIRROR_CASE.expected.startX,
                                }}
                                animate={{
                                    x: mirrorActive
                                        ? REPEAT_MIRROR_CASE.expected.endX
                                        : REPEAT_MIRROR_CASE.expected.startX,
                                }}
                                transition={{
                                    duration:
                                        REPEAT_MIRROR_CASE.expected.durationMs /
                                        1000,
                                    ease: "easeIn",
                                    repeat: 1,
                                    repeatType: "mirror",
                                }}
                            />
                        </view>
                    </view>

                    {/* duplicate keyframe offsets */}
                    <view
                        id="example-keyframe-times"
                        style={card}
                        bindtap={() => setKeyframeTimesActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Keyframe times</text>
                            <text style={code}>
                                {keyframeTimesActive
                                    ? "times: [0, 0, 1, 1]"
                                    : "tap to verify boundary jumps"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-keyframe-times"
                                style={{ ...dot, backgroundColor: "#6f74e8" }}
                                initial={{
                                    x: KEYFRAME_TIMES_CASE.expected.startX,
                                }}
                                animate={{
                                    x: keyframeTimesActive
                                        ? [
                                              KEYFRAME_TIMES_CASE.expected
                                                  .startX,
                                              KEYFRAME_TIMES_CASE.expected
                                                  .secondX,
                                              KEYFRAME_TIMES_CASE.expected
                                                  .thirdX,
                                              KEYFRAME_TIMES_CASE.expected.endX,
                                          ]
                                        : KEYFRAME_TIMES_CASE.expected.startX,
                                }}
                                transition={{
                                    duration:
                                        KEYFRAME_TIMES_CASE.expected
                                            .durationMs / 1000,
                                    ease: "linear",
                                    times: [0, 0, 1, 1],
                                }}
                            />
                        </view>
                    </view>

                    {/* named easing against a simultaneous linear control */}
                    <view
                        id="example-named-easing"
                        style={card}
                        bindtap={() => setNamedEasingActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Named easing</text>
                            <text style={code}>
                                {namedEasingActive
                                    ? "easeInOut vs linear"
                                    : "tap to compare curves"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-named-easing"
                                style={{ ...small, backgroundColor: "#9b72f2" }}
                                initial={{
                                    x: NAMED_EASING_CASE.expected.startX,
                                }}
                                animate={{
                                    x: namedEasingActive
                                        ? NAMED_EASING_CASE.expected.endX
                                        : NAMED_EASING_CASE.expected.startX,
                                }}
                                transition={{
                                    duration:
                                        NAMED_EASING_CASE.expected.durationMs /
                                        1000,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.view
                                id="target-linear-easing-control"
                                style={{ ...small, backgroundColor: "#a4a4b8" }}
                                initial={{
                                    x: NAMED_EASING_CASE.expected.startX,
                                }}
                                animate={{
                                    x: namedEasingActive
                                        ? NAMED_EASING_CASE.expected.endX
                                        : NAMED_EASING_CASE.expected.startX,
                                }}
                                transition={{
                                    duration:
                                        NAMED_EASING_CASE.expected.durationMs /
                                        1000,
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* array variants */}
                    <view
                        id="example-array-variants"
                        style={card}
                        bindtap={() => setArrayActive((active) => !active)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>
                                Array variants — merge
                            </text>
                            <text style={code}>
                                {arrayActive
                                    ? 'animate={["base", "active"]}'
                                    : 'animate={["base", "offset"]}'}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-array-variants"
                                style={{ ...dot, width: "88px" }}
                                initial="base"
                                animate={
                                    arrayActive
                                        ? ["base", "active"]
                                        : ["base", "offset"]
                                }
                                variants={{
                                    base: {
                                        opacity: 1,
                                        scale: 1,
                                        backgroundColor: "#dec991",
                                    },
                                    offset: { x: -28, rotate: -8 },
                                    active: {
                                        x: 28,
                                        rotate: 8,
                                        scale: 1.12,
                                        backgroundColor: "#d94d35",
                                    },
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </view>
                    </view>

                    {/* loop — continuous rotate */}
                    <view id="example-repeat-infinity" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Loop — spin forever</text>
                            <text style={code}>
                                animate={"{{"} rotate: 360 {"}}"} · repeat:
                                Infinity
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-repeat-infinity"
                                style={{ ...dot, backgroundColor: "#3366ff" }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 2,
                                }}
                            >
                                <text style={glyph}>↻</text>
                            </motion.view>
                        </view>
                    </view>

                    {/* finite ordered keyframes */}
                    <view
                        id="example-keyframes"
                        style={card}
                        bindtap={() => setKeyframesActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Keyframes — bounce</text>
                            <text style={code}>
                                {keyframesActive
                                    ? "y: [0, -34, 12]"
                                    : "tap to run keyframes"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-keyframes"
                                style={{ ...dot, backgroundColor: "#22cc88" }}
                                initial={{ y: KEYFRAMES_CASE.expected.startY }}
                                animate={{
                                    y: keyframesActive
                                        ? [
                                              KEYFRAMES_CASE.expected.startY,
                                              KEYFRAMES_CASE.expected.peakY,
                                              KEYFRAMES_CASE.expected.endY,
                                          ]
                                        : KEYFRAMES_CASE.expected.startY,
                                }}
                                transition={{ duration: 0.6, ease: "linear" }}
                            />
                        </view>
                    </view>

                    {/* reverse — breathing scale */}
                    <view
                        id="example-repeat-reverse"
                        style={card}
                        bindtap={() => setReverseActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Reverse — return</text>
                            <text style={code}>
                                {reverseActive
                                    ? '1 → 1.35 → 1 · repeatType: "reverse"'
                                    : "tap to run reverse repeat"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-repeat-reverse"
                                style={{
                                    ...dot,
                                    backgroundColor: "#ff0088",
                                    borderRadius: "28px",
                                }}
                                initial={{
                                    scale: REPEAT_REVERSE_CASE.expected
                                        .startScale,
                                }}
                                animate={{
                                    scale: reverseActive
                                        ? REPEAT_REVERSE_CASE.expected.peakScale
                                        : REPEAT_REVERSE_CASE.expected
                                              .startScale,
                                }}
                                transition={{
                                    repeat: 1,
                                    repeatType: "reverse",
                                    ease: "linear",
                                    duration: 0.4,
                                }}
                            />
                        </view>
                    </view>

                    {/* loop repeat — odd repeat settles at target */}
                    <view
                        id="example-repeat-loop-final"
                        style={card}
                        bindtap={() => setLoopActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Loop — final target</text>
                            <text style={code}>0 → 20 · repeat: 1 · loop</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-repeat-loop-final"
                                style={{ ...dot, backgroundColor: "#4f93a8" }}
                                initial={{ x: 0 }}
                                animate={{ x: loopActive ? [0, 20] : 0 }}
                                transition={{
                                    type: "tween",
                                    duration: 0.1,
                                    repeatDelay: 0.1,
                                    repeat: 1,
                                    repeatType: "loop",
                                    ease: "linear",
                                }}
                            />
                        </view>
                    </view>

                    {/* color keyframes */}
                    <view
                        id="example-color-keyframes"
                        style={card}
                        bindtap={() => setColorActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>Color keyframes</text>
                            <text style={code}>
                                {colorActive
                                    ? "#f00 → #0f0 → #00f"
                                    : "tap to run color keyframes"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-color-keyframes"
                                style={{ ...dot, width: "112px" }}
                                initial={{ backgroundColor: "#ff0000" }}
                                animate={{
                                    backgroundColor: colorActive
                                        ? ["#ff0000", "#00ff00", "#0000ff"]
                                        : "#ff0000",
                                }}
                                transition={{
                                    ease: "linear",
                                    duration: 0.8,
                                }}
                            />
                        </view>
                    </view>

                    {/* color interpolation across HSLA and RGBA representations */}
                    <view
                        id="example-color-representation"
                        style={card}
                        bindtap={() => setColorRepresentationActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>HSLA to RGBA</text>
                            <text style={code}>
                                cross-representation color mix
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                id="target-color-representation"
                                style={{ ...dot, width: "112px" }}
                                initial={{
                                    backgroundColor: "hsla(345, 100%, 60%, 1)",
                                }}
                                animate={{
                                    backgroundColor: colorRepresentationActive
                                        ? "rgba(0, 136, 255, 1)"
                                        : "hsla(345, 100%, 60%, 1)",
                                }}
                                transition={{ ease: "linear", duration: 0.4 }}
                            />
                        </view>
                    </view>

                    {/* function variants with custom-owned delay */}
                    <view
                        id="example-function-variant"
                        style={conformanceCard}
                        bindtap={() => setFunctionActive(true)}
                    >
                        <view style={info}>
                            <text style={cardTitle}>
                                Function variants — custom delay
                            </text>
                            <text style={code}>
                                {functionActive
                                    ? `custom delay · Lifecycle ${lifecycleStatus}`
                                    : "tap to resolve custom variants"}
                            </text>
                            <text
                                id="events-animation-lifecycle"
                                style={{ ...code, color: "#a4a4b8" }}
                            >
                                {lifecycleEvents}
                            </text>
                        </view>
                        <view style={demo}>
                            {COLORS.map((c, i) => (
                                <motion.view
                                    key={i}
                                    id={`target-function-variant-${i}`}
                                    style={{ ...small, backgroundColor: c }}
                                    initial="hidden"
                                    animate={
                                        functionActive ? "visible" : "hidden"
                                    }
                                    custom={i}
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            y: 20,
                                            scale: 0.3,
                                        },
                                        visible: (index) => ({
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                duration: 0.6,
                                                delay:
                                                    Number(index) *
                                                    FUNCTION_VARIANTS_CASE
                                                        .expected.delayStep,
                                                ease: "backOut",
                                            },
                                        }),
                                    }}
                                    onAnimationStart={
                                        functionActive && i === 0
                                            ? (definition) => {
                                                  const label =
                                                      String(definition)
                                                  setLifecycleStatus(
                                                      `start:${label}`
                                                  )
                                                  setLifecycleEvents(
                                                      `events:start:${label}`
                                                  )
                                              }
                                            : undefined
                                    }
                                    onAnimationComplete={
                                        functionActive && i === 0
                                            ? (definition) => {
                                                  const label =
                                                      String(definition)
                                                  setLifecycleStatus(
                                                      `complete:${label}`
                                                  )
                                                  setLifecycleEvents(
                                                      (events) =>
                                                          `${events}|complete:${label}`
                                                  )
                                              }
                                            : undefined
                                    }
                                />
                            ))}
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    )
}
