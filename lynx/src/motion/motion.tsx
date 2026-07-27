/**
 * `motion-lynx` — a Framer-Motion-shaped declarative layer for ReactLynx.
 *
 * The animation runs on the Lynx **main thread** using Motion's math (the same
 * cubic-bezier easing curves / colour + number mixing Motion uses) driven by a
 * `requestAnimationFrame` loop, so `repeat` / `repeatType` / keyframe arrays /
 * colour interpolation all behave like `motion/react`.
 *
 * Why the animator (`mtAnimate`) is inlined in this file rather than imported:
 * on Lynx-for-Web (web-core) only **same-file** `'main thread'` functions are
 * registered into the worklet runtime — a `'main thread'` function pulled from
 * another module (or node_modules, which is why `@lynx-js/motion` itself can't
 * run here yet) is emitted as a non-callable worklet descriptor and throws.
 * Keeping `mtAnimate` in the same module as the `runOnMainThread` call that
 * invokes it sidesteps that web-core gap.
 */
import {
    runOnMainThread,
    useEffect,
    useMainThreadRef,
    useRef,
} from "@lynx-js/react"
import type { MainThread } from "@lynx-js/types"
import { targetToStyle, type Target, type Transition } from "./convert.js"
// The real Motion engine, imported via the Lynx "cross-thread shared modules"
// pattern. Only invoked when the USE_LYNX_MOTION build flag is on; otherwise the
// whole branch (and this capture) is dead-code-eliminated. See
// `docs/web-mts-crossmodule-bug.md` for why it can't drive Lynx-for-Web yet.
import { animate as lynxMotionAnimate } from "@lynx-js/motion" with {
    runtime: "shared",
}

/**
 * Build-time backend switch, injected by `lynx.config.ts` (`source.define`).
 * `false` (default) → inline `mtAnimate`; `true` (`USE_LYNX_MOTION=1`) →
 * `@lynx-js/motion`'s `animate()`.
 */
declare const __USE_LYNX_MOTION__: boolean

export interface MotionProps {
    initial?: Target | false
    animate?: Target
    transition?: Transition
    whileTap?: Target
    whileHover?: Target
    style?: Record<string, string | number>
    className?: string
    children?: any
    /** Any other Lynx props/events (id, bindtap, ...) pass straight through. */
    [key: string]: unknown
}

type Scalar = number | string
type Frame = Record<string, Scalar>

/**
 * Animate one element to `target`, composing transforms and writing styles via
 * the Lynx main-thread element API, using Motion's easing/mixing math + rAF.
 * `from` seeds start values; concurrent calls on an element supersede earlier
 * ones (per-property, via a version stamp).
 */
