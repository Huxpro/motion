/**
 * Provenance links: every tracked API points back to its Motion.dev docs
 * page, and every conformance case to its upstream test source on GitHub,
 * so reviewers can judge where a behavior comes from and what it is worth.
 */

const MOTION_DOCS = "https://motion.dev/docs"

export const UPSTREAM_REPO_URL = "https://github.com/motiondivision/motion"

/** Link an upstream test file at the pinned source version. */
export function upstreamSourceUrl(sourceVersion: string, path: string) {
    return `${UPSTREAM_REPO_URL}/blob/v${sourceVersion}/${path}`
}

interface DocsRule {
    match: RegExp
    page: string
    anchor?: string
}

/**
 * Ordered first-match rules from API surface strings (as written in the
 * conformance manifest) to Motion.dev docs pages.
 */
const DOCS_RULES: readonly DocsRule[] = [
    { match: /^AnimatePresence|^exit$/, page: "react-animate-presence" },
    {
        match: /motion\.create/,
        page: "react-motion-component",
        anchor: "custom-components",
    },
    { match: /^motion\.(view|text|image|div|span)/, page: "react-motion-component" },
    { match: /^initial/, page: "react-motion-component", anchor: "initial" },
    { match: /^parent initial/, page: "react-motion-component", anchor: "initial" },
    { match: /^animate/, page: "react-motion-component", anchor: "animate" },
    { match: /^style/, page: "react-motion-component", anchor: "style" },
    { match: /^MotionStyle|MotionValue|useMotionValue/, page: "react-motion-value" },
    { match: /^whileTap|^onTap/, page: "react-gestures", anchor: "tap" },
    { match: /^whileHover|^onHover/, page: "react-gestures", anchor: "hover" },
    { match: /^onAnimation(Start|Complete)/, page: "react-motion-component" },
    {
        match: /^variants|^custom$|^inherit|Variants$|^dynamic children|^inheritance/,
        page: "react-animation",
        anchor: "variants",
    },
    {
        match: /^delayChildren|^beforeChildren|^staggerChildren/,
        page: "react-transitions",
        anchor: "orchestration",
    },
    { match: /^keyframes|keyframe/, page: "react-animation", anchor: "keyframes" },
    { match: /^spring|^stiffness|^damping|velocity/, page: "react-transitions", anchor: "spring" },
    { match: /^repeat|^mirror$|^reverse$/, page: "react-transitions", anchor: "repeat" },
    { match: /^ease|^easing|Easing/, page: "react-transitions", anchor: "ease" },
    { match: /^transitionEnd/, page: "react-animation", anchor: "transitionend" },
    { match: /^transition/, page: "react-transitions" },
    { match: /^Suspense|^lazy loading|^fallback|^memo$/, page: "react-motion-component" },
    { match: /^--|CSS custom propert/, page: "react-animation", anchor: "css-variables" },
    {
        match: /color|HSLA|RGBA|gradient|complex value/i,
        page: "react-animation",
        anchor: "animatable-values",
    },
    {
        match: /^transform|^origin|^rotate$|^opacity$|^display$|^visibility$|^zIndex$|^z-index|^borderRadius$|^background/,
        page: "react-animation",
        anchor: "animatable-values",
    },
]

/** Motion.dev docs URL for an API surface string, or null if unmapped. */
export function motionDocsUrl(api: string): string | null {
    for (const rule of DOCS_RULES) {
        if (rule.match.test(api)) {
            return `${MOTION_DOCS}/${rule.page}${rule.anchor ? `#${rule.anchor}` : ""}`
        }
    }
    return null
}

export const MOTION_DOCS_HOME = `${MOTION_DOCS}/react-animation`
