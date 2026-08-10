import { defineConfig } from "@playwright/test"

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    retries: 0,
    reporter: "line",
    use: {
        baseURL: "http://localhost:3000",
        headless: true,
        viewport: { width: 1200, height: 900 },
    },
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000/__web_preview?casename=main.web.bundle",
        reuseExistingServer: false,
        timeout: 120_000,
    },
})