function mtAnimate(
    element: unknown,
    target: Record<string, Scalar | Scalar[]>,
    transition: Transition,
    from: Frame
) {
    "main thread"
    const el = element as {
        setStyleProperty: (k: string, v: string) => void
        __ms?: Frame
        __mv?: number
    }
    const g = globalThis as { requestAnimationFrame: (cb: () => void) => void }

    const TRANSFORM_UNIT: Record<string, string> = {
        x: "px", y: "px", z: "px",
        translateX: "px", translateY: "px", translateZ: "px",
        rotate: "deg", rotateX: "deg", rotateY: "deg", rotateZ: "deg",
        skew: "deg", skewX: "deg", skewY: "deg",
        scale: "", scaleX: "", scaleY: "", scaleZ: "",
    }
    const ORDER = [
        "x", "y", "z", "translateX", "translateY", "translateZ",
        "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ",
        "skew", "skewX", "skewY",
    ]
    const ALIAS: Record<string, string> = { x: "translateX", y: "translateY", z: "translateZ" }
    const PX = " width height top left right bottom borderRadius fontSize padding margin borderWidth "

    // cubic-bezier easings with framer-motion's control points
    const bezier = (x1: number, y1: number, x2: number, y2: number) => {
        const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
        const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
        const sx = (t: number) => ((ax * t + bx) * t + cx) * t
        const sy = (t: number) => ((ay * t + by) * t + cy) * t
        const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
        return (p: number) => {
            if (p <= 0) return 0
            if (p >= 1) return 1
            let t = p
            for (let i = 0; i < 8; i++) {
                const x = sx(t) - p
                if (Math.abs(x) < 1e-4) break
                const d = dx(t)
                if (Math.abs(d) < 1e-6) break
                t -= x / d
            }
            return sy(t)
        }
    }
    const EASE: Record<string, (t: number) => number> = {
        linear: (t) => t,
        easeIn: bezier(0.42, 0, 1, 1),
        easeOut: bezier(0, 0, 0.58, 1),
        easeInOut: bezier(0.42, 0, 0.58, 1),
        circIn: bezier(0.55, 0, 1, 0.45),
        circOut: bezier(0, 0.55, 0.45, 1),
        circInOut: bezier(0.85, 0, 0.15, 1),
        backIn: bezier(0.36, 0, 0.66, -0.56),
        backOut: bezier(0.34, 1.56, 0.64, 1),
        backInOut: bezier(0.68, -0.6, 0.32, 1.6),
        anticipate: bezier(0.68, -0.6, 0.32, 1.6),
    }

    const isColor = (v: unknown) =>
        typeof v === "string" && (v[0] === "#" || v.slice(0, 3) === "rgb")
    const parseColor = (c: string): number[] => {
        if (c[0] === "#") {
            let h = c.slice(1)
            if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
            return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
        }
        const m = c.replace(/rgba?\(|\)|\s/g, "").split(",")
        return [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2])]
    }
    const mixColor = (a: string, b: string, p: number): string => {
        const c1 = parseColor(a), c2 = parseColor(b)
        const ch = (i: number) =>
            Math.round(Math.sqrt(c1[i] * c1[i] * (1 - p) + c2[i] * c2[i] * p))
        return "rgb(" + ch(0) + ", " + ch(1) + ", " + ch(2) + ")"
    }
    const toNum = (v: Scalar) => (typeof v === "number" ? v : parseFloat(v) || 0)
    const defaultFor = (key: string): number =>
        key.indexOf("scale") === 0 ? 1 : key === "opacity" ? 1 : 0

    const state: Frame = el.__ms || (el.__ms = {})
    for (const k in from) if (from[k] !== undefined) state[k] = from[k]
    const version = (el.__mv = (el.__mv || 0) + 1)

    const apply = () => {
        let transform = ""
        for (let i = 0; i < ORDER.length; i++) {
            const k = ORDER[i]
            const v = state[k]
            if (v === undefined) continue
            const fn = ALIAS[k] || k
            const unit = typeof v === "number" ? TRANSFORM_UNIT[k] : ""
            transform += fn + "(" + v + unit + ") "
        }
        if (transform) el.setStyleProperty("transform", transform.trim())
        for (const k in state) {
            if (TRANSFORM_UNIT[k] !== undefined) continue
            const v = state[k]
            const out = typeof v === "number" && PX.indexOf(" " + k + " ") >= 0 ? v + "px" : "" + v
            // setStyleProperty expects kebab-case CSS names (background-color, …)
            const name = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
            el.setStyleProperty(name, out)
        }
    }

    const duration = (transition.duration ?? 0.3) * 1000
    const delay = (transition.delay ?? 0) * 1000
    // A worklet closure JSON-serialises captured values, turning Infinity into
    // null; here `repeat: null` therefore means "was Infinity".
    const rawRepeat = transition.repeat
    const repeat = rawRepeat === null ? Infinity : rawRepeat ?? 0
    const repeatType = transition.repeatType ?? "loop"
    const totalIter = repeat === Infinity ? Infinity : repeat + 1
    const easeName = typeof transition.ease === "string" ? transition.ease : ""
    const easeFn = EASE[easeName] || EASE.easeOut

    const dirProgress = (p: number, iteration: number) =>
        (repeatType === "reverse" || repeatType === "mirror") && iteration % 2 === 1
            ? 1 - p
            : p

    for (const key in target) {
        const raw = target[key]
        const kf: Scalar[] = Array.isArray(raw) ? raw.slice() : [from[key], raw]
        if (kf[0] === undefined || kf[0] === null) {
            kf[0] = state[key] !== undefined ? state[key] : defaultFor(key)
        }
        const color = isColor(kf[kf.length - 1])
        const startAt = Date.now() + delay

        const valueAt = (progress: number): Scalar => {
            const seg = progress * (kf.length - 1)
            let i = Math.floor(seg)
            if (i < 0) i = 0
            if (i > kf.length - 2) i = kf.length - 2
            const frac = seg - i
            if (color) return mixColor(kf[i] as string, kf[i + 1] as string, frac)
            return toNum(kf[i]) + (toNum(kf[i + 1]) - toNum(kf[i])) * frac
        }

        const tick = () => {
            if (el.__mv !== version) return // superseded
            const now = Date.now()
            if (now < startAt) {
                g.requestAnimationFrame(tick)
                return
            }
            const elapsed = now - startAt
            const iteration = Math.floor(elapsed / duration)
            if (iteration >= totalIter) {
                state[key] = valueAt(dirProgress(1, totalIter - 1))
                apply()
                return
            }
            const p = (elapsed % duration) / duration
            state[key] = valueAt(easeFn(dirProgress(p, iteration)))
            apply()
            g.requestAnimationFrame(tick)
        }
        g.requestAnimationFrame(tick)
    }
}

