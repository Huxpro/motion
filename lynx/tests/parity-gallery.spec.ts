import { expect, test } from "@playwright/test"
import {
    ANIMATION_LIFECYCLE_CASE,
    API_METRICS,
    COLOR_HSLA_RGBA_CASE,
    COLOR_KEYFRAMES_CASE,
    CSS_CUSTOM_PROPERTY_CASE,
    CONVERGENCE_HISTORY,
    CONFORMANCE_METRICS,
    DELAY_CASE,
    DEFAULT_TRANSITION_CASE,
    DISPLAY_REVEAL_CASE,
    FUNCTION_VARIANTS_CASE,
    GALLERY_EXAMPLES,
    HOVER_GESTURE_CASE,
    INSTANT_TRANSITION_CASE,
    INITIAL_FALSE_CASE,
    KEYFRAME_TIMES_CASE,
    KEYFRAMES_CASE,
    MOTION_CREATE_CASE,
    NAMED_EASING_CASE,
    NAMED_VARIANTS_CASE,
    NEGATIVE_DELAY_CASE,
    NO_OP_TARGET_CASE,
    NO_OP_KEYFRAMES_CASE,
    NULL_KEYFRAME_CASE,
    PRIORITIZED_GAPS,
    REACTIVE_ANIMATE_CASE,
    REPEAT_INFINITY_CASE,
    REPEAT_LOOP_FINAL_CASE,
    REPEAT_DELAY_CASE,
    REPEAT_MIRROR_CASE,
    REPEAT_REVERSE_CASE,
    SPRING_CASE,
    SPRING_VELOCITY_CASE,
    STYLE_MOTION_VALUE_CASE,
    TAP_GESTURE_CASE,
    TRANSITION_FROM_CASE,
    UNKNOWN_TYPE_FALLBACK_CASE,
    UNSEEN_PROPERTY_CASE,
    VISIBILITY_REVEAL_CASE,
    WEIGHTED_LOSS,
    Z_INDEX_DISCRETE_CASE,
    ZERO_UNIT_NORMALIZATION_CASE,
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
    await expect(animated).toHaveCount(40, { timeout: 15_000 })

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
    const liveSelectors = ["#target-repeat-infinity"]
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

    expect(runtimeErrors).toEqual([])
    expect(consoleErrors).toEqual([])
})

