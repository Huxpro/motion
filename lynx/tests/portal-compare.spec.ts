import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { expect, test, type Page } from "@playwright/test"

/**
 * The Examples comparison bridge (synced scrolling, mirrored taps) needs the
 * production same-origin layout, so these tests run against the assembled
 * evidence artifact rather than the dev servers. Build it first with
 * `npm run build:evidence`; the suite skips when the artifact is missing.
 */

const ARTIFACT = path.resolve("evidence-dist")
const PORT = 8129
const BASE = `http://localhost:${PORT}`

let server: ChildProcess | undefined

test.beforeAll(async () => {
    test.skip(!existsSync(ARTIFACT), "evidence-dist not built")
    server = spawn(
        "node",
        [path.resolve("scripts", "static-server.cjs"), ARTIFACT, String(PORT)],
        { stdio: "ignore" }
    )
    await expect
        .poll(
            async () => {
                try {
                    const response = await fetch(BASE)
                    return response.status
                } catch {
                    return 0
                }
            },
            { timeout: 15_000 }
        )
        .toBe(200)
})

test.afterAll(() => {
    server?.kill()
})

async function openLinkedExamples(page: Page) {
    await page.goto(`${BASE}/?view=examples`)
    await expect(page.locator(".compare-status-linked")).toBeVisible({
        timeout: 45_000,
    })
}

/** Find the tallest scrollable element, following open shadow roots. */
function findScroller(doc: Document): HTMLElement | null {
    let best: HTMLElement | null = null
    const walk = (root: ParentNode, depth: number) => {
        if (depth > 14) return
        for (const el of Array.from(root.querySelectorAll("*"))) {
            const html = el as HTMLElement
            if (
                html.scrollHeight > html.clientHeight + 40 &&
                html.clientHeight > 80 &&
                (!best || html.scrollHeight > best.scrollHeight)
            ) {
                best = html
            }
            if (el.shadowRoot) walk(el.shadowRoot, depth + 1)
        }
    }
    walk(doc, 0)
    return best
}

/** Shadow-piercing querySelector. */
function pierce(root: ParentNode, selector: string, depth = 0): Element | null {
    if (depth > 14) return null
    const hit = root.querySelector(selector)
    if (hit) return hit
    for (const el of Array.from(root.querySelectorAll("*"))) {
        if (el.shadowRoot) {
            const found = pierce(el.shadowRoot, selector, depth + 1)
            if (found) return found
        }
    }
    return null
}

test("panes link and scrolling the Web pane drives the Lynx pane", async ({
    page,
}) => {
    await openLinkedExamples(page)

    const result = await page.evaluate(
        async ({ findScrollerSource }) => {
            const findScrollerFn = new Function(
                "doc",
                `return (${findScrollerSource})(doc)`
            ) as (doc: Document) => HTMLElement | null
            const frames = Array.from(document.querySelectorAll("iframe"))
            const webScroller = findScrollerFn(frames[0].contentDocument!)!
            const lynxScroller = findScrollerFn(frames[1].contentDocument!)!
            const lynxBefore = lynxScroller.scrollTop
            webScroller.scrollTop = 900
            const deadline = Date.now() + 5000
            while (lynxScroller.scrollTop <= 100 && Date.now() < deadline) {
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
            return { lynxBefore, lynxAfter: lynxScroller.scrollTop }
        },
        { findScrollerSource: findScroller.toString() }
    )

    expect(result.lynxBefore).toBe(0)
    expect(result.lynxAfter).toBeGreaterThan(100)
})

test("tapping a card in the Web pane triggers the same Lynx scenario", async ({
    page,
}) => {
    await openLinkedExamples(page)

    const result = await page.evaluate(
        async ({ pierceSource }) => {
            const pierceFn = new Function(
                "root",
                "selector",
                `const pierce = ${pierceSource}; return pierce(root, selector)`
            ) as (root: ParentNode, selector: string) => Element | null
            const frames = Array.from(document.querySelectorAll("iframe"))
            const webDoc = frames[0].contentDocument!
            const lynxDoc = frames[1].contentDocument!
            const lynxEvents = pierceFn(
                lynxDoc,
                "#events-animation-lifecycle"
            )!
            const before = lynxEvents.textContent
            const card = webDoc.querySelector("#example-function-variant")!
            card.scrollIntoView()
            const rect = card.getBoundingClientRect()
            card.dispatchEvent(
                new MouseEvent("click", {
                    bubbles: true,
                    composed: true,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2,
                })
            )
            await new Promise((resolve) => setTimeout(resolve, 1500))
            return { before, after: lynxEvents.textContent }
        },
        { pierceSource: pierce.toString() }
    )

    expect(result.before).toBe("events")
    expect(result.after).toContain("start:visible")
})

test("scenario run buttons enable once the panes are linked", async ({
    page,
}) => {
    await openLinkedExamples(page)
    await expect(page.locator(".scenario-run").first()).toBeEnabled()
})

test("a mouse click presses the Lynx whileTap card directly", async ({
    page,
}) => {
    // Lynx for Web recognises motion gestures from touch only; the portal's
    // desktop tap adapter re-dispatches mouse clicks as synthetic touch.
    await openLinkedExamples(page)
    const lynxTarget = page
        .frameLocator("iframe")
        .nth(1)
        .locator("#target-gesture-priority")
    await lynxTarget.scrollIntoViewIfNeeded()
    await expect(lynxTarget).toHaveText("Press")
    await lynxTarget.click()
    await expect(lynxTarget).toHaveText("Tapped 1", { timeout: 5_000 })
})

test("pressing the Web whileTap card mirrors the press into Lynx", async ({
    page,
}) => {
    await openLinkedExamples(page)
    const frames = page.frameLocator("iframe")
    const webTarget = frames.first().locator("#target-gesture-priority")
    const lynxTarget = frames.nth(1).locator("#target-gesture-priority")
    await webTarget.scrollIntoViewIfNeeded()
    await expect(lynxTarget).toHaveText("Press")
    await webTarget.click()
    await expect(webTarget).toHaveText("Tapped 1", { timeout: 5_000 })
    await expect(lynxTarget).toHaveText("Tapped 1", { timeout: 5_000 })
})
