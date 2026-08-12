import { motion, useMotionValue } from "framer-motion"
import { CSSProperties, forwardRef, useState } from "react"
import type { ComponentPropsWithoutRef } from "react"
import {
    DELAY_CASE,
    DEFAULT_TRANSITION_CASE,
    DISPLAY_REVEAL_CASE,
    FUNCTION_VARIANTS_CASE,
    INSTANT_TRANSITION_CASE,
    INITIAL_FALSE_CASE,
    KEYFRAME_TIMES_CASE,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_EASING_CASE,
    NAMED_VARIANTS_CASE,
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
    VARIANT_PROPAGATION_CASE,
    VISIBILITY_REVEAL_CASE,
} from "../../src/conformance/cases"

/**
 * DECLARATIVE API GALLERY — Framer Motion web reference.
 *
 * The original-React baseline the ReactLynx port (`lynx/src/App.tsx`) is
 * verified against, side by side, in a headless browser. The two files are kept
 * equivalent: only the element names (`div`/`span` vs `view`/`text`/
 * `scroll-view`) and the `motion` import source differ. Every motion prop is
 * identical.
 */

const page: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#0b0b14",
    margin: 0,
    boxSizing: "border-box",
}
const scroll: CSSProperties = {
    width: "100%",
    height: "100%",
    overflowY: "auto",
}
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
    flexShrink: 0,
}
const info: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
}
const cardTitle: CSSProperties = {
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    marginBottom: "4px",
}
const code: CSSProperties = {
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

const conformanceCard: CSSProperties = {
    ...card,
    height: 164,
}
const badge: CSSProperties = {
    alignSelf: "flex-start",
    color: "#22cc88",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 6,
}
const provenance: CSSProperties = {
    width: "100%",
    color: "#a4a4b8",
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 5,
}

const ForwardingDiv = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<"div">
>((props, ref) => <div ref={ref} {...props} />)

const MotionForwardingDiv = motion.create(ForwardingDiv)

export function App() {
    const conformanceMode = new URLSearchParams(window.location.search).get(
        "case"
    )
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
    const liveX = useMotionValue(STYLE_MOTION_VALUE_CASE.expected.startX)
    let styleMotionValueRenders = 0
    styleMotionValueRenders += 1
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

    return (
        <div style={page}>
            <div style={scroll}>
                <div style={inner}>
                    <span style={h1}>motion-lynx</span>
                    <span style={sub}>
                        the declarative motion/react API, running on Lynx
                    </span>

                    <span style={{ ...cardTitle, marginBottom: 10 }}>
                        Conformance cases
                    </span>

                    {variantPropagationMode && (
                        <div
                            id="example-variant-propagation"
                            style={conformanceCard}
                            onClick={() => setVariantPropagationActive(true)}
                        >
                            <div style={info}>
                                <span style={cardTitle}>
                                    Parent variant label
                                </span>
                                <span style={code}>
                                    {variantPropagationActive
                                        ? 'parent animate="visible"'
                                        : 'parent animate="hidden"'}
                                </span>
                            </div>
                            <div style={demo}>
                                <motion.div
                                    animate={
                                        variantPropagationActive
                                            ? "visible"
                                            : "hidden"
                                    }
                                >
                                    <motion.div
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
                                </motion.div>
                            </div>
                        </div>
                    )}

                    <div
                        id={`case-${MOTION_CREATE_CASE.id}`}
                        style={conformanceCard}
                    >
                        <div style={info}>
                            <span style={badge}>
                                {MOTION_CREATE_CASE.status.toUpperCase()}
                            </span>
                            <span style={cardTitle}>
                                {MOTION_CREATE_CASE.title}
                            </span>
                            <span style={code}>
                                {MOTION_CREATE_CASE.api.join(" · ")}
                            </span>
                            <span style={provenance}>
                                {`${MOTION_CREATE_CASE.upstream.sourceVersion} · ${MOTION_CREATE_CASE.upstream.testName}`}
                            </span>
                        </div>
                        <div style={demo}>
                            <MotionForwardingDiv
                                id={`target-${MOTION_CREATE_CASE.id}`}
                                style={{ ...dot, backgroundColor: "#7c5cff" }}
                                initial={{ opacity: 0.2, x: -24 }}
                                animate={{
                                    opacity:
                                        MOTION_CREATE_CASE.expected.opacity,
                                    x: MOTION_CREATE_CASE.expected.translateX,
                                }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div
                        id="example-reactive-target"
                        style={card}
                        onClick={() => setReactiveActive((active) => !active)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Reactive target</span>
                            <span style={code}>
                                {reactiveActive
                                    ? `animate={{ x: ${REACTIVE_ANIMATE_CASE.expected.endX}, rotate: 12 }}`
                                    : `animate={{ x: ${REACTIVE_ANIMATE_CASE.expected.startX}, rotate: -12 }}`}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-reactive-target"
                                style={{
                                    ...dot,
                                    width: 76,
                                    height: 42,
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
                                <span
                                    style={{
                                        ...glyph,
                                        color: "#202722",
                                        fontSize: 11,
                                        fontWeight: "bold",
                                    }}
                                >
                                    TAP
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* explicit underdamped spring */}
                    <div
                        id="example-spring"
                        style={card}
                        onClick={() => setSpringActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Spring — overshoot</span>
                            <span style={code}>
                                {springActive
                                    ? 'type: "spring" · settling'
                                    : "tap to run upstream spring"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* positive transition delay */}
                    <div
                        id="example-transition-delay"
                        style={card}
                        onClick={() => setDelayActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>
                                Delay — hold, then move
                            </span>
                            <span style={code}>
                                {delayActive
                                    ? "delay: 0.4 · running"
                                    : "tap to verify delayed start"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* exact named variant target */}
                    <div
                        id="example-named-variants"
                        style={card}
                        onClick={() => setNamedActive((active) => !active)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Named variants</span>
                            <span style={code}>
                                {namedActive
                                    ? 'animate="active"'
                                    : 'animate="rest"'}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-named-variants"
                                style={{
                                    ...dot,
                                    width: 76,
                                    height: 42,
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
                        </div>
                    </div>

                    {/* whileTap — interactive */}
                    <div id="example-gesture-priority" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Variants + whileTap</span>
                            <span style={code}>
                                {`whileTap="pressed" · ${gestureStatus}`}
                            </span>
                            <span
                                id="status-tap-animation-lifecycle"
                                style={code}
                            >
                                {tapLifecycle.length > 0
                                    ? tapLifecycle.join(" | ")
                                    : "lifecycle: waiting for press"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                                <span
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
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    <div
                        id="case-initial-false"
                        style={conformanceCard}
                        onClick={() =>
                            setInitialFalseActive((active) => !active)
                        }
                    >
                        <div style={info}>
                            <span style={badge}>
                                {INITIAL_FALSE_CASE.status.toUpperCase()}
                            </span>
                            <span style={cardTitle}>
                                {INITIAL_FALSE_CASE.title}
                            </span>
                            <span id="status-initial-false" style={code}>
                                {`initial={false} · starts:${initialFalseStarts}`}
                            </span>
                            <span style={provenance}>
                                {`${INITIAL_FALSE_CASE.upstream.sourceVersion} · ${INITIAL_FALSE_CASE.upstream.testName}`}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    <div id="case-style-motion-value" style={conformanceCard}>
                        <div style={info}>
                            <span style={badge}>
                                {STYLE_MOTION_VALUE_CASE.status.toUpperCase()}
                            </span>
                            <span style={cardTitle}>
                                {STYLE_MOTION_VALUE_CASE.title}
                            </span>
                            <span id="status-style-motion-value" style={code}>
                                renders: {styleMotionValueRenders}
                            </span>
                            <span style={provenance}>
                                {`${STYLE_MOTION_VALUE_CASE.upstream.sourceVersion} · ${STYLE_MOTION_VALUE_CASE.upstream.testName}`}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-style-motion-value"
                                onClick={() =>
                                    liveX.set(
                                        STYLE_MOTION_VALUE_CASE.expected.endX
                                    )
                                }
                                style={{
                                    ...dot,
                                    backgroundColor: "#45b7a7",
                                    x: liveX,
                                }}
                            />
                        </div>
                    </div>

                    {/* transition.from overrides the current value */}
                    <div
                        id="example-transition-from"
                        style={card}
                        onClick={() => setTransitionFromActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>
                                Manual transition start
                            </span>
                            <span style={code}>from: 0 · target: 50</span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {animateTransitionEndOnly ? (
                        <div
                            id="example-animate-transition-end-only"
                            style={card}
                            onClick={() =>
                                setAnimateTransitionEndActive(true)
                            }
                        >
                            <div style={info}>
                                <span style={cardTitle}>
                                    transitionEnd-only animate
                                </span>
                                <span style={code}>tap · opacity 1 → 0.4</span>
                                <span
                                    id="status-animate-transition-end-only"
                                    style={code}
                                >
                                    {animateTransitionEndLifecycle.length > 0
                                        ? animateTransitionEndLifecycle.join(
                                              " | "
                                          )
                                        : "lifecycle: idle"}
                                </span>
                            </div>
                            <div style={demo}>
                                <motion.div
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
                            </div>
                        </div>
                    ) : null}

                    {removedAnimateValues ? (
                        <div
                            id="example-removed-animate-values"
                            style={card}
                            onClick={() => setRemovedAnimateActive(false)}
                        >
                            <div style={info}>
                                <span style={cardTitle}>
                                    Removed animate values
                                </span>
                                <span style={code}>
                                    initial fallback · current initial · retain
                                </span>
                            </div>
                            <div style={demo}>
                                <motion.div
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
                                <motion.div
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
                                <motion.div
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
                            </div>
                        </div>
                    ) : null}

                    {transformOriginMode ? (
                        <div
                            id="example-transform-origin"
                            style={card}
                            onClick={() => setTransformOriginActive(true)}
                        >
                            <div style={info}>
                                <span style={cardTitle}>Transform origin</span>
                                <span style={code}>0% 0% → 100% 100%</span>
                            </div>
                            <div style={demo}>
                                <div
                                    id="control-transform-origin"
                                    style={{
                                        ...dot,
                                        backgroundColor: "#7784c8",
                                        transformOrigin: transformOriginActive
                                            ? "100% 100%"
                                            : "0% 0%",
                                    }}
                                />
                                <motion.div
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
                            </div>
                        </div>
                    ) : null}

                    {complexGradientMode ? (
                        <div
                            id="example-complex-gradient"
                            style={card}
                            onClick={() => setComplexGradientActive(true)}
                        >
                            <div style={info}>
                                <span style={cardTitle}>Complex gradient</span>
                                <span style={code}>120deg → 0deg</span>
                            </div>
                            <div style={demo}>
                                <motion.div
                                    id="target-complex-gradient"
                                    style={{
                                        ...dot,
                                        width: 96,
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
                            </div>
                        </div>
                    ) : null}

                    {/* equal initial/animate values remain a no-op */}
                    <div id="example-noop-target" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>No-op target</span>
                            <span id="status-noop-target" style={code}>
                                {noOpStatus}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* equal keyframe arrays remain a no-op */}
                    <div id="example-noop-keyframes" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>No-op keyframes</span>
                            <span id="status-noop-keyframes" style={code}>
                                {noOpKeyframesStatus}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* spring velocity animates even when target equals origin */}
                    <div id="example-spring-velocity" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Spring velocity</span>
                            <span id="status-spring-velocity" style={code}>
                                {springVelocityStatus}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* zIndex is applied discretely rather than interpolated */}
                    <div id="example-z-index" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Discrete zIndex</span>
                            <span style={code}>
                                animate: 100 · no interpolation
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-z-index"
                                style={{ ...dot, backgroundColor: "#5e8fc7" }}
                                animate={{ zIndex: 100 }}
                                transition={{ duration: 2 }}
                            />
                        </div>
                    </div>

                    {/* unknown animation types fall back without crashing */}
                    <div id="example-unknown-animation-type" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>
                                Unknown animation type
                            </span>
                            <span style={code}>
                                type: "test" · resilient fallback
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-unknown-animation-type"
                                style={{ ...dot, backgroundColor: "#6e9b71" }}
                                animate={{ x: 20 }}
                                transition={{ type: "test" } as any}
                            />
                        </div>
                    </div>

                    {/* zero-valued units normalize to an animatable number */}
                    <div id="example-zero-unit" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>
                                Zero-unit normalization
                            </span>
                            <span style={code}>borderRadius: 0px → 20</span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-zero-unit"
                                style={{
                                    ...dot,
                                    backgroundColor: "#b27b51",
                                    borderRadius: "0px",
                                }}
                                animate={{ borderRadius: 20 }}
                                transition={{ duration: 0.01 }}
                            />
                        </div>
                    </div>

                    {/* CSS custom properties pass through the style path */}
                    <div id="example-css-variable" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>
                                CSS variable · partial
                            </span>
                            <span style={code}>Web #000 · native gap #57</span>
                        </div>
                        <div style={demo}>
                            <div
                                id="target-css-variable-static-control"
                                style={
                                    {
                                        ...dot,
                                        backgroundColor: "var(--static-color)",
                                        "--static-color": "#000",
                                    } as any
                                }
                            />
                            <motion.div
                                id="target-css-variable"
                                style={
                                    {
                                        ...dot,
                                        backgroundColor: "var(--motion-color)",
                                        "--motion-color": "#fff",
                                    } as any
                                }
                                animate={{ "--motion-color": "#000" } as any}
                                transition={{ type: false }}
                            />
                        </div>
                    </div>

                    {/* transition type false applies the target immediately */}
                    <div
                        id="example-instant-transition"
                        style={card}
                        onClick={() => setInstantActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Instant transition</span>
                            <span style={code}>type: false · no tween</span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* a later target can introduce a new transform property */}
                    <div
                        id="example-unseen-property"
                        style={card}
                        onClick={() => setUnseenPropertyActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>New target property</span>
                            <span style={code}>
                                x retained · y introduced later
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* discrete display reveals before the opacity entrance */}
                    <div
                        id="example-display-reveal"
                        style={card}
                        onClick={() => setDisplayRevealed(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Show, then fade in</span>
                            <span style={code}>display: none → block</span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* discrete visibility reveals before opacity entrance */}
                    <div
                        id="example-visibility-reveal"
                        style={card}
                        onClick={() => setVisibilityRevealed(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Reveal, then fade in</span>
                            <span style={code}>
                                visibility: hidden → visible
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* unmount cancels an active animation */}
                    <div
                        id="example-unmount-cancel"
                        style={card}
                        onClick={() => setUnmountVisible(false)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Unmount cancellation</span>
                            <span id="status-unmount-cancel" style={code}>
                                complete: {unmountComplete}
                            </span>
                        </div>
                        <div style={demo}>
                            {unmountVisible ? (
                                <motion.div
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
                                <span
                                    id="target-unmount-placeholder"
                                    style={code}
                                >
                                    unmounted
                                </span>
                            )}
                        </div>
                    </div>

                    {/* null keyframe hydrates from the current MotionValue */}
                    <div
                        id="example-null-keyframe"
                        style={card}
                        onClick={() => setNullKeyframeActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Null keyframe</span>
                            <span style={code}>
                                [null, end] · current value
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* transition.default overrides top-level fallback */}
                    <div
                        id="example-default-transition"
                        style={card}
                        onClick={() => setDefaultTransitionActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Default transition</span>
                            <span style={code}>
                                default delay · top-level ignored
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* negative delay starts from elapsed time */}
                    <div
                        id="example-negative-delay"
                        style={card}
                        onClick={() => setNegativeDelayActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Negative delay</span>
                            <span style={code}>
                                {negativeDelayActive
                                    ? "delay: -0.2 · elapsed"
                                    : "tap to start halfway"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* repeat endpoint hold */}
                    <div
                        id="example-repeat-delay"
                        style={card}
                        onClick={() => setRepeatDelayActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Repeat delay</span>
                            <span style={code}>
                                {repeatDelayActive
                                    ? "run · hold · run"
                                    : "tap to verify endpoint hold"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* mirror swaps endpoints without reversing easeIn */}
                    <div
                        id="example-repeat-mirror"
                        style={card}
                        onClick={() => setMirrorActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Mirror repeat</span>
                            <span style={code}>
                                {mirrorActive
                                    ? "easeIn · mirror · easeIn"
                                    : "tap to mirror easing"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* duplicate keyframe offsets */}
                    <div
                        id="example-keyframe-times"
                        style={card}
                        onClick={() => setKeyframeTimesActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Keyframe times</span>
                            <span style={code}>
                                {keyframeTimesActive
                                    ? "times: [0, 0, 1, 1]"
                                    : "tap to verify boundary jumps"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* named easing against a simultaneous linear control */}
                    <div
                        id="example-named-easing"
                        style={card}
                        onClick={() => setNamedEasingActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Named easing</span>
                            <span style={code}>
                                {namedEasingActive
                                    ? "easeInOut vs linear"
                                    : "tap to compare curves"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                            <motion.div
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
                        </div>
                    </div>

                    <div
                        id="example-array-variants"
                        style={card}
                        onClick={() => setArrayActive((active) => !active)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>
                                Array variants — merge
                            </span>
                            <span style={code}>
                                {arrayActive
                                    ? 'animate={["base", "active"]}'
                                    : 'animate={["base", "offset"]}'}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-array-variants"
                                style={{ ...dot, width: 88 }}
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
                        </div>
                    </div>

                    {/* loop — continuous rotate */}
                    <div id="example-repeat-infinity" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Loop — spin forever</span>
                            <span style={code}>
                                animate={"{{"} rotate: 360 {"}}"} · repeat:
                                Infinity
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-repeat-infinity"
                                style={{ ...dot, backgroundColor: "#3366ff" }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 2,
                                }}
                            >
                                <span style={glyph}>↻</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* finite ordered keyframes */}
                    <div
                        id="example-keyframes"
                        style={card}
                        onClick={() => setKeyframesActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Keyframes — bounce</span>
                            <span style={code}>
                                {keyframesActive
                                    ? "y: [0, -34, 12]"
                                    : "tap to run keyframes"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* reverse — breathing scale */}
                    <div
                        id="example-repeat-reverse"
                        style={card}
                        onClick={() => setReverseActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Reverse — return</span>
                            <span style={code}>
                                {reverseActive
                                    ? '1 → 1.35 → 1 · repeatType: "reverse"'
                                    : "tap to run reverse repeat"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* loop repeat — odd repeat settles at target */}
                    <div
                        id="example-repeat-loop-final"
                        style={card}
                        onClick={() => setLoopActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Loop — final target</span>
                            <span style={code}>0 → 20 · repeat: 1 · loop</span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* color keyframes */}
                    <div
                        id="example-color-keyframes"
                        style={card}
                        onClick={() => setColorActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>Color keyframes</span>
                            <span style={code}>
                                {colorActive
                                    ? "#f00 → #0f0 → #00f"
                                    : "tap to run color keyframes"}
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* color interpolation across HSLA and RGBA representations */}
                    <div
                        id="example-color-representation"
                        style={card}
                        onClick={() => setColorRepresentationActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>HSLA to RGBA</span>
                            <span style={code}>
                                cross-representation color mix
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                        </div>
                    </div>

                    {/* function variants with custom-owned delay */}
                    <div
                        id="example-function-variant"
                        style={conformanceCard}
                        onClick={() => setFunctionActive(true)}
                    >
                        <div style={info}>
                            <span style={cardTitle}>
                                Function variants — custom delay
                            </span>
                            <span style={code}>
                                {functionActive
                                    ? `custom delay · Lifecycle ${lifecycleStatus}`
                                    : "tap to resolve custom variants"}
                            </span>
                            <span
                                id="events-animation-lifecycle"
                                style={{ ...code, color: "#a4a4b8" }}
                            >
                                {lifecycleEvents}
                            </span>
                        </div>
                        <div style={demo}>
                            {COLORS.map((c, i) => (
                                <motion.div
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
