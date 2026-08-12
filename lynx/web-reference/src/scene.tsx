import { motion } from "framer-motion"
import { CSSProperties, forwardRef, useState } from "react"
import type { ComponentPropsWithoutRef } from "react"
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
    const [tapCount, setTapCount] = useState(0)
    const [hoverCount, setHoverCount] = useState(0)
    const [gestureStatus, setGestureStatus] = useState("resting")
    const [displayRevealed, setDisplayRevealed] = useState(false)
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
                                transition={{ duration: 0.4, ease: "linear" }}
                            />
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
