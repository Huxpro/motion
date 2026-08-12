import type { CSSProperties } from "@lynx-js/types"
import type { IntrinsicElements } from "@lynx-js/types"
import { useState } from "@lynx-js/react"
import {
    DELAY_CASE,
    DEFAULT_TRANSITION_CASE,
    DISPLAY_REVEAL_CASE,
    FUNCTION_VARIANTS_CASE,
    INSTANT_TRANSITION_CASE,
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
    TRANSITION_FROM_CASE,
    UNSEEN_PROPERTY_CASE,
    VISIBILITY_REVEAL_CASE,
} from "./conformance/cases.js"
import { motion } from "./motion/index.js"
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
    const [tapCount, setTapCount] = useState(0)
    const [hoverCount, setHoverCount] = useState(0)
    const [gestureStatus, setGestureStatus] = useState("resting")
    const [displayRevealed, setDisplayRevealed] = useState(false)
    const [visibilityRevealed, setVisibilityRevealed] = useState(false)
    const [unseenPropertyActive, setUnseenPropertyActive] = useState(false)
    const [instantActive, setInstantActive] = useState(false)
    const [noOpStatus, setNoOpStatus] = useState("idle")
    const [transitionFromActive, setTransitionFromActive] = useState(false)
    const [defaultTransitionActive, setDefaultTransitionActive] =
        useState(false)
    const [nullKeyframeActive, setNullKeyframeActive] = useState(false)
    const [reactiveActive, setReactiveActive] = useState(false)
    const [springActive, setSpringActive] = useState(false)
    const [delayActive, setDelayActive] = useState(false)
    const [negativeDelayActive, setNegativeDelayActive] = useState(false)
    const [reverseActive, setReverseActive] = useState(false)
    const [repeatDelayActive, setRepeatDelayActive] = useState(false)
    const [mirrorActive, setMirrorActive] = useState(false)
    const [keyframeTimesActive, setKeyframeTimesActive] = useState(false)
    const [namedEasingActive, setNamedEasingActive] = useState(false)
    const [namedActive, setNamedActive] = useState(false)
    const [arrayActive, setArrayActive] = useState(false)
    const [keyframesActive, setKeyframesActive] = useState(false)
    const [colorActive, setColorActive] = useState(false)
    const [functionActive, setFunctionActive] = useState(false)
    const [lifecycleStatus, setLifecycleStatus] = useState("idle")
    const [lifecycleEvents, setLifecycleEvents] = useState("events")

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
                                whileHover="hover"
                                whileTap="pressed"
                                variants={{
                                    rest: {
                                        scale: 1,
                                        backgroundColor: "#ffffff",
                                    },
                                    pressed: {
                                        scale: 1.15,
                                        backgroundColor: "#ffcc00",
                                        transition: {
                                            duration: 0.2,
                                            ease: "easeOut",
                                        },
                                    },
                                    hover: {
                                        scale: 1.08,
                                        backgroundColor: "#8ab4ff",
                                        transition: { duration: 0.15 },
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
                            <text style={code}>visibility: hidden → visible</text>
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
