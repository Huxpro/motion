import { motion } from "framer-motion"
import { CSSProperties, forwardRef, useState } from "react"
import type { ComponentPropsWithoutRef } from "react"
import {
    FUNCTION_VARIANTS_CASE,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_VARIANTS_CASE,
    REACTIVE_ANIMATE_CASE,
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
    const [reactiveActive, setReactiveActive] = useState(false)
    const [namedActive, setNamedActive] = useState(false)
    const [arrayActive, setArrayActive] = useState(false)
    const [keyframesActive, setKeyframesActive] = useState(false)
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
                                transition={{ duration: 0.4, ease: "linear" }}
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
                    <div id="example-repeat-reverse" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Reverse — breathe</span>
                            <span style={code}>
                                scale: 1.35 · repeatType: "reverse"
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
                                animate={{ scale: 1.35 }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    duration: 0.7,
                                }}
                            />
                        </div>
                    </div>

                    {/* color keyframes */}
                    <div id="example-color-keyframes" style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Color keyframes</span>
                            <span style={code}>
                                backgroundColor: ["#ff0088", …]
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                id="target-color-keyframes"
                                style={{ ...dot, width: "112px" }}
                                animate={{
                                    backgroundColor: [
                                        "#ff0088",
                                        "#ff8800",
                                        "#22cc88",
                                        "#3366ff",
                                        "#ff0088",
                                    ],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 4,
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
