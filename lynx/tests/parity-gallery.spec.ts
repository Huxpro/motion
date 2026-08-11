import { expect, test } from "@playwright/test"
import {
    API_METRICS,
    CONVERGENCE_HISTORY,
    CONFORMANCE_METRICS,
    FUNCTION_VARIANTS_CASE,
    GALLERY_EXAMPLES,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_VARIANTS_CASE,
    PRIORITIZED_GAPS,
    REACTIVE_ANIMATE_CASE,
    WEIGHTED_LOSS,
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
    await expect(animated).toHaveCount(13, { timeout: 15_000 })

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
    await page.locator("#example-function-variant").click()
    await expect(page.getByText(/Lifecycle complete:visible/)).toBeVisible({
        timeout: 15_000,
    })

    // Infinite scalar, keyframe, reverse, and color animations must remain
    // live after their first iteration instead of freezing at the end frame.
    const liveSelectors = [
        "#target-repeat-infinity",
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

test("manifest case: reactive animate uses its transition on later renders", async ({
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

    for (const page of [lynxPage, webPage]) {
        const target = page.locator("#target-reactive-target")
        const translateX = () =>
            target.evaluate((element) => {
                const transform = getComputedStyle(element).transform
                return new DOMMatrixReadOnly(transform).m41
            })

        await expect
            .poll(async () => Math.round(await translateX()))
            .toBe(REACTIVE_ANIMATE_CASE.expected.startX)

        await page.locator("#example-reactive-target").click()
        const samples: number[] = []
        for (let index = 0; index < 6; index++) {
            samples.push(await translateX())
            await page.waitForTimeout(45)
        }

        expect(
            samples.some(
                (value) =>
                    value > REACTIVE_ANIMATE_CASE.expected.startX + 1 &&
                    value < REACTIVE_ANIMATE_CASE.expected.endX - 1
            ),
            `${REACTIVE_ANIMATE_CASE.upstream.testName}: ${samples.join(", ")}`
        ).toBe(true)
        await expect
            .poll(async () => Math.round(await translateX()))
            .toBe(REACTIVE_ANIMATE_CASE.expected.endX)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: a changed string label resolves its named variant", async ({
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

    for (const page of [lynxPage, webPage]) {
        const target = page.locator("#target-named-variants")
        const semanticStyle = () =>
            target.evaluate((element) => {
                const style = getComputedStyle(element)
                const transform = new DOMMatrixReadOnly(style.transform)
                return {
                    opacity: Number(Number(style.opacity).toFixed(2)),
                    translateX: Math.round(transform.m41),
                    scale: Number(transform.a.toFixed(2)),
                }
            })

        await expect.poll(semanticStyle).toEqual({
            opacity: NAMED_VARIANTS_CASE.expected.restOpacity,
            translateX: NAMED_VARIANTS_CASE.expected.restX,
            scale: 0.9,
        })

        await page.locator("#example-named-variants").click()
        const samples: number[] = []
        for (let index = 0; index < 6; index++) {
            samples.push((await semanticStyle()).translateX)
            await page.waitForTimeout(45)
        }
        expect(
            samples.some(
                (value) =>
                    value > NAMED_VARIANTS_CASE.expected.restX + 1 &&
                    value < NAMED_VARIANTS_CASE.expected.activeX - 1
            ),
            `${NAMED_VARIANTS_CASE.upstream.testName}: ${samples.join(", ")}`
        ).toBe(true)
        await expect.poll(semanticStyle).toEqual({
            opacity: NAMED_VARIANTS_CASE.expected.activeOpacity,
            translateX: NAMED_VARIANTS_CASE.expected.activeX,
            scale: NAMED_VARIANTS_CASE.expected.activeScale,
        })
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: ordered keyframes pass through their peak and settle", async ({
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

    for (const page of [lynxPage, webPage]) {
        const target = page.locator("#target-keyframes")
        const translateY = () =>
            target.evaluate((element) => {
                const transform = getComputedStyle(element).transform
                return new DOMMatrixReadOnly(transform).m42
            })

        await expect
            .poll(async () => Math.round(await translateY()))
            .toBe(KEYFRAMES_CASE.expected.startY)
        await page.locator("#example-keyframes").click()

        const samples: number[] = []
        for (let index = 0; index < 12; index++) {
            samples.push(await translateY())
            await page.waitForTimeout(45)
        }
        expect(
            Math.min(...samples),
            `${KEYFRAMES_CASE.upstream.testName}: ${samples.join(", ")}`
        ).toBeLessThan(KEYFRAMES_CASE.expected.peakY + 8)
        await expect
            .poll(async () => Math.round(await translateY()))
            .toBe(KEYFRAMES_CASE.expected.endY)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: function variants receive custom and resolve distinct delays", async ({
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

    for (const page of [lynxPage, webPage]) {
        const targets = Array.from(
            { length: FUNCTION_VARIANTS_CASE.expected.count },
            (_, index) => page.locator(`#target-function-variant-${index}`)
        )
        const opacity = (index: number) =>
            targets[index].evaluate((element) =>
                Number(getComputedStyle(element).opacity)
            )
        const settledStyle = (index: number) =>
            targets[index].evaluate((element) => {
                const style = getComputedStyle(element)
                const transform = new DOMMatrixReadOnly(style.transform)
                return {
                    opacity: Number(Number(style.opacity).toFixed(2)),
                    scale: Number(transform.a.toFixed(2)),
                }
            })

        for (let index = 0; index < targets.length; index++) {
            await expect.poll(() => opacity(index)).toBe(0)
        }

        await page.locator("#example-function-variant").click()
        await expect.poll(() => opacity(0)).toBeGreaterThan(0.15)
        const delayedOpacities = await Promise.all(
            targets.map((_, index) => opacity(index))
        )
        expect(
            delayedOpacities[0] - delayedOpacities[delayedOpacities.length - 1],
            `${
                FUNCTION_VARIANTS_CASE.upstream.testName
            }: ${delayedOpacities.join(", ")}`
        ).toBeGreaterThan(0.1)

        for (let index = 0; index < targets.length; index++) {
            await expect
                .poll(() => settledStyle(index))
                .toEqual({
                    opacity: FUNCTION_VARIANTS_CASE.expected.visibleOpacity,
                    scale: FUNCTION_VARIANTS_CASE.expected.visibleScale,
                })
        }
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("evidence portal exposes examples, API inventory, and conformance metrics", async ({
    page,
}) => {
    await page.goto("http://localhost:4173/?view=overview")

    await expect(
        page.getByRole("heading", { name: "Motion / Lynx status" })
    ).toBeVisible()
    await expect(page.locator(".monitor-metric")).toHaveCount(6)
    await expect(
        page.locator(".capability-row:not(.capability-row-head)")
    ).toHaveCount(7)
    await expect(
        page.locator(".blocker-monitor .monitor-section-header > span")
    ).toHaveText(`${API_METRICS.blocked} API blockers`)
    await expect(page.locator(".priority-list li")).toHaveCount(
        Math.min(5, PRIORITIZED_GAPS.length)
    )
    await expect(page.locator(".loss-monitor-header > strong")).toHaveText(
        String(WEIGHTED_LOSS)
    )
    await expect(page.locator(".convergence-ledger li")).toHaveCount(
        CONVERGENCE_HISTORY.length
    )
    await expect(page.locator(".test-row:not(.test-row-head)")).toHaveCount(
        CONFORMANCE_METRICS.tracked
    )
    await expect(
        page.getByRole("heading", {
            name: `Upstream contract evidence (${CONFORMANCE_METRICS.tracked})`,
        })
    ).toBeVisible()

    await page.getByRole("link", { name: "API", exact: true }).click()
    await expect(
        page.getByRole("heading", { name: "Supported API surface." })
    ).toBeVisible()
    await expect(page.locator(".matrix-row")).toHaveCount(API_METRICS.total)

    await page.getByRole("link", { name: "Conformance" }).click()
    await expect(page.locator(".case-row")).toHaveCount(
        CONFORMANCE_METRICS.tracked
    )

    await page.getByRole("link", { name: "Examples" }).click()
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
        const undersizedText = await page.evaluate(() =>
            Array.from(document.querySelectorAll("body *"))
                .filter((element) => {
                    const rect = element.getBoundingClientRect()
                    const style = getComputedStyle(element)
                    return (
                        rect.width > 0 &&
                        rect.height > 0 &&
                        style.visibility !== "hidden" &&
                        (element.textContent ?? "").trim().length > 0 &&
                        element.children.length === 0 &&
                        Number.parseFloat(style.fontSize) < 12
                    )
                })
                .map((element) => ({
                    tag: element.tagName.toLowerCase(),
                    className: element.className,
                    text: (element.textContent ?? "").trim().slice(0, 80),
                    fontSize: getComputedStyle(element).fontSize,
                }))
        )
        expect(undersizedText, `${view} contains unreadable text`).toEqual([])
        const sizes = await page.evaluate(() => {
            const viewport = document.documentElement.clientWidth
            const offenders = Array.from(document.querySelectorAll("*"))
                .map((element) => {
                    const rect = element.getBoundingClientRect()
                    return {
                        tag: element.tagName.toLowerCase(),
                        className:
                            typeof element.className === "string"
                                ? element.className
                                : "",
                        left: Math.round(rect.left),
                        right: Math.round(rect.right),
                    }
                })
                .filter((item) => item.left < -1 || item.right > viewport + 1)
                .slice(0, 8)

            return {
                viewport,
                content: document.documentElement.scrollWidth,
                offenders,
            }
        })
        expect(
            sizes.content,
            `${view} must not overflow horizontally: ${JSON.stringify(
                sizes.offenders
            )}`
        ).toBeLessThanOrEqual(sizes.viewport)
    }
})
