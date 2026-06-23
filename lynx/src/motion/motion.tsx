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
    targetToKeyframe,
    transitionToOptions,
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
function targetToStyle(target: Target): Record<string, string> {
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

        // The current resting target the element settles on.
        const resting = animate ?? {}
        const restingRef = useRef<Target>(initial ? initial : resting)

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
            restingRef.current = animate
        }, [JSON.stringify(animate)])

        // Identity baseline for a property, so a [from, to] pair can always
        // interpolate even when the resting target didn't list that key.
        const baseline = (key: string): string | number | undefined => {
            if (/^scale/.test(key)) return 1
            if (/^(x|y|z|translate|rotate|skew)/.test(key)) return 0
            if (key === "opacity") return 1
            return style?.[key] // e.g. resting backgroundColor / color
        }

        // Gesture handlers (whileTap / whileHover) mirror Framer Motion.
        const pressTo = (gesture?: Target) => () => {
            if (!gesture) return
            const el = getEl()
            const base = restingRef.current
            const from: Target = { ...base }
            for (const k in gesture) {
                if (from[k] === undefined) {
                    const b = baseline(k)
                    if (b !== undefined) from[k] = b
                }
            }
            el?.animate(
                buildKeyframes(from, { ...from, ...gesture }),
                transitionToOptions(transition)
            )
        }
        const releaseFrom = (gesture?: Target) => () => {
            if (!gesture) return
            const el = getEl()
            const base = restingRef.current
            const to: Target = { ...base }
            for (const k in gesture) {
                if (to[k] === undefined) {
                    const b = baseline(k)
                    if (b !== undefined) to[k] = b
                }
            }
            el?.animate(
                buildKeyframes({ ...to, ...gesture }, to),
                transitionToOptions(transition)
            )
        }

        const handlers: Record<string, () => void> = {}
        if (whileTap) {
            handlers.bindtouchstart = pressTo(whileTap)
            handlers.bindtouchend = releaseFrom(whileTap)
            handlers.bindtouchcancel = releaseFrom(whileTap)
        }
        if (whileHover) {
            handlers.bindmouseenter = pressTo(whileHover)
            handlers.bindmouseleave = releaseFrom(whileHover)
        }

        // First paint reflects `initial` (or `animate` when initial===false).
        const firstTarget = initial === false ? animate : initial
        const initialStyle = firstTarget ? targetToStyle(firstTarget) : {}

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
