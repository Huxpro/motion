import { expect, test } from "@playwright/test"

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
    await expect(animated).toHaveCount(9, { timeout: 15_000 })

    const styleAt = (index: number) =>
        animated.nth(index).evaluate((element) =>
            element.getAttribute("style") ?? ""
        )

    await expect.poll(() => styleAt(0)).toMatch(/scale\(1(?:,\s*1)?\)/)
    await expect
        .poll(() => styleAt(0))
        .toMatch(/background-color:\s*(?:#ffffff|rgb\(255,\s*255,\s*255\))/)
    await expect(page.getByText(/Lifecycle complete:visible/)).toBeVisible({
        timeout: 15_000,
    })

    // Infinite scalar, keyframe, reverse, and color animations must remain
    // live after their first iteration instead of freezing at the end frame.
    const before = await Promise.all([1, 2, 3, 4].map(styleAt))
    await page.waitForTimeout(173)
    const after = await Promise.all([1, 2, 3, 4].map(styleAt))
    for (let index = 0; index < before.length; index++) {
        expect(after[index]).not.toBe(before[index])
    }

    for (let index = 5; index < 9; index++) {
        await expect.poll(() => styleAt(index)).toContain("opacity: 1")
        await expect
            .poll(() => styleAt(index))
            .toMatch(/scale\(1(?:,\s*1)?\)/)
    }

    // Hold a native-style touch sequence so this checks whileTap activation,
    // not a click/tap pulse synthesized by the web demo.
    const buttonBox = await animated.nth(0).boundingBox()
    expect(buttonBox).not.toBeNull()
    const x = buttonBox!.x + buttonBox!.width / 2
    const y = buttonBox!.y + buttonBox!.height / 2

    await animated.nth(0).hover()
    await expect.poll(() => styleAt(0)).toContain("scale(1.08)")
    await expect.poll(() => styleAt(0)).toContain("rgb(138, 180, 255)")
    await expect(animated.nth(0)).toContainText("Hovered 1")

    const cdp = await page.context().newCDPSession(page)
    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
    })
    await expect.poll(() => styleAt(0)).toContain("scale(1.15)")
    await expect.poll(() => styleAt(0)).toContain("rgb(255, 204, 0)")

    await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
    })
    await expect.poll(() => styleAt(0)).toContain("scale(1.08)")
    await expect.poll(() => styleAt(0)).toContain("rgb(138, 180, 255)")
    await page.mouse.move(0, 0)
    await expect.poll(() => styleAt(0)).toMatch(/scale\(1(?:,\s*1)?\)/)
    await expect
        .poll(() => styleAt(0))
        .toMatch(/background-color:\s*(?:#ffffff|rgb\(255,\s*255,\s*255\))/)
    await expect(animated.nth(0)).toContainText("Tapped 1")

    expect(runtimeErrors).toEqual([])
    expect(consoleErrors).toEqual([])
})
