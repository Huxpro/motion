/**
 * Types + a single helper: resolve a Framer-Motion-style target into the inline
 * style used for the *first paint* (before `@lynx-js/motion` takes over on the
 * main thread). Everything else — the actual animation — is handed straight to
 * Motion's imperative `animate()`, so there is no keyframe/transition
 * translation here anymore.
 */

export type Value = string | number
/** A target value may be a single value or a keyframe array (`y: [0, -34, 0]`). */
export type Target = Record<string, Value | Value[]>

/**
 * Transition options passed verbatim to `@lynx-js/motion`'s `animate()` — the
 * same shape as Framer Motion (`duration`, `delay`, `ease`, `repeat`,
 * `repeatType`, or a `type: "spring"` config).
 */
export interface Transition {
    duration?: number
    delay?: number
    ease?: string | number[]
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
    type?: "spring" | "tween" | "inertia"
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
    [key: string]: unknown
}

/** transform shorthands → default units (mirrors motion-dom value type maps). */
const TRANSFORM_UNIT: Record<string, string> = {
    x: "px", y: "px", z: "px",
    translateX: "px", translateY: "px", translateZ: "px",
    rotate: "deg", rotateX: "deg", rotateY: "deg", rotateZ: "deg",
    skew: "deg", skewX: "deg", skewY: "deg",
    scale: "", scaleX: "", scaleY: "", scaleZ: "",
}
/** Order matches motion-dom `transformPropOrder`. */
const TRANSFORM_ORDER = [
    "x", "y", "z", "translateX", "translateY", "translateZ",
    "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ",
    "skew", "skewX", "skewY",
]
const TRANSLATE_ALIAS: Record<string, string> = { x: "translateX", y: "translateY", z: "translateZ" }
const PX_PROPS = new Set([
    "width", "height", "top", "left", "right", "bottom",
    "borderRadius", "fontSize", "padding", "margin", "borderWidth",
])

const isTransform = (key: string) => key in TRANSFORM_UNIT

function withUnit(key: string, value: Value): string {
    if (typeof value === "string") return value
    if (key in TRANSFORM_UNIT) return `${value}${TRANSFORM_UNIT[key]}`
    if (PX_PROPS.has(key)) return `${value}px`
    return `${value}`
}

/** First value of every key (array → element 0) — the initial paint frame. */
function firstFrame(target: Target): Record<string, Value> {
    const out: Record<string, Value> = {}
    for (const key in target) {
        const v = target[key]
        out[key] = Array.isArray(v) ? v[0] : v
    }
    return out
}

/**
 * Resolve a target into a camelCase inline-style object for the first paint:
 * transform shorthands are composed into one `transform` string (in motion-dom
 * order, with the same default units), everything else passes through.
 */
export function targetToStyle(target: Target): Record<string, string> {
    const frame = firstFrame(target)
    const style: Record<string, string> = {}
    let transform = ""

    for (const key of TRANSFORM_ORDER) {
        if (frame[key] === undefined) continue
        const fn = TRANSLATE_ALIAS[key] || key
        transform += `${fn}(${withUnit(key, frame[key])}) `
    }
    if (transform) style.transform = transform.trim()

    for (const key in frame) {
        if (isTransform(key)) continue
        style[key] = withUnit(key, frame[key])
    }
    return style
}
