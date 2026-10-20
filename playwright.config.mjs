import {defineConfig} from "@playwright/test";

// Visual-regression config. The spec drives Chromium against a running Hugo
// server and produces expected/actual/heatmap images per viewport under
// visual-output/. Baselines live in test/visual/baseline/.
export default defineConfig({
    testDir: "test/visual",
    testMatch: "**/*.spec.js",
    // Screenshots are deterministic; no retries so a real diff isn't masked.
    retries: 0,
    // Serialize so image writes to shared folders don't race.
    workers: 1,
    reporter: [["list"]],
    use: {
        baseURL: process.env.BASE_URL || "http://localhost:1313",
        // Fixed device scale so rendered pixel dimensions are stable across machines.
        deviceScaleFactor: 1,
    },
    // Start the Hugo server automatically unless one is already running (CI reuses it).
    webServer: {
        command: "hugo server --environment production --port 1313",
        cwd: "src",
        url: "http://localhost:1313",
        reuseExistingServer: true,
        timeout: 60_000,
    },
});
