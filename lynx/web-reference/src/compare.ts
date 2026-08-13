/**
 * Cross-runtime comparison controller for the Examples view.
 *
 * Both panes are same-origin iframes: the Web reference is this very app in
 * `?mode=baseline`, and Lynx for Web renders real DOM custom elements inside
 * open shadow roots. That lets the portal observe and drive both runtimes
 * directly — no bundle changes needed:
 *
 * - anchor-based scroll sync keyed on the shared `example-*` / `case-*`
 *   card ids that both galleries render in the same order, and
 * - synthetic pointer sequences that trigger the same tap-driven scenario
 *   in both runtimes at once.
 */

export interface PaneHandle {
    doc: Document
    scroller: HTMLElement
    /** Card containers, cached: ids are shared verbatim between galleries. */
    cards: HTMLElement[]
    /** Cards plus inner `target-*` gesture elements, for tap dispatch. */
    triggers: HTMLElement[]
}

export interface ScrollAnchor {
    id: string
    /** How far the pane top sits into the anchor card, as a card fraction. */
    fraction: number
}

const CARD_PREFIXES = ["example-", "case-"]
const TRIGGER_PREFIXES = ["target-", ...CARD_PREFIXES]

function isCardId(id: string) {
    return CARD_PREFIXES.some((prefix) => id.startsWith(prefix))
}

function isTriggerId(id: string) {
    return TRIGGER_PREFIXES.some((prefix) => id.startsWith(prefix))
}

/** Depth-limited walk that follows open shadow roots (Lynx for Web). */
function walk(root: ParentNode, visit: (el: Element) => void, depth = 0) {
    if (depth > 14) return
    for (const el of Array.from(root.querySelectorAll("*"))) {
        visit(el)
        if (el.shadowRoot) walk(el.shadowRoot, visit, depth + 1)
    }
}

function collectPane(doc: Document): Omit<PaneHandle, "doc"> | null {
    const cards: HTMLElement[] = []
    const triggers: HTMLElement[] = []
    let scroller: HTMLElement | null = null
    walk(doc, (el) => {
        if (el.id && isTriggerId(el.id)) {
            triggers.push(el as HTMLElement)
            if (isCardId(el.id)) cards.push(el as HTMLElement)
        }
        const html = el as HTMLElement
        if (
            html.scrollHeight > html.clientHeight + 40 &&
            html.clientHeight > 80 &&
            (!scroller || html.scrollHeight > scroller.scrollHeight)
        ) {
            scroller = html
        }
    })
    if (!scroller || cards.length === 0) return null
    return { scroller, cards, triggers }
}

/**
 * Resolve a pane from its iframe. Returns null while the runtime is still
 * booting, or when the frame is cross-origin (Lynx dev server) — callers
 * poll and degrade gracefully.
 */
export function connectPane(iframe: HTMLIFrameElement): PaneHandle | null {
    try {
        const doc = iframe.contentDocument
        if (!doc || doc.readyState === "loading") return null
        const found = collectPane(doc)
        return found ? { doc, ...found } : null
    } catch {
        return null
    }
}

export function captureAnchor(pane: PaneHandle): ScrollAnchor | null {
    const paneTop = pane.scroller.getBoundingClientRect().top
    for (const card of pane.cards) {
        const rect = card.getBoundingClientRect()
        if (rect.height > 0 && rect.bottom > paneTop + 1) {
            return {
                id: card.id,
                fraction: (paneTop - rect.top) / rect.height,
            }
        }
    }
    return null
}

export function applyAnchor(pane: PaneHandle, anchor: ScrollAnchor) {
    const card = pane.cards.find((el) => el.id === anchor.id)
    if (!card) return
    const rect = card.getBoundingClientRect()
    const paneTop = pane.scroller.getBoundingClientRect().top
    pane.scroller.scrollTop +=
        rect.top + anchor.fraction * rect.height - paneTop
}

/**
 * Synthetic touch tap. Lynx for Web routes `bindtap` from click events but
 * recognises motion gestures (whileTap and friends) from touch sequences
 * only — and the two channels are disjoint, so dispatching a touch tap on
 * top of a click never double-fires a handler. Framer Motion's press
 * gesture listens to pointer events and ignores synthetic TouchEvents.
 */
export function dispatchTouchTap(el: Element): boolean {
    const win = el.ownerDocument?.defaultView
    if (!win?.TouchEvent || !win.Touch) return false
    try {
        const rect = el.getBoundingClientRect()
        const touch = new win.Touch({
            identifier: (performance.now() % 100000) | 0,
            target: el,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
        })
        const base = { bubbles: true, composed: true, cancelable: true }
        el.dispatchEvent(
            new win.TouchEvent("touchstart", {
                ...base,
                touches: [touch],
                targetTouches: [touch],
                changedTouches: [touch],
            })
        )
        el.dispatchEvent(
            new win.TouchEvent("touchend", {
                ...base,
                touches: [],
                targetTouches: [],
                changedTouches: [touch],
            })
        )
        return true
    } catch {
        return false
    }
}

/** Fire the same tap in a pane that a user gesture would produce. */
export function triggerCard(pane: PaneHandle, triggerId: string): boolean {
    const target = pane.triggers.find((el) => el.id === triggerId)
    if (!target) return false
    const rect = target.getBoundingClientRect()
    const init = {
        bubbles: true,
        composed: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
    }
    target.dispatchEvent(
        new PointerEvent("pointerdown", { ...init, pointerId: 1, isPrimary: true })
    )
    target.dispatchEvent(
        new PointerEvent("pointerup", { ...init, pointerId: 1, isPrimary: true })
    )
    target.dispatchEvent(new MouseEvent("click", init))
    dispatchTouchTap(target)
    return true
}

/**
 * Map a click inside a pane to the most specific shared trigger id — an
 * inner `target-*` gesture element when the tap landed on one, otherwise
 * the enclosing card. composedPath is ordered innermost-first.
 */
export function cardIdFromEvent(event: Event): string | null {
    const path = event.composedPath?.() ?? []
    for (const node of path) {
        const el = node as HTMLElement
        if (el?.id && isTriggerId(el.id)) return el.id
    }
    return null
}

/**
 * Gallery entries are keyed by scenario id; card elements carry an
 * `example-`/`case-` prefix, with a handful of historical aliases.
 */
const SCENARIO_CARD_ALIASES: Record<string, string> = {
    "custom-host": "case-component/motion-create",
    "initial-false": "case-initial-false",
    "style-motion-value": "case-style-motion-value",
    "color-hsla-rgba": "example-color-representation",
    "transition-negative-delay": "example-negative-delay",
    "unknown-type-fallback": "example-unknown-animation-type",
    "z-index-discrete": "example-z-index",
    "zero-unit-normalization": "example-zero-unit",
}

export function scenarioCardId(scenarioId: string): string {
    return SCENARIO_CARD_ALIASES[scenarioId] ?? `example-${scenarioId}`
}
