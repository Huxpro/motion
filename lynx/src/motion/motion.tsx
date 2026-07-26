/**
 * `motion-lynx` — a Framer-Motion-shaped declarative layer for ReactLynx, built
 * directly on **`@lynx-js/motion`** (Motion.dev's imperative engine, ported to
 * Lynx). The declarative props are handed straight to Motion's `animate()`, so
 * springs, `repeat`/`repeatType`, keyframe arrays, easings and colour
 * interpolation are Motion's own — identical to `motion/react`.
 *
 *   <motion.view
 *       initial={{ opacity: 0, scale: 0.5 }}
 *       animate={{ opacity: 1, scale: 1 }}
 *       transition={{ type: "spring", stiffness: 200 }}
 *       whileTap={{ scale: 0.9 }}
 *   />
 *
 * Motion runs on the main thread, so each element is reached through a
 * `main-thread:ref`, and `animate()` is invoked inside a `runOnMainThread`
 * worklet (the pattern from @lynx-js/motion's own docs).
 */
import {
    runOnMainThread,
    useEffect,
    useMainThreadRef,
    useRef,
} from "@lynx-js/react"
import { animate } from "@lynx-js/motion" with { runtime: "shared" }
import type { MainThread } from "@lynx-js/types"
import { targetToStyle, type Target, type Transition } from "./convert.js"

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

/** Shared logic: resolves the main-thread ref, initial style, and handlers. */
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

    // Hop to the main thread and let Motion drive the element. The worklet
    // boundary JSON-serializes captured values, which turns `Infinity` into
    // `null`; encode `repeat: Infinity` as a sentinel and rebuild it on the
    // main thread so looping/`repeatType` reach Motion intact.
    const play = (to?: Target, t?: Transition) => {
        if (!to) return
        const opts: Transition = { ...(t ?? {}) }
        const repeatForever = opts.repeat === Infinity
        if (repeatForever) delete opts.repeat
        runOnMainThread(() => {
            "main thread"
            const el = elRef.current
            if (!el) return
            const resolved = { ...opts }
            if (repeatForever) resolved.repeat = Infinity
            animate(el, to as never, resolved as never)
        })()
    }

    // Enter + `animate` prop changes.
    useEffect(() => {
        play(target, transition)
    }, [JSON.stringify(target), JSON.stringify(transition)])

    // Gestures — whileTap mirrors motion/react.
    const handlers: Record<string, () => void> = {}
    if (whileTap) {
        const press = () => play(whileTap, transition)
        const release = () => play(target, transition)
        // Touch devices (and native Lynx): true press-and-hold.
        handlers.bindtouchstart = () => {
            touchedRef.current = true
            press()
        }
        handlers.bindtouchend = release
        handlers.bindtouchcancel = release
        // Desktop mouse: Lynx-for-web surfaces a click only as `tap` (no
        // mouse-down → touch bridge), so mirror whileTap as a quick pulse.
        handlers.bindtap = () => {
            if (touchedRef.current) {
                touchedRef.current = false
                return
            }
            press()
            setTimeout(release, 160)
        }
    }

    // First paint reflects `initial` (or `animate` when initial===false),
    // before Motion takes over on the main thread.
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
    return (
        <image main-thread:ref={m.elRef} style={m.style} {...m.handlers} {...m.rest} />
    )
}

export const motion = {
    view: MotionView,
    text: MotionText,
    image: MotionImage,
}

export type { Target, Transition }
