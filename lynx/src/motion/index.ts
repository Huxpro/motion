/**
 * Keep the demo as a pure integration consumer of lynx-stack's declarative
 * implementation. Any missing Motion API must be fixed upstream instead of
 * being hidden behind a second animator in this repository.
 */
export { motion } from "@lynx-js/motion"
export type {
    MotionProps,
    MotionTarget as Target,
    MotionTransition as Transition,
} from "@lynx-js/motion"