/** Resolve a target's keyframe arrays to their first element (a start frame). */
function firstFrame(t?: Target): Frame {
    const out: Frame = {}
    if (!t) return out
    for (const k in t) {
        const v = t[k]
        out[k] = Array.isArray(v) ? v[0] : v
    }
    return out
}

function useMotion(props: MotionProps) {
    const {
        initial,
        animate: target,
        transition,
        whileTap,
        style,
        children,
        ...rest
    } = props

    const elRef = useMainThreadRef<MainThread.Element>(null)
    const touchedRef = useRef(false)

    // Base (resting) values a gesture animates from / back to: resolved style +
    // sensible identity defaults for the gesture's keys.
    const gestureBase = (gesture: Target): Frame => {
        const base: Frame = {}
        for (const k in gesture) {
            const s = style?.[k]
            base[k] =
                s !== undefined
                    ? s
                    : k.indexOf("scale") === 0 || k === "opacity"
                    ? 1
                    : 0
        }
        return base
    }

    const play = (to?: Target, from?: Frame, t?: Transition) => {
        if (!to) return
        if (__USE_LYNX_MOTION__) {
            // @lynx-js/motion's real engine. Our `Target`/`Transition` map 1:1
            // onto Motion's keyframes/options (repeat/repeatType/ease/delay), so
            // no translation is needed. Native-ready; blocked on Lynx-for-Web
            // (see docs/web-mts-crossmodule-bug.md).
            runOnMainThread(() => {
                "main thread"
                const el = elRef.current
                if (el) lynxMotionAnimate(el as never, to as never, (t ?? {}) as never)
            })()
        } else {
            runOnMainThread(() => {
                "main thread"
                const el = elRef.current
                if (el) mtAnimate(el, to as never, (t ?? {}) as never, (from ?? {}) as never)
            })()
        }
    }

    // Enter + `animate` prop changes: from `initial` (or nothing) → `animate`.
    useEffect(() => {
        play(target, initial ? firstFrame(initial) : {}, transition)
    }, [JSON.stringify(target), JSON.stringify(transition)])

    const handlers: Record<string, () => void> = {}
    if (whileTap) {
        const press = () => play(whileTap, gestureBase(whileTap), transition)
        const release = () => play(gestureBase(whileTap), {}, transition)
        handlers.bindtouchstart = () => {
            touchedRef.current = true
            press()
        }
        handlers.bindtouchend = release
        handlers.bindtouchcancel = release
        // Desktop mouse: Lynx-for-web surfaces a click only as `tap`, so pulse.
        handlers.bindtap = () => {
            if (touchedRef.current) {
                touchedRef.current = false
                return
            }
            press()
            setTimeout(release, 160)
        }
    }

    const firstTarget = initial === false ? target : initial
    const initialStyle = firstTarget ? targetToStyle(firstTarget) : {}

    return {
        elRef,
        style: { ...initialStyle, ...style },
        handlers,
        rest,
        children,
    }
}

const MotionView = (props: MotionProps) => {
    const m = useMotion(props)
    return (
        <view main-thread:ref={m.elRef} style={m.style} {...m.handlers} {...m.rest}>
            {m.children}
        </view>
    )
}
const MotionText = (props: MotionProps) => {
    const m = useMotion(props)
    return (
        <text main-thread:ref={m.elRef} style={m.style} {...m.handlers} {...m.rest}>
            {m.children}
        </text>
    )
}
const MotionImage = (props: MotionProps) => {
    const m = useMotion(props)
    return <image main-thread:ref={m.elRef} style={m.style} {...m.handlers} {...m.rest} />
}

export const motion = {
    view: MotionView,
    text: MotionText,
    image: MotionImage,
}

export type { Target, Transition }
