import type { CSSProperties } from "@lynx-js/types"
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
const info: CSSProperties = { display: "flex", flexDirection: "column", flex: 1 }
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

export function App() {
    return (
        <view style={page}>
            <scroll-view scroll-orientation="vertical" style={scroll}>
                <view style={inner}>
                    <text style={h1}>motion-lynx</text>
                    <text style={sub}>
                        the declarative motion/react API, running on Lynx
                    </text>

                    {/* whileTap — interactive */}
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>whileTap — press me</text>
                            <text style={code}>
                                whileTap={"{{"} scale: 1.15, backgroundColor {"}}"}
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                style={{
                                    ...dot,
                                    width: "112px",
                                    backgroundColor: "#ffffff",
                                }}
                                whileTap={{
                                    scale: 1.15,
                                    backgroundColor: "#ffcc00",
                                }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <text style={{ ...glyph, color: "#0b0b14", fontSize: "18px", fontWeight: "bold" }}>
                                    Press
                                </text>
                            </motion.view>
                        </view>
                    </view>

                    {/* loop — continuous rotate */}
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Loop — spin forever</text>
                            <text style={code}>
                                animate={"{{"} rotate: 360 {"}}"} · repeat: Infinity
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
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

                    {/* keyframes — bounce */}
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Keyframes — bounce</text>
                            <text style={code}>animate={"{{"} y: [0, -34, 0] {"}}"}</text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                style={{ ...dot, backgroundColor: "#22cc88" }}
                                animate={{ y: [0, -34, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    duration: 1,
                                }}
                            />
                        </view>
                    </view>

                    {/* reverse — breathing scale */}
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Reverse — breathe</text>
                            <text style={code}>
                                scale: 1.35 · repeatType: "reverse"
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
                                style={{ ...dot, backgroundColor: "#ff0088", borderRadius: "28px" }}
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
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Color keyframes</text>
                            <text style={code}>
                                backgroundColor: ["#ff0088", …]
                            </text>
                        </view>
                        <view style={demo}>
                            <motion.view
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

                    {/* entrance — staggered */}
                    <view style={card}>
                        <view style={info}>
                            <text style={cardTitle}>Entrance — stagger</text>
                            <text style={code}>
                                initial → animate · delay: i * 0.12
                            </text>
                        </view>
                        <view style={demo}>
                            {COLORS.map((c, i) => (
                                <motion.view
                                    key={i}
                                    style={{ ...small, backgroundColor: c }}
                                    initial={{ opacity: 0, y: 20, scale: 0.3 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.12,
                                        ease: "backOut",
                                    }}
                                />
                            ))}
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    )
}
