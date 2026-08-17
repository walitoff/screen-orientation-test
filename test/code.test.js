import {beforeEach, afterEach, describe, expect, it, vi} from "vitest";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const CODE_PATH = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..", "src", "static", "js", "code.js"
);

/**
 * Loads a fresh copy of code.js with the given globals in place.
 * The module runs an IIFE on load, so globals (UIkit, screen) must be set first.
 */
function loadCode() {
    delete require.cache[require.resolve(CODE_PATH)];
    return require(CODE_PATH);
}

// Minimal UIkit mock. notification() is a spy; closeAll is attached to it.
// `_initialized: false` keeps the load-time IIFE from calling start() (which
// touches DOM elements absent in the unit test); it just registers a listener.
function makeUIkit() {
    const notification = vi.fn();
    notification.closeAll = vi.fn();
    return {notification, _initialized: false};
}

describe("code.js", () => {
    let code;

    beforeEach(() => {
        global.UIkit = makeUIkit();
        // jsdom provides document/window; ensure a clean orientation each test.
        vi.restoreAllMocks();
    });

    afterEach(() => {
        delete global.UIkit;
        delete global.screen;
    });

    describe("notify", () => {
        it("maps true to success status", () => {
            code = loadCode();
            code.notify("ok", true);
            expect(global.UIkit.notification).toHaveBeenCalledWith("ok", {status: "success"});
        });

        it("maps false to danger status", () => {
            code = loadCode();
            code.notify("bad", false);
            expect(global.UIkit.notification).toHaveBeenCalledWith("bad", {status: "danger"});
        });
    });

    describe("getScreenOrientation", () => {
        it("returns the orientation type when available", () => {
            global.screen = {orientation: {type: "portrait-primary"}};
            code = loadCode();
            expect(code.getScreenOrientation()).toBe("portrait-primary");
        });

        it("returns null when the orientation API is missing", () => {
            global.screen = {};
            code = loadCode();
            expect(code.getScreenOrientation()).toBeNull();
        });

        it("returns null (not undefined) when type is falsy", () => {
            global.screen = {orientation: {type: ""}};
            code = loadCode();
            expect(code.getScreenOrientation()).toBeNull();
        });
    });

    describe("lockOrientation", () => {
        it("notifies unsupported when neither API exists", () => {
            global.screen = {};
            code = loadCode();
            code.lockOrientation("portrait");
            expect(global.UIkit.notification).toHaveBeenCalledWith(
                expect.stringContaining("not supported"),
                {status: "danger"}
            );
        });

        it("uses the modern screen.orientation.lock when available", async () => {
            const lock = vi.fn().mockResolvedValue(undefined);
            global.screen = {orientation: {type: "portrait-primary", lock}};
            code = loadCode();
            code.lockOrientation("landscape");
            expect(lock).toHaveBeenCalledWith("landscape");
            await vi.waitFor(() => {
                expect(global.UIkit.notification).toHaveBeenCalledWith(
                    expect.stringContaining("Lock authorized"),
                    {status: "success"}
                );
            });
        });

        it("calls the legacy lock with `this` bound to screen (regression guard)", () => {
            // Regression test for the detached-call bug: invoking the stored
            // reference without binding `screen` throws "Illegal invocation".
            let capturedThis = null;
            const screenObj = {
                lockOrientation: function (orientation) {
                    capturedThis = this;
                    return orientation === "portrait";
                },
            };
            global.screen = screenObj;
            code = loadCode();
            code.lockOrientation("portrait");
            expect(capturedThis).toBe(screenObj);
            expect(global.UIkit.notification).toHaveBeenCalledWith(
                expect.stringContaining("Lock authorized"),
                {status: "success"}
            );
        });

        it("reports denial when the legacy lock returns false", () => {
            global.screen = {
                lockOrientation: function () {
                    return false;
                },
            };
            code = loadCode();
            code.lockOrientation("portrait");
            expect(global.UIkit.notification).toHaveBeenCalledWith(
                expect.stringContaining("Lock denied"),
                {status: "danger"}
            );
        });
    });
});
