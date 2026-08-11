import { expect, test } from "@playwright/test"
import {
    API_METRICS,
    CONFORMANCE_METRICS,
    GALLERY_EXAMPLES,
    MOTION_CREATE_CASE,
} from "../src/conformance/cases.js"

const previewUrl = "/__web_preview?casename=main.web.bundle"

test("declarative Lynx gallery keeps Motion parity", async ({ page }) => {
    const runtimeErrors: string[] = []
    const consoleErrors: string[] = []
    page.on("pageerror", (error) => runtimeErrors.push(error.message))
    page.on("console", (message) => {
        if (message.type() === "error") {
            consoleErrors.push(message.text())
        }
    })

    await page.goto(previewUrl)

    // Playwright CSS locators pierce the open lynx-view shadow root.
    const animated = page.locator('lynx-view [has-react-ref="true"]')
    await expect(animated).toHaveCount(12, { timeout: 15_000 })

    const gesture = page.locator("#target-gesture-priority")
    const styleOf = (selector: string) =>
        page
            .locator(selector)
            .evaluate((element) => element.getAttribute("style") ?? "")

    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toMatch(/scale\(1(?:,\s*1)?\)/)
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toMatch(/background-color:\s*(?:#ffffff|rgb\(255,\s*255,\s*255\))/)
    await expect(page.getByText(/Lifecycle complete:visible/)).toBeVisible({
        timeout: 15_000,
    })

    // Infinite scalar, keyframe, reverse, and color animations must remain
    // live after their first iteration instead of freezing at the end frame.
    const liveSelectors = [
        "#target-repeat-infinity",
        "#target-keyframes",
        "#target-repeat-reverse",
        "#target-color-keyframes",
    ]
    const before = await Promise.all(liveSelectors.map(styleOf))
    await page.waitForTimeout(173)
    const after = await Promise.all(liveSelectors.map(styleOf))
    for (let index = 0; index < before.length; index++) {
        expect(after[index]).not.toBe(before[index])
    }

    for (let index = 0; index < 4; index++) {
        const selector = `#target-function-variant-${index}`
        await expect.poll(() => styleOf(selector)).toContain("opacity: 1")
        await expect
            .poll(() => styleOf(selector))
            .toMatch(/scale\(1(?:,\s*1)?\)/)
    }

    const reactiveBefore = await styleOf("#target-reactive-target")
    await page.locator("#example-reactive-target").click()
    await expect
        .poll(() => styleOf("#target-reactive-target"))
        .not.toBe(reactiveBefore)

    await page.locator("#example-array-variants").click()
    await expect
        .poll(() => styleOf("#target-array-variants"))
        .toContain("scale(1.12)")

    // Hold a native-style touch sequence so this checks whileTap activation,
    // not a click/tap pulse synthesized by the web demo.
    const buttonBox = await gesture.boundingBox()
    expect(buttonBox).not.toBeNull()
    const x = buttonBox!.x + buttonBox!.width / 2
    const y = buttonBox!.y + buttonBox!.height / 2

    await gesture.hover()
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("scale(1.08)")
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("rgb(138, 180, 255)")
    await expect(gesture).toContainText("Hovered 1")

    const cdp = await page.context().newCDPSession(page)
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
    })
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("scale(1.15)")
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("rgb(255, 204, 0)")

    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    })
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("scale(1.08)")
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toContain("rgb(138, 180, 255)")
    await page.mouse.move(0, 0)
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toMatch(/scale\(1(?:,\s*1)?\)/)
    await expect
        .poll(() => styleOf("#target-gesture-priority"))
        .toMatch(/background-color:\s*(?:#ffffff|rgb\(255,\s*255,\s*255\))/)
    await expect(gesture).toContainText("Tapped 1")

    expect(runtimeErrors).toEqual([])
    expect(consoleErrors).toEqual([])
})

test("manifest case: motion.create forwards and animates on Web and Lynx", async ({
    browser,
}) => {
    const lynxPage = await browser.newPage()
    const webPage = await browser.newPage()
    const errors: string[] = []

    for (const page of [lynxPage, webPage]) {
        page.on("pageerror", (error) => errors.push(error.message))
        page.on("console", (message) => {
            if (message.type() === "error") errors.push(message.text())
        })
    }

    await Promise.all([
        lynxPage.goto(`http://localhost:3000${previewUrl}`),
        webPage.goto("http://localhost:4173/?mode=baseline"),
    ])

    const targetSelector = `[id="target-${MOTION_CREATE_CASE.id}"]`
    const caseSelector = `[id="case-${MOTION_CREATE_CASE.id}"]`
    const lynxTarget = lynxPage.locator(targetSelector)
    const webTarget = webPage.locator(targetSelector)

    await expect(lynxTarget).toHaveCount(1)
    await expect(webTarget).toHaveCount(1)
    await expect(lynxPage.locator(caseSelector)).toContainText(
        MOTION_CREATE_CASE.upstream.testName
    )
    await expect(webPage.locator(caseSelector)).toContainText(
        MOTION_CREATE_CASE.upstream.testName
    )

    const semanticStyle = async (locator: typeof lynxTarget) =>
        locator.evaluate((element) => {
            const style = getComputedStyle(element)
            const transform = new DOMMatrixReadOnly(style.transform)
            return {
                opacity: Number(style.opacity),
                translateX: transform.m41,
            }
        })

    for (const target of [lynxTarget, webTarget]) {
        await expect
            .poll(() => semanticStyle(target))
            .toEqual(MOTION_CREATE_CASE.expected)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("evidence portal exposes examples, API inventory, and conformance metrics", async ({
    page,
}) => {
    await page.goto("http://localhost:4173/?view=overview")

    await expect(
        page.getByRole("heading", { name: /What works is visible/i })
    ).toBeVisible()
    await expect(
        page.getByText(`${API_METRICS.supported} supported`, { exact: false })
    ).toBeVisible()
    await expect(
        page
            .getByText(`${CONFORMANCE_METRICS.tracked}`, { exact: true })
            .first()
    ).toBeVisible()

    await page.getByRole("link", { name: "API matrix" }).click()
    await expect(
        page.getByRole("heading", { name: /Support is a contract/i })
    ).toBeVisible()
    await expect(page.locator(".matrix-row")).toHaveCount(API_METRICS.total)

    await page.getByRole("link", { name: "Conformance" }).click()
    await expect(page.locator(".case-row")).toHaveCount(
        CONFORMANCE_METRICS.tracked
    )

    await page.getByRole("link", { name: "Live comparison" }).click()
    await expect(page.locator(".scenario-row")).toHaveCount(
        GALLERY_EXAMPLES.length
    )
    await expect(page.locator("iframe")).toHaveCount(2)
})

test("evidence portal keeps every view usable at mobile width", async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 })

    for (const view of ["overview", "examples", "api", "conformance"]) {
        await page.goto(`http://localhost:4173/?view=${view}`)
        await expect(page.locator("main")).toBeVisible()
        const sizes = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            content: document.documentElement.scrollWidth,
        }))
        expect(sizes.content, `${view} must not overflow horizontally`).toBeLessThanOrEqual(
            sizes.viewport,
        )
    }
})
