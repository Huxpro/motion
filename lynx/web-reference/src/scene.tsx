import { motion } from "framer-motion"
import { CSSProperties } from "react"

/**
 * PARITY SCENE — Framer Motion web reference.
 *
 * This is the original-React baseline that the ReactLynx port
 * (`lynx/src/App.tsx`) is verified against, side by side, in a headless
 * browser. The two files are intentionally kept equivalent: only the element
 * names (`div`/`span` vs `view`/`text`) and the `motion` import source differ.
 * The `initial` / `animate` / `transition` / `whileTap` props are identical.
 */

const COLORS = ["#ff0088", "#ff8800", "#22cc88", "#3366ff"]

const container: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#0b0b14",
    paddingTop: "80px",
    boxSizing: "border-box",
    margin: 0,
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
        <div style={container}>
            <span style={title}>Motion × Lynx</span>
            <div style={row}>
                {COLORS.map((color, i) => (
                    <motion.div
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
                        <span style={boxLabel}>{i + 1}</span>
                    </motion.div>
                ))}
            </div>
            <motion.div
                style={button}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileTap={{ scale: 1.15, backgroundColor: "#ffcc00" }}
            >
                <span style={buttonText}>Press me</span>
            </motion.div>
        </div>
    )
}
