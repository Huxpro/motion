import type { CSSProperties } from "@lynx-js/types"
import type { IntrinsicElements } from "@lynx-js/types"
import { useState } from "@lynx-js/react"
import {
    FUNCTION_VARIANTS_CASE,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_VARIANTS_CASE,
    REACTIVE_ANIMATE_CASE,
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
    const [reactiveActive, setReactiveActive] = useState(false)
    const [namedActive, setNamedActive] = useState(false)
    const [arrayActive, setArrayActive] = useState(false)
    const [keyframesActive, setKeyframesActive] = useState(false)
    const [functionActive, setFunctionActive] = useState(false)
    const [lifecycleStatus, setLifecycleStatus] = useState("idle")

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
                                transition={{ duration: 0.4, ease: "linear" }}
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
                    <view id="example-repeat-reverse" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Reverse — breathe</text>
                            <text style={code}>
                                scale: 1.35 · repeatType: "reverse"
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
                                animate={{ scale: 1.35 }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    duration: 0.7,
                                }}
                            />
                        </view>
                    </view>

                    {/* color keyframes */}
                    <view id="example-color-keyframes" style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Color keyframes</text>
                            <text style={code}>
                                backgroundColor: ["#ff0088", …]
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
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
                        </view>
                    </view>

                    {/* function variants with custom-owned delay */}
                    <view
                        id="example-function-variant"
                        style={card}
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
                                        i === 0
                                            ? (definition) =>
                                                  setLifecycleStatus(
                                                      `start:${String(
                                                          definition
                                                      )}`
                                                  )
                                            : undefined
                                    }
                                    onAnimationComplete={
                                        i === 0
                                            ? (definition) =>
                                                  setLifecycleStatus(
                                                      `complete:${String(
                                                          definition
                                                      )}`
                                                  )
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
