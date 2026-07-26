/**
 * `motion-lynx` — a Framer-Motion-shaped declarative animation layer for
 * ReactLynx, built on top of Lynx's imperative `element.animate()` engine
 * (the adapted Motion.dev imperative API).
 *
 *   import { motion } from "./motion"
 *
 *   <motion.view
 *       initial={{ opacity: 0, scale: 0.5 }}
 *       animate={{ opacity: 1, scale: 1 }}
 *       transition={{ duration: 0.6, ease: "easeOut" }}
 *       whileTap={{ scale: 0.9 }}
 *   />
 *
 * The props above are intentionally identical to `motion/react`; only the
 * element name differs (`view`/`text`/`image` instead of `div`/`span`/`img`),
 * because that is the Lynx element set.
 */
import { createElement, useEffect, useMemo, useRef } from "@lynx-js/react"
import {
    buildKeyframes,
    firstFrame,
    lastFrame,
    targetToKeyframe,
    transitionToOptions,
    type ScalarTarget,
    type Target,
    type Transition,
} from "./convert.js"

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

declare const lynx: {
    getElementById(id: string): {
        animate(
            keyframes: Array<Record<string, string>>,
            options: object
        ): unknown
    } | null
}

let counter = 0

/** Resolve a target into a camelCase inline-style object for first paint. */
function targetToStyle(target: ScalarTarget): Record<string, string> {
    const frame = targetToKeyframe(target)
    const style: Record<string, string> = {}
    for (const key in frame) {
        // keyframe keys are kebab-cased CSS; `transform`/`opacity` stay as-is.
        const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        style[camel] = frame[key]
    }
    return style
}

function createMotionComponent(tag: string) {
    return function MotionComponent(props: MotionProps) {
        const {
            initial,
            animate,
            transition,
            whileTap,
            whileHover,
            style,
            children,
            ...rest
        } = props

        const id = useMemo(() => `motion-${tag}-${counter++}`, [])

        // The current resting target the element settles on (arrays resolved).
        const resting = animate ?? {}
        const restingRef = useRef<ScalarTarget>(
            firstFrame(initial ? initial : resting)
        )
        // Suppresses the synthesized `tap` that follows a real touch sequence.
        const touchedRef = useRef(false)

        const getEl = () =>
            typeof lynx !== "undefined" ? lynx.getElementById(id) : null

        // Enter + `animate` prop changes.
        useEffect(() => {
            if (!animate) return
            const el = getEl()
            el?.animate(
                buildKeyframes(restingRef.current, animate),
                transitionToOptions(transition)
            )
            restingRef.current = lastFrame(animate)
        }, [JSON.stringify(animate)])

        // Identity baseline for a property, so a [from, to] pair can always
        // interpolate even when the resting target didn't list that key.
        const baseline = (key: string): string | number | undefined => {
            if (/^scale/.test(key)) return 1
            if (/^(x|y|z|translate|rotate|skew)/.test(key)) return 0
            if (key === "opacity") return 1
            return style?.[key] // e.g. resting backgroundColor / color
        }

        // The resting state extended with baseline values for any key the
        // gesture touches, so [from, to] can always interpolate.
        const complete = (gesture: Target): ScalarTarget => {
            const base: ScalarTarget = { ...restingRef.current }
            for (const k in gesture) {
                if (base[k] === undefined) {
                    const b = baseline(k)
                    if (b !== undefined) base[k] = b
                }
            }
            return base
        }
        // Animate into the gesture target.
        const press = (gesture: Target) => {
            const base = complete(gesture)
            getEl()?.animate(
                buildKeyframes(base, { ...base, ...firstFrame(gesture) }),
                transitionToOptions(transition)
            )
        }
        // Animate back out to the resting state.
        const release = (gesture: Target) => {
            const base = complete(gesture)
            getEl()?.animate(
                buildKeyframes({ ...base, ...firstFrame(gesture) }, base),
                transitionToOptions(transition)
            )
        }

        const handlers: Record<string, (e?: unknown) => void> = {}
        if (whileTap) {
            // Touch devices (and native Lynx): real press-and-hold.
            handlers.bindtouchstart = () => {
                touchedRef.current = true
                press(whileTap)
            }
            handlers.bindtouchend = () => release(whileTap)
            handlers.bindtouchcancel = () => release(whileTap)
            // Desktop mouse: Lynx-for-web surfaces a click only as `tap` (there is
            // no mouse-down → touch bridge), so mirror whileTap as a quick pulse.
            handlers.bindtap = () => {
                if (touchedRef.current) {
                    touchedRef.current = false // this tap trails a handled touch
                    return
                }
                press(whileTap)
                setTimeout(() => release(whileTap), 160)
            }
        }
        if (whileHover) {
            // Note: Lynx-for-web has no hover bridge; effective on hover-capable
            // targets only. Kept for API parity with motion/react.
            handlers.bindmouseenter = () => press(whileHover)
            handlers.bindmouseleave = () => release(whileHover)
        }

        // First paint reflects `initial` (or `animate` when initial===false).
        const firstTarget = initial === false ? animate : initial
        const initialStyle = firstTarget
            ? targetToStyle(firstFrame(firstTarget))
            : {}

        return createElement(
            tag,
            {
                id,
                style: { ...initialStyle, ...style },
                ...handlers,
                ...rest,
            },
            children
        )
    }
}

export const motion = {
    view: createMotionComponent("view"),
    text: createMotionComponent("text"),
    image: createMotionComponent("image"),
}

export type { Target, Transition }
