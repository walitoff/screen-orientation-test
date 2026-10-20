import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        // code.js touches DOM/browser globals (document, screen, window), so we
        // run unit tests in a jsdom environment rather than plain Node.
        environment: "jsdom",
        include: ["test/**/*.test.js"],
        globals: true,
    },
});
