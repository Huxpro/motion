import { motion } from "framer-motion"
import { CSSProperties, useState } from "react"

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
const scroll: CSSProperties = { width: "100%", height: "100%", overflowY: "auto" }
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
    const [tapCount, setTapCount] = useState(0)
    const [hoverCount, setHoverCount] = useState(0)
    const [lifecycleStatus, setLifecycleStatus] = useState("idle")

    return (
        <div style={page}>
            <div style={scroll}>
                <div style={inner}>
                    <span style={h1}>motion-lynx</span>
                    <span style={sub}>
                        the declarative motion/react API, running on Lynx
                    </span>

                    {/* whileTap — interactive */}
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Variants + whileTap</span>
                            <span style={code}>
                                whileTap="pressed" · target transition
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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
                                onHoverStart={() => setHoverCount((count) => count + 1)}
                                onTap={() => setTapCount((count) => count + 1)}
                            >
                                <span style={{ ...glyph, color: "#0b0b14", fontSize: "18px", fontWeight: "bold" }}>
                                    {tapCount
                                        ? `Tapped ${tapCount}`
                                        : hoverCount
                                          ? `Hovered ${hoverCount}`
                                          : "Press"}
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* loop — continuous rotate */}
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Loop — spin forever</span>
                            <span style={code}>
                                animate={"{{"} rotate: 360 {"}}"} · repeat: Infinity
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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

                    {/* keyframes — bounce */}
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Keyframes — bounce</span>
                            <span style={code}>animate={"{{"} y: [0, -34, 0] {"}}"}</span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                style={{ ...dot, backgroundColor: "#22cc88" }}
                                animate={{ y: [0, -34, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    duration: 1,
                                }}
                            />
                        </div>
                    </div>

                    {/* reverse — breathing scale */}
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Reverse — breathe</span>
                            <span style={code}>
                                scale: 1.35 · repeatType: "reverse"
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
                                style={{ ...dot, backgroundColor: "#ff0088", borderRadius: "28px" }}
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
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Color keyframes</span>
                            <span style={code}>
                                backgroundColor: ["#ff0088", …]
                            </span>
                        </div>
                        <div style={demo}>
                            <motion.div
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

                    {/* entrance — staggered */}
                    <div style={card}>
                        <div style={info}>
                            <span style={cardTitle}>Entrance — stagger</span>
                            <span style={code}>
                                {`function variant · Lifecycle ${lifecycleStatus}`}
                            </span>
                        </div>
                        <div style={demo}>
                            {COLORS.map((c, i) => (
                                <motion.div
                                    key={i}
                                    style={{ ...small, backgroundColor: c }}
                                    initial="hidden"
                                    animate="visible"
                                    custom={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.3 },
                                        visible: (index) => ({
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                duration: 0.6,
                                                delay: Number(index) * 0.12,
                                                ease: "backOut",
                                            },
                                        }),
                                    }}
                                    onAnimationStart={
                                        i === 0
                                            ? (definition) =>
                                                  setLifecycleStatus(`start:${String(definition)}`)
                                            : undefined
                                    }
                                    onAnimationComplete={
                                        i === 0
                                            ? (definition) =>
                                                  setLifecycleStatus(`complete:${String(definition)}`)
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