test("manifest case: transition.default wins over top-level options", async ({
    browser,
}) => {
    const lynxPage = await browser.newPage()
    const webPage = await browser.newPage()

    await Promise.all([
        lynxPage.goto(`http://localhost:3000${previewUrl}`),
        webPage.goto("http://localhost:4173/?mode=baseline"),
    ])

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-default-transition")
        const x = () =>
            target.evaluate(
                (element) =>
                    new DOMMatrixReadOnly(getComputedStyle(element).transform)
                        .m41
            )

        await expect.poll(x).toBe(DEFAULT_TRANSITION_CASE.expected.startX)
        await page.locator("#example-default-transition").click()
        await page.waitForTimeout(DEFAULT_TRANSITION_CASE.expected.holdSampleMs)
        expect(
            await x(),
            `${renderer} ${DEFAULT_TRANSITION_CASE.upstream.testName}`
        ).toBe(DEFAULT_TRANSITION_CASE.expected.startX)
        await expect
            .poll(async () => Math.round(await x()))
            .toBe(DEFAULT_TRANSITION_CASE.expected.endX)
    }

    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: transition.from overrides the current value", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-transition-from")
        const x = () =>
            target.evaluate(
                (element) =>
                    new DOMMatrixReadOnly(getComputedStyle(element).transform)
                        .m41
            )

        await expect.poll(x).toBe(TRANSITION_FROM_CASE.expected.initialX)
        await page.locator("#example-transition-from").click()
        await page.waitForTimeout(TRANSITION_FROM_CASE.expected.earlySampleMs)
        const early = await x()
        expect(
            early,
            `${renderer} ${TRANSITION_FROM_CASE.upstream.testName}`
        ).toBeLessThan(TRANSITION_FROM_CASE.expected.maximumEarlyX)
        expect(
            early,
            `${renderer} should animate towards the target`
        ).toBeGreaterThanOrEqual(TRANSITION_FROM_CASE.expected.fromX)
        await expect
            .poll(async () => Math.round(await x()))
            .toBe(TRANSITION_FROM_CASE.expected.endX)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: transition type false applies immediately", async ({
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

    for (const page of [webPage, lynxPage]) {
        const target = page.locator("#target-instant-transition")
        const x = () =>
            target.evaluate(
                (element) =>
                    new DOMMatrixReadOnly(getComputedStyle(element).transform)
                        .m41
            )
        await expect.poll(x).toBe(INSTANT_TRANSITION_CASE.expected.startX)
        await page.locator("#example-instant-transition").click()
        const samples = await target.evaluate(
            (element, duration) =>
                new Promise<number[]>((resolve) => {
                    const values: number[] = []
                    const started = performance.now()
                    const sample = () => {
                        values.push(
                            new DOMMatrixReadOnly(
                                getComputedStyle(element).transform
                            ).m41
                        )
                        performance.now() - started >= duration
                            ? resolve(values)
                            : requestAnimationFrame(sample)
                    }
                    sample()
                }),
            INSTANT_TRANSITION_CASE.expected.sampleMs
        )
        expect(
            samples.find(
                (value) => value !== INSTANT_TRANSITION_CASE.expected.startX
            )
        ).toBe(INSTANT_TRANSITION_CASE.expected.endX)
        expect(samples.at(-1)).toBe(INSTANT_TRANSITION_CASE.expected.endX)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("regression: unmount suppresses an active animation completion", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await page.reload()
        const target = page.locator("#target-unmount-cancel")
        await expect(target).toBeVisible()
        await page.waitForTimeout(150)
        expect(
            await page.locator("#status-unmount-cancel").textContent(),
            `${renderer} should still be active before unmount`
        ).toBe("complete: 0")
        await page.locator("#example-unmount-cancel").click()
        await expect(target).toHaveCount(0)
        await page.waitForTimeout(100)
        expect(
            await page.locator("#status-unmount-cancel").textContent(),
            `${renderer} should not complete immediately after unmount`
        ).toBe("complete: 0")
        await page.waitForTimeout(2200)
        await expect(
            page.locator("#status-unmount-cancel"),
            `${renderer} should suppress completion after unmount`
        ).toHaveText("complete: 0")
    }
    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: initial false skips mount and preserves later updates", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await page.reload()
        const target = page.locator("#target-initial-false")
        const semanticStyle = () =>
            target.evaluate((element) => {
                const style = getComputedStyle(element)
                const transform = new DOMMatrixReadOnly(style.transform)
                return {
                    opacity: Number(style.opacity),
                    translateX: Math.round(transform.m41),
                }
            })

        await expect(page.locator("#case-initial-false")).toContainText(
            INITIAL_FALSE_CASE.upstream.testName
        )
        await expect.poll(semanticStyle).toEqual({
            opacity: 1,
            translateX: 24,
        })
        await page.waitForTimeout(250)
        await expect(
            page.locator("#status-initial-false"),
            `${renderer} should not run a mount animation`
        ).toHaveText("initial={false} · starts:0")

        await page.locator("#case-initial-false").click()
        await expect.poll(semanticStyle).toEqual({
            opacity: 1,
            translateX: 48,
        })
        await expect(
            page.locator("#status-initial-false"),
            `${renderer} should animate a later target update`
        ).toHaveText("initial={false} · starts:1")
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: a style MotionValue updates without a React rerender", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await page.reload()
        const target = page.locator("#target-style-motion-value")
        const translateX = () =>
            target.evaluate((element) =>
                Math.round(
                    new DOMMatrixReadOnly(getComputedStyle(element).transform)
                        .m41
                )
            )

        await expect(
            page.locator("#case-style-motion-value"),
            `${renderer} style MotionValue case should mount`
        ).toContainText(STYLE_MOTION_VALUE_CASE.upstream.testName)
        if (renderer === "Lynx") {
            await expect(target).toHaveAttribute("has-react-ref", "true")
            await target.evaluate(
                () =>
                    new Promise<void>((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => resolve())
                        )
                    )
            )
        }
        await expect
            .poll(translateX, {
                message: `${renderer} style-bound MotionValue start`,
            })
            .toBe(STYLE_MOTION_VALUE_CASE.expected.startX)
        await expect(page.locator("#status-style-motion-value")).toHaveText(
            `renders: ${STYLE_MOTION_VALUE_CASE.expected.renderCount}`
        )
        if (renderer === "Lynx") {
            await target.click({ force: true })
            expect(errors, "Lynx background MotionValue set errors").toEqual([])
        } else {
            await target.click()
        }
        await expect(
            page.locator("#target-style-motion-value"),
            `${renderer} style-bound MotionValue`
        ).toBeVisible()
        await expect
            .poll(translateX, {
                message: `${renderer} style-bound MotionValue end`,
            })
            .toBe(STYLE_MOTION_VALUE_CASE.expected.endX)
        await expect(page.locator("#status-style-motion-value")).toHaveText(
            `renders: ${STYLE_MOTION_VALUE_CASE.expected.renderCount}`
        )
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: a later target introduces a new transform property", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-unseen-property")
        const transform = () =>
            target.evaluate((element) => {
                const matrix = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                return { x: Math.round(matrix.m41), y: Math.round(matrix.m42) }
            })
        await expect.poll(transform).toEqual({
            x: UNSEEN_PROPERTY_CASE.expected.x,
            y: UNSEEN_PROPERTY_CASE.expected.startY,
        })
        await page.locator("#example-unseen-property").click()
        await expect.poll(transform).toEqual({
            x: UNSEEN_PROPERTY_CASE.expected.x,
            y: UNSEEN_PROPERTY_CASE.expected.endY,
        })
        expect(
            await transform(),
            `${renderer} ${UNSEEN_PROPERTY_CASE.upstream.testName}`
        ).toEqual({
            x: UNSEEN_PROPERTY_CASE.expected.x,
            y: UNSEEN_PROPERTY_CASE.expected.endY,
        })
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: display none switches to block before entrance", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-display-reveal")
        await expect(target).toHaveCSS("display", "none")
        await page.locator("#example-display-reveal").click({ force: true })
        await page.waitForTimeout(DISPLAY_REVEAL_CASE.expected.sampleMs)
        await expect(
            target,
            `${renderer} should reveal before opacity entrance completes`
        ).toHaveCSS("display", "block")
        const opacity = Number(
            await target.evaluate(
                (element) => getComputedStyle(element).opacity
            )
        )
        expect(opacity).toBeGreaterThan(0)
        expect(opacity).toBeLessThan(1)
        await expect(target).toHaveCSS("opacity", "1", {
            timeout: DISPLAY_REVEAL_CASE.expected.durationMs + 600,
        })
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: visibility hidden switches to visible before entrance", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-visibility-reveal")
        await expect(target).toHaveCSS("visibility", "hidden")
        await page.locator("#example-visibility-reveal").click()
        await page.waitForTimeout(VISIBILITY_REVEAL_CASE.expected.sampleMs)
        await expect(
            target,
            `${renderer} should reveal before opacity entrance completes`
        ).toHaveCSS("visibility", "visible")
        const opacity = Number(
            await target.evaluate(
                (element) => getComputedStyle(element).opacity
            )
        )
        expect(opacity).toBeGreaterThan(0)
        expect(opacity).toBeLessThan(1)
        await expect(target).toHaveCSS("opacity", "1", {
            timeout: VISIBILITY_REVEAL_CASE.expected.durationMs + 600,
        })
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: equal targets do not remain active", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-noop-target")
        await expect(target).toBeVisible()
        await page.waitForTimeout(NO_OP_TARGET_CASE.expected.settleMs)
        await expect(
            page.locator("#status-noop-target"),
            `${renderer} ${NO_OP_TARGET_CASE.upstream.testName}`
        ).toHaveText("idle")
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: equal keyframe arrays do not remain active", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await expect(page.locator("#target-noop-keyframes")).toBeVisible()
        await page.waitForTimeout(NO_OP_KEYFRAMES_CASE.expected.settleMs)
        await expect(
            page.locator("#status-noop-keyframes"),
            `${renderer} ${NO_OP_KEYFRAMES_CASE.upstream.testName}`
        ).toHaveText("idle")
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: spring velocity animates an equal target", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await expect(page.locator("#target-spring-velocity")).toBeVisible()
        await page.waitForTimeout(SPRING_VELOCITY_CASE.expected.sampleMs)
        await expect(
            page.locator("#status-spring-velocity"),
            `${renderer} ${SPRING_VELOCITY_CASE.upstream.testName}`
        ).toHaveText("animating")
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: zIndex applies without interpolation", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await expect(
            page.locator("#target-z-index"),
            `${renderer} ${Z_INDEX_DISCRETE_CASE.upstream.testName}`
        ).toHaveCSS("z-index", String(Z_INDEX_DISCRETE_CASE.expected.target))
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: unknown animation type does not crash", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        await expect(
            page.locator("#target-unknown-animation-type"),
            `${renderer} ${UNKNOWN_TYPE_FALLBACK_CASE.upstream.testName}`
        ).toBeVisible()
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: CSS custom property reaches its Web target", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-css-variable")
        const staticControl = page.locator(
            "#target-css-variable-static-control"
        )
        await expect(target).toBeVisible()
        await expect(staticControl).toHaveCSS(
            "background-color",
            "rgb(0, 0, 0)"
        )
        await expect
            .poll(
                () =>
                    target.evaluate((element) =>
                        getComputedStyle(element)
                            .getPropertyValue("--motion-color")
                            .trim()
                    ),
                { message: `${renderer} CSS custom property` }
            )
            .toBe("#000")
        await expect(target).toHaveCSS("background-color", "rgb(0, 0, 0)")
    }

    expect(errors).toEqual([])
    expect(CSS_CUSTOM_PROPERTY_CASE.status).toBe("partial")
    expect(CSS_CUSTOM_PROPERTY_CASE.evidence.native).toBe(true)
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: zero unit normalizes to an animatable number", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-zero-unit")
        await expect(
            target,
            `${renderer} ${ZERO_UNIT_NORMALIZATION_CASE.upstream.testName}`
        ).toHaveCSS(
            "border-radius",
            `${ZERO_UNIT_NORMALIZATION_CASE.expected.targetPx}px`,
            {
                timeout: 1000,
            }
        )
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: a null keyframe hydrates from the current value", async ({
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

    for (const [renderer, page] of [
        ["Lynx", lynxPage],
        ["Web", webPage],
    ] as const) {
        const target = page.locator("#target-null-keyframe")
        const x = () =>
            target.evaluate(
                (element) =>
                    new DOMMatrixReadOnly(getComputedStyle(element).transform)
                        .m41
            )

        await expect.poll(x).toBe(NULL_KEYFRAME_CASE.expected.startX)
        await page.locator("#example-null-keyframe").click()
        await page.waitForTimeout(NULL_KEYFRAME_CASE.expected.firstSampleMs)

        const firstSample = await x()
        expect(
            firstSample,
            `${renderer} ${NULL_KEYFRAME_CASE.upstream.testName}: ${firstSample}`
        ).toBeLessThan(NULL_KEYFRAME_CASE.expected.maximumFirstX)
        await expect
            .poll(async () => Math.round(await x()))
            .toBe(NULL_KEYFRAME_CASE.expected.endX)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
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

test("manifest case: keyframe times preserve duplicate boundary jumps", async ({
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
        const target = page.locator("#target-keyframe-times")
        const translateX = () =>
            target.evaluate((element) =>
                Number(
                    new DOMMatrixReadOnly(
                        getComputedStyle(element).transform
                    ).m41.toFixed(2)
                )
            )

        await expect.poll(translateX).toBe(KEYFRAME_TIMES_CASE.expected.startX)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-keyframe-times").click()

        const timeline = await target.evaluate(
            (element, duration) =>
                new Promise<Array<{ time: number; value: number }>>(
                    (resolve) => {
                        const startedAt = performance.now()
                        const samples: Array<{ time: number; value: number }> =
                            []
                        const sample = () => {
                            samples.push({
                                time: performance.now() - startedAt,
                                value: new DOMMatrixReadOnly(
                                    getComputedStyle(element).transform
                                ).m41,
                            })
                            performance.now() - startedAt >= duration
                                ? resolve(samples)
                                : requestAnimationFrame(sample)
                        }
                        sample()
                    }
                ),
            KEYFRAME_TIMES_CASE.expected.durationMs + 100
        )
        const firstChanged = timeline.find(
            ({ value }) => value > KEYFRAME_TIMES_CASE.expected.startX + 0.5
        )
        const beforeCompletion = timeline.filter(
            ({ time }) => time < KEYFRAME_TIMES_CASE.expected.durationMs - 40
        )
        expect(firstChanged).toBeDefined()
        expect(
            firstChanged!.value,
            `${KEYFRAME_TIMES_CASE.upstream.testName}: first=${
                firstChanged!.value
            }`
        ).toBeGreaterThanOrEqual(KEYFRAME_TIMES_CASE.expected.secondX - 1)
        expect(
            Math.max(...beforeCompletion.map(({ value }) => value)),
            `${KEYFRAME_TIMES_CASE.upstream.testName}: ${beforeCompletion
                .map(({ value }) => value.toFixed(1))
                .join(", ")}`
        ).toBeLessThanOrEqual(KEYFRAME_TIMES_CASE.expected.thirdX + 2)
        expect(timeline.at(-1)!.value).toBeCloseTo(
            KEYFRAME_TIMES_CASE.expected.endX,
            0
        )
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: named easing changes intermediate sampling", async ({
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
        const named = page.locator("#target-named-easing")
        const linear = page.locator("#target-linear-easing-control")
        const translateX = (target: typeof named) =>
            target.evaluate((element) =>
                Number(
                    new DOMMatrixReadOnly(
                        getComputedStyle(element).transform
                    ).m41.toFixed(2)
                )
            )

        await expect
            .poll(() => translateX(named))
            .toBe(NAMED_EASING_CASE.expected.startX)
        await expect
            .poll(() => translateX(linear))
            .toBe(NAMED_EASING_CASE.expected.startX)
        await named.scrollIntoViewIfNeeded()
        await page.locator("#example-named-easing").click()

        const lead = await page
            .locator("#target-named-easing, #target-linear-easing-control")
            .evaluateAll(
                (elements, duration) =>
                    new Promise<number>((resolve) => {
                        const namedElement = elements.find(
                            (element) => element.id === "target-named-easing"
                        )!
                        const linearElement = elements.find(
                            (element) =>
                                element.id === "target-linear-easing-control"
                        )!
                        const startedAt = performance.now()
                        let maximumLead = Number.NEGATIVE_INFINITY
                        const sample = () => {
                            const namedX = new DOMMatrixReadOnly(
                                getComputedStyle(namedElement).transform
                            ).m41
                            const linearX = new DOMMatrixReadOnly(
                                getComputedStyle(linearElement).transform
                            ).m41
                            maximumLead = Math.max(
                                maximumLead,
                                linearX - namedX
                            )
                            performance.now() - startedAt >= duration * 0.48
                                ? resolve(maximumLead)
                                : requestAnimationFrame(sample)
                        }
                        sample()
                    }),
                NAMED_EASING_CASE.expected.durationMs
            )
        expect(
            lead,
            `${NAMED_EASING_CASE.upstream.testName}: linear lead=${lead}`
        ).toBeGreaterThanOrEqual(NAMED_EASING_CASE.expected.minimumLinearLead)
        await expect
            .poll(() => translateX(named))
            .toBeCloseTo(NAMED_EASING_CASE.expected.endX, 0)
        await expect
            .poll(() => translateX(linear))
            .toBeCloseTo(NAMED_EASING_CASE.expected.endX, 0)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: color keyframes pass through green and settle blue", async ({
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
        const target = page.locator("#target-color-keyframes")
        const rgb = () =>
            target.evaluate((element) =>
                (getComputedStyle(element).backgroundColor.match(/\d+/g) ?? [])
                    .slice(0, 3)
                    .map(Number)
            )

        await expect
            .poll(rgb)
            .toEqual([COLOR_KEYFRAMES_CASE.expected.startRed, 0, 0])
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-color-keyframes").click()
        const maxGreenDominance = await target.evaluate(
            (element, sampleDuration) =>
                new Promise<number>((resolve) => {
                    const startedAt = performance.now()
                    let maximum = Number.NEGATIVE_INFINITY
                    const sample = () => {
                        const [red = 0, green = 0, blue = 0] = (
                            getComputedStyle(element).backgroundColor.match(
                                /\d+/g
                            ) ?? []
                        )
                            .slice(0, 3)
                            .map(Number)
                        maximum = Math.max(maximum, green - Math.max(red, blue))
                        if (performance.now() - startedAt >= sampleDuration) {
                            resolve(maximum)
                        } else {
                            setTimeout(sample, 16)
                        }
                    }
                    sample()
                }),
            900
        )

        expect(
            maxGreenDominance,
            COLOR_KEYFRAMES_CASE.upstream.testName
        ).toBeGreaterThan(80)
        await expect
            .poll(rgb)
            .toEqual([0, 0, COLOR_KEYFRAMES_CASE.expected.endBlue])
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: HSLA animates to RGBA", async ({ browser }) => {
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-color-representation")
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-color-representation").click()
        await page.waitForTimeout(COLOR_HSLA_RGBA_CASE.expected.sampleMs)
        const intermediate = await target.evaluate((element) =>
            (getComputedStyle(element).backgroundColor.match(/\d+/g) ?? [])
                .slice(0, 3)
                .map(Number)
        )
        expect(
            intermediate,
            `${renderer} should interpolate color`
        ).not.toEqual([
            COLOR_HSLA_RGBA_CASE.expected.startRed,
            COLOR_HSLA_RGBA_CASE.expected.startGreen,
            COLOR_HSLA_RGBA_CASE.expected.startBlue,
        ])
        expect(
            intermediate,
            `${renderer} should not jump to target`
        ).not.toEqual([
            COLOR_HSLA_RGBA_CASE.expected.endRed,
            COLOR_HSLA_RGBA_CASE.expected.endGreen,
            COLOR_HSLA_RGBA_CASE.expected.endBlue,
        ])
        await expect
            .poll(() =>
                target.evaluate((element) =>
                    (
                        getComputedStyle(element).backgroundColor.match(
                            /\d+/g
                        ) ?? []
                    )
                        .slice(0, 3)
                        .map(Number)
                )
            )
            .toEqual([
                COLOR_HSLA_RGBA_CASE.expected.endRed,
                COLOR_HSLA_RGBA_CASE.expected.endGreen,
                COLOR_HSLA_RGBA_CASE.expected.endBlue,
            ])
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: explicit spring overshoots and settles", async ({
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
        const target = page.locator("#target-spring")
        const x = () =>
            target.evaluate((element) => {
                const transform = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                return Number(transform.m41.toFixed(2))
            })

        await expect.poll(x).toBe(SPRING_CASE.expected.startX)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-spring").click()
        const peakX = await target.evaluate(
            (element, sampleDuration) =>
                new Promise<number>((resolve) => {
                    const startedAt = performance.now()
                    let peak = Number.NEGATIVE_INFINITY
                    const sample = () => {
                        const transform = new DOMMatrixReadOnly(
                            getComputedStyle(element).transform
                        )
                        peak = Math.max(peak, transform.m41)
                        if (performance.now() - startedAt >= sampleDuration) {
                            resolve(peak)
                        } else {
                            setTimeout(sample, 16)
                        }
                    }
                    sample()
                }),
            1_600
        )

        expect(
            peakX,
            `${SPRING_CASE.upstream.testName}: peak x=${peakX}`
        ).toBeGreaterThanOrEqual(SPRING_CASE.expected.minimumOvershootX)
        await expect.poll(x).toBeCloseTo(SPRING_CASE.expected.endX, 0)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: positive delay holds before animation", async ({
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
        const target = page.locator("#target-transition-delay")
        const x = () =>
            target.evaluate((element) => {
                const transform = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                return Number(transform.m41.toFixed(2))
            })

        await expect.poll(x).toBe(DELAY_CASE.expected.startX)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-transition-delay").click()
        const heldSamples = await target.evaluate(
            (element, sampleDuration) =>
                new Promise<number[]>((resolve) => {
                    const startedAt = performance.now()
                    const samples: number[] = []
                    const sample = () => {
                        const transform = new DOMMatrixReadOnly(
                            getComputedStyle(element).transform
                        )
                        samples.push(transform.m41)
                        if (performance.now() - startedAt >= sampleDuration) {
                            resolve(samples)
                        } else {
                            requestAnimationFrame(sample)
                        }
                    }
                    sample()
                }),
            DELAY_CASE.expected.delayMs - 100
        )

        expect(
            Math.max(...heldSamples),
            `${DELAY_CASE.upstream.testName}: ${heldSamples.join(", ")}`
        ).toBeLessThanOrEqual(DELAY_CASE.expected.startX + 2)
        await expect.poll(x).toBeGreaterThan(DELAY_CASE.expected.startX + 10)
        await expect.poll(x).toBeCloseTo(DELAY_CASE.expected.endX, 0)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: negative delay starts from elapsed time", async ({
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
        const target = page.locator("#target-negative-delay")
        const x = () =>
            target.evaluate((element) => {
                const transform = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                return Number(transform.m41.toFixed(2))
            })

        await expect.poll(x).toBe(NEGATIVE_DELAY_CASE.expected.startX)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-negative-delay").click()
        await expect
            .poll(x, { intervals: [16] })
            .not.toBe(NEGATIVE_DELAY_CASE.expected.startX)
        expect(
            await x(),
            NEGATIVE_DELAY_CASE.upstream.testName
        ).toBeGreaterThan(NEGATIVE_DELAY_CASE.expected.startX + 5)
        await page.waitForTimeout(200)
        expect(await x()).toBeCloseTo(NEGATIVE_DELAY_CASE.expected.endX, 0)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: infinite repeat remains live after its first duration", async ({
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
        const target = page.locator("#target-repeat-infinity")
        const rotation = () =>
            target.evaluate((element) => {
                const matrix = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                const degrees = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
                return (degrees + 360) % 360
            })

        await page.waitForTimeout(
            REPEAT_INFINITY_CASE.expected.duration * 1000 + 150
        )
        const afterFirstDuration = await rotation()
        await page.waitForTimeout(173)
        const later = await rotation()
        const angularDistance = Math.abs(
            ((later - afterFirstDuration + 540) % 360) - 180
        )
        expect(
            angularDistance,
            `${REPEAT_INFINITY_CASE.upstream.testName}: ${afterFirstDuration} → ${later}`
        ).toBeGreaterThan(10)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: reverse repeat reaches its target and returns", async ({
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
        const target = page.locator("#target-repeat-reverse")
        const scale = () =>
            target.evaluate((element) => {
                const transform = new DOMMatrixReadOnly(
                    getComputedStyle(element).transform
                )
                return Number(transform.a.toFixed(2))
            })

        await expect.poll(scale).toBe(REPEAT_REVERSE_CASE.expected.startScale)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-repeat-reverse").click()
        const peakScale = await target.evaluate(
            (element, sampleDuration) =>
                new Promise<number>((resolve) => {
                    const startedAt = performance.now()
                    let peak = Number.NEGATIVE_INFINITY
                    const sample = () => {
                        const transform = new DOMMatrixReadOnly(
                            getComputedStyle(element).transform
                        )
                        peak = Math.max(peak, transform.a)
                        if (performance.now() - startedAt >= sampleDuration) {
                            resolve(peak)
                        } else {
                            setTimeout(sample, 16)
                        }
                    }
                    sample()
                }),
            900
        )

        expect(
            peakScale,
            `${REPEAT_REVERSE_CASE.upstream.testName}: peak scale=${peakScale}`
        ).toBeGreaterThanOrEqual(REPEAT_REVERSE_CASE.expected.peakScale - 0.02)
        await expect
            .poll(scale)
            .toBeCloseTo(REPEAT_REVERSE_CASE.expected.startScale, 1)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: repeatDelay holds the endpoint", async ({ browser }) => {
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
        const target = page.locator("#target-repeat-delay")
        const scale = () =>
            target.evaluate((element) =>
                Number(
                    new DOMMatrixReadOnly(
                        getComputedStyle(element).transform
                    ).a.toFixed(2)
                )
            )
        await expect.poll(scale).toBe(REPEAT_DELAY_CASE.expected.startScale)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-repeat-delay").click()
        const timeline = await target.evaluate(
            (element, duration) =>
                new Promise<Array<{ time: number; value: number }>>(
                    (resolve) => {
                        const started = performance.now()
                        const values: Array<{ time: number; value: number }> =
                            []
                        const sample = () => {
                            values.push({
                                time: performance.now() - started,
                                value: new DOMMatrixReadOnly(
                                    getComputedStyle(element).transform
                                ).a,
                            })
                            performance.now() - started >= duration
                                ? resolve(values)
                                : requestAnimationFrame(sample)
                        }
                        sample()
                    }
                ),
            REPEAT_DELAY_CASE.expected.durationMs * 2 +
                REPEAT_DELAY_CASE.expected.holdMs +
                200
        )
        const endpointSamples = timeline.filter(
            ({ value }) => value >= REPEAT_DELAY_CASE.expected.endScale - 0.03
        )
        const firstEndpoint = endpointSamples[0]
        expect(firstEndpoint).toBeDefined()
        const firstRestart = timeline.find(
            ({ time, value }) =>
                time > firstEndpoint!.time &&
                value < REPEAT_DELAY_CASE.expected.endScale - 0.08
        )
        expect(firstRestart).toBeDefined()
        expect(firstRestart!.time - firstEndpoint!.time).toBeGreaterThanOrEqual(
            REPEAT_DELAY_CASE.expected.holdMs - 80
        )
        expect(timeline.at(-1)!.value).toBeCloseTo(
            REPEAT_DELAY_CASE.expected.endScale,
            1
        )
    }
    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: loop repeat with odd count settles at target", async ({
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

    for (const [renderer, page] of [
        ["Web", webPage],
        ["Lynx", lynxPage],
    ] as const) {
        const target = page.locator("#target-repeat-loop-final")
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-repeat-loop-final").click()
        await page.waitForTimeout(REPEAT_LOOP_FINAL_CASE.expected.settleMs)
        const x = await target.evaluate(
            (element) =>
                new DOMMatrixReadOnly(getComputedStyle(element).transform).m41
        )
        expect(
            x,
            `${renderer} ${REPEAT_LOOP_FINAL_CASE.upstream.testName}`
        ).toBeCloseTo(REPEAT_LOOP_FINAL_CASE.expected.endX, 0)
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: mirror repeat preserves easing direction", async ({
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
        const target = page.locator("#target-repeat-mirror")
        const x = () =>
            target.evaluate((element) =>
                Number(
                    new DOMMatrixReadOnly(
                        getComputedStyle(element).transform
                    ).m41.toFixed(2)
                )
            )
        await expect.poll(x).toBe(REPEAT_MIRROR_CASE.expected.startX)
        await target.scrollIntoViewIfNeeded()
        await page.locator("#example-repeat-mirror").click()
        const timeline = await target.evaluate(
            (element, duration) =>
                new Promise<Array<{ time: number; value: number }>>(
                    (resolve) => {
                        const started = performance.now()
                        const values: Array<{ time: number; value: number }> =
                            []
                        const sample = () => {
                            values.push({
                                time: performance.now() - started,
                                value: new DOMMatrixReadOnly(
                                    getComputedStyle(element).transform
                                ).m41,
                            })
                            performance.now() - started >= duration
                                ? resolve(values)
                                : requestAnimationFrame(sample)
                        }
                        sample()
                    }
                ),
            REPEAT_MIRROR_CASE.expected.durationMs * 2 + 100
        )
        const closest = (time: number) =>
            timeline.reduce((best, sample) =>
                Math.abs(sample.time - time) < Math.abs(best.time - time)
                    ? sample
                    : best
            ).value
        const outwardQuarter = closest(
            REPEAT_MIRROR_CASE.expected.durationMs * 0.25
        )
        const returnQuarter = closest(
            REPEAT_MIRROR_CASE.expected.durationMs * 1.25
        )
        expect(
            outwardQuarter,
            `${REPEAT_MIRROR_CASE.upstream.testName}: outward=${outwardQuarter}`
        ).toBeLessThanOrEqual(REPEAT_MIRROR_CASE.expected.outwardQuarterMaximum)
        expect(
            returnQuarter,
            `${REPEAT_MIRROR_CASE.upstream.testName}: return=${returnQuarter}`
        ).toBeGreaterThanOrEqual(
            REPEAT_MIRROR_CASE.expected.returnQuarterMinimum
        )
        expect(timeline.at(-1)!.value).toBeCloseTo(
            REPEAT_MIRROR_CASE.expected.startX,
            0
        )
    }
    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: tap applies, fires, and restores rest", async ({
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
        const target = page.locator("#target-gesture-priority")
        const lynxTouch = page === lynxPage
        const semanticStyle = () =>
            target.evaluate((element) => {
                const style = getComputedStyle(element)
                const transform = new DOMMatrixReadOnly(style.transform)
                return {
                    scale: Number(transform.a.toFixed(2)),
                    backgroundColor: style.backgroundColor,
                }
            })

        await expect.poll(semanticStyle).toEqual({
            scale: TAP_GESTURE_CASE.expected.restScale,
            backgroundColor: "rgb(255, 255, 255)",
        })
        if (lynxTouch) {
            await expect(target).toHaveAttribute("has-react-ref", "true")
            await target.evaluate(
                () =>
                    new Promise<void>((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => resolve())
                        )
                    )
            )
        }
        await target.scrollIntoViewIfNeeded()
        const box = await target.boundingBox()
        expect(box).not.toBeNull()
        const x = box!.x + box!.width / 2
        const y = box!.y + box!.height / 2
        const cdp = lynxTouch
            ? await page.context().newCDPSession(page)
            : undefined
        await target.hover()
        if (cdp) {
            await cdp.send("Input.dispatchTouchEvent", {
                type: "touchStart",
                touchPoints: [{ x, y }],
            })
        } else {
            await page.mouse.down()
        }
        await expect
            .poll(semanticStyle, {
                message:
                    page === lynxPage ? "Lynx tap target" : "Web tap target",
            })
            .toEqual({
                scale: TAP_GESTURE_CASE.expected.tapScale,
                backgroundColor: "rgb(255, 204, 0)",
            })
        if (cdp) {
            await cdp.send("Input.dispatchTouchEvent", {
                type: "touchEnd",
                touchPoints: [],
            })
        } else {
            await page.mouse.up()
        }
        await page.mouse.move(0, 0)
        await expect.poll(semanticStyle).toEqual({
            scale: TAP_GESTURE_CASE.expected.restScale,
            backgroundColor: "rgb(255, 255, 255)",
        })
        await expect(target).toContainText("Tapped 1")
    }

    expect(errors).toEqual([])
    await Promise.all([lynxPage.close(), webPage.close()])
})

