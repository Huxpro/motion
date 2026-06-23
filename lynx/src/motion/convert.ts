/**
 * Converts a Framer Motion style declarative target + transition into the
 * arguments accepted by Lynx's imperative `element.animate(keyframes, options)`
 * API (the adapted Motion.dev imperative engine).
 *
 * Goal: keep the *authoring* API byte-for-byte identical to `motion/react`
 * (`animate={{ x: 100, rotate: 45, scale: 1.2, backgroundColor: "#f00" }}`)
 * while emitting valid Lynx CSS keyframes under the hood.
 */

export type Target = Record<string, string | number>

export interface Transition {
    duration?: number // seconds, like Framer Motion
    delay?: number // seconds
    ease?:
        | "linear"
        | "easeIn"
        | "easeOut"
        | "easeInOut"
        | "circIn"
        | "circOut"
        | "circInOut"
        | "backIn"
        | "backOut"
        | "backInOut"
        | [number, number, number, number]
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
}

/** Transform shorthands -> default units (mirrors motion-dom value type maps). */
const TRANSFORM_UNIT: Record<string, string> = {
    x: "px",
    y: "px",
    z: "px",
    translateX: "px",
    translateY: "px",
    translateZ: "px",
    rotate: "deg",
    rotateX: "deg",
    rotateY: "deg",
    rotateZ: "deg",
    skew: "deg",
    skewX: "deg",
    skewY: "deg",
    scale: "",
    scaleX: "",
    scaleY: "",
    scaleZ: "",
}

/** Order matches motion-dom `transformPropOrder` so output matches the web. */
const TRANSFORM_ORDER = [
    "x",
    "y",
    "z",
    "translateX",
    "translateY",
    "translateZ",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "skew",
    "skewX",
    "skewY",
]

const TRANSLATE_ALIAS: Record<string, string> = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
}

/** CSS props that take a px unit when given a raw number (like Framer Motion). */
const PX_PROPS = new Set([
    "width",
    "height",
    "top",
    "left",
    "right",
    "bottom",
    "borderRadius",
    "fontSize",
    "padding",
    "margin",
    "borderWidth",
])

const isTransform = (key: string) => key in TRANSFORM_UNIT

function withUnit(key: string, value: string | number): string {
    if (typeof value === "string") return value
    if (key in TRANSFORM_UNIT) return `${value}${TRANSFORM_UNIT[key]}`
    if (PX_PROPS.has(key)) return `${value}px`
    return `${value}`
}

/**
 * Turn a target map into a single Lynx keyframe object: transform shorthands
 * are composed into one `transform` string (in motion-dom order), everything
 * else is passed through as kebab-cased CSS with sensible default units.
 */
export function targetToKeyframe(target: Target): Record<string, string> {
    const frame: Record<string, string> = {}
    let transform = ""

    for (const key of TRANSFORM_ORDER) {
        if (target[key] === undefined) continue
        const fn = TRANSLATE_ALIAS[key] || key
        transform += `${fn}(${withUnit(key, target[key])}) `
    }
    if (transform) frame.transform = transform.trim()

    for (const key in target) {
        if (isTransform(key)) continue
        // Lynx's animate() follows the WAAPI/Motion.dev keyframe convention:
        // camelCased property names (`backgroundColor`, not `background-color`).
        frame[key] = withUnit(key, target[key])
    }

    return frame
}

/** Build a [from, to] keyframe pair Lynx can tween between. */
export function buildKeyframes(
    from: Target,
    to: Target
): Array<Record<string, string>> {
    return [targetToKeyframe(from), targetToKeyframe(to)]
}

const EASING_MAP: Record<string, string> = {
    linear: "linear",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    circIn: "cubic-bezier(0.55, 0, 1, 0.45)",
    circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
    circInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
    backIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
    backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    backInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
}

function resolveEasing(ease?: Transition["ease"]): string {
    if (!ease) return "ease-out" // Framer Motion's tween default
    if (Array.isArray(ease)) {
        const [a, b, c, d] = ease
        return `cubic-bezier(${a}, ${b}, ${c}, ${d})`
    }
    return EASING_MAP[ease] ?? "ease-out"
}

export interface LynxAnimateOptions {
    duration: number
    delay: number
    iterations: number
    easing: string
    direction: string
    fill: string
}

export function transitionToOptions(
    transition: Transition = {}
): LynxAnimateOptions {
    const {
        duration = 0.3,
        delay = 0,
        ease,
        repeat = 0,
        repeatType = "loop",
    } = transition

    return {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: repeat === Infinity ? Infinity : repeat + 1,
        easing: resolveEasing(ease),
        direction:
            repeatType === "reverse" || repeatType === "mirror"
                ? "alternate"
                : "normal",
        fill: "forwards",
    }
}
