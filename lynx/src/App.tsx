import type { CSSProperties } from "@lynx-js/types"
import { motion } from "./motion/index.js"
import "./App.css"

/**
 * PARITY SCENE — ReactLynx edition.
 *
 * This file is intentionally kept equivalent to the Framer Motion web
 * reference at `dev/react/src/tests/lynx-parity.tsx`. The only differences
 * are the element names (`view`/`text` vs `div`/`span`) and the import
 * source of `motion`. The animation props are identical.
 */

const COLORS = ["#ff0088", "#ff8800", "#22cc88", "#3366ff"]

const container: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
    backgroundColor: "#0b0b14",
    paddingTop: "80px",
}

const title: CSSProperties = {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "48px",
    fontFamily: "sans-serif",
}

const row: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "56px",
}

const box: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "72px",
    height: "72px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "16px",
}

const boxLabel: CSSProperties = {
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
}

const button: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "200px",
    height: "60px",
    borderRadius: "30px",
    backgroundColor: "#ffffff",
}

const buttonText: CSSProperties = {
    color: "#0b0b14",
    fontSize: "20px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
}

export function App() {
    return (
        <view style={container}>
            <text style={title}>Motion × Lynx</text>
            <view style={row}>
                {COLORS.map((color, i) => (
                    <motion.view
                        key={i}
                        style={{ ...box, backgroundColor: color }}
                        initial={{ opacity: 0, y: 60, scale: 0.4 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: i * 90 }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.15,
                            ease: "easeOut",
                        }}
                    >
                        <text style={boxLabel}>{i + 1}</text>
                    </motion.view>
                ))}
            </view>
            <motion.view
                style={button}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileTap={{ scale: 1.15, backgroundColor: "#ffcc00" }}
            >
                <text style={buttonText}>Press me</text>
            </motion.view>
        </view>
    )
}