test("manifest case: hover applies, fires, and restores rest", async ({
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
        const target = page.locator("#target-gesture-priority")
        const semanticStyle = () =>
            target.evaluate((element) => {
                const style = getComputedStyle(element)
                const transform = new DOMMatrixReadOnly(style.transform)
                return {
                    scale: Number(transform.a.toFixed(2)),
                    backgroundColor: style.backgroundColor,
                }
            })

        await expect.poll(semanticStyle).toEqual({
            scale: HOVER_GESTURE_CASE.expected.restScale,
            backgroundColor: "rgb(255, 255, 255)",
        })
        await target.scrollIntoViewIfNeeded()
        await target.hover()
        await expect
            .poll(semanticStyle, {
                message:
                    page === lynxPage
                        ? "Lynx hover target"
                        : "Web hover target",
            })
            .toEqual({
                scale: HOVER_GESTURE_CASE.expected.hoverScale,
                backgroundColor: "rgb(138, 180, 255)",
            })
        await expect(target).toContainText("Hovered 1")
        await page.mouse.move(0, 0)
        await expect.poll(semanticStyle).toEqual({
            scale: HOVER_GESTURE_CASE.expected.restScale,
            backgroundColor: "rgb(255, 255, 255)",
        })
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

test("manifest case: animation lifecycle reports start before complete", async ({
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

    const expectedEvents = `events:start:${ANIMATION_LIFECYCLE_CASE.expectedDefinition}|complete:${ANIMATION_LIFECYCLE_CASE.expectedDefinition}`
    for (const page of [lynxPage, webPage]) {
        const events = page.locator("#events-animation-lifecycle")
        await expect(events).toHaveText("events")
        await page.locator("#example-function-variant").click()
        await expect(events).toHaveText(expectedEvents)
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
