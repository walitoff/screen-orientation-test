/**
 * Shows a UIkit notification with a success or danger status.
 * @param message {string} text to display
 * @param isSuccess {boolean} true for a success status, false for danger
 */
function notify(message, isSuccess) {
    "use strict";

    UIkit.notification(message, {status: isSuccess ? "success" : "danger"});
}

/**
 * Locks browser screen orientation
 * @param orientation {"any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" |
 * "portrait-primary" | "portrait-secondary"}
 */
function lockOrientation(orientation) {
    "use strict";

    // `oldLockFunction` holds the deprecated synchronous API (returns a boolean);
    // `isNew` tracks whether the modern promise-based `screen.orientation.lock` is available.
    let oldLockFunction;
    let isNew = false;

    // Clear any notifications from a previous attempt so results don't stack up.
    UIkit.notification.closeAll();
    try {
        // Legacy API, with vendor-prefixed variants for older Firefox/IE. Wrapped in
        // try/catch because merely accessing these can throw in some locked-down browsers.
        oldLockFunction = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
    } catch (e) {
        console.debug("Old lock function not found", e.message);
        oldLockFunction = null;
    }
    let myScreenOrientation;
    try {
        // Modern API. Present in most current mobile browsers; absent on desktop Safari.
        myScreenOrientation = window.screen.orientation;
        if (myScreenOrientation && myScreenOrientation.lock) {
            isNew = true;
        }
    } catch (e) {
        console.debug("New lock function not found", e.message);
        myScreenOrientation = null;
    }
    if (!oldLockFunction && !isNew) {
        notify("Screen orientation lock functions are not supported by this browser.", false);
        return;
    }
    // Prefer the modern API when available; the label is reused in every result message below.
    const method = isNew ? "new method 'screen.orientation.lock'" : "old method 'screen.lockOrientation'";
    try {
        if (isNew && myScreenOrientation) {
            // Modern API is async: report success/failure from the returned promise.
            myScreenOrientation.lock(orientation).then(() => {
                notify(`Lock authorized with ${method}`, true);
            }).catch((error) => {
                notify(`Failed to lock with ${method}. ${error}`, false);
            });
        } else if (oldLockFunction) {
            // Call through `screen` so the native method keeps its `this` binding;
            // invoking the detached reference throws "Illegal invocation" in strict mode.
            if (oldLockFunction.call(screen, orientation)) {
                notify(`Lock authorized with ${method}`, true);
            } else {
                notify(`Lock denied with ${method}`, false);
            }
        }
    } catch (e) {
        notify(`Failed to lock with ${method}. ${e}`, false);
    }
}

/**
 * Toggles the browser's fullscreen mode. Many browsers only allow orientation
 * locking while in fullscreen, so this is usually a prerequisite for lockOrientation().
 */
function toggleFullscreenMode() {
    "use strict";

    UIkit.notification.closeAll();
    // `document.fullscreenElement` is null when not in fullscreen, so this toggles based on current state.
    if (!document.fullscreenElement) {
        console.log("Entering fullscreen mode");
        if (document.documentElement.requestFullscreen && typeof document.documentElement.requestFullscreen === "function") {
            document.documentElement.requestFullscreen({navigationUI: "hide"}).then(() => {
                notify("Entered fullscreen mode", true);
            }).catch((error) => {
                notify(`Failed to enter fullscreen mode. ${error}`, false);
            });
        } else {
            notify("Fullscreen mode not supported", false);
        }
    } else {
        console.log("Exiting fullscreen mode");
        if (document.exitFullscreen && typeof document.exitFullscreen === "function") {
            document.exitFullscreen().then(() => {
                notify("Exited fullscreen mode", true);
            }).catch((error) => {
                notify(`Failed to exit fullscreen mode. ${error}`, false);
            });
        } else {
            notify("Fullscreen mode not supported", false);
        }
    }
}

function start() {
    "use strict";

    console.log("Started");
    const orientationElement = document.getElementById("activeOrientation");

    /**
     * Gets current screen orientation
     * @returns {OrientationType|null}
     */
    function getScreenOrientation() {
        try {
            if (screen.orientation.type) {
                return screen.orientation.type;
            }
        } catch (e) {
            console.debug("Orientation API not supported", e.message);
        }
        return null;
    }

    /**
     * Updates orientation type on screen
     * @param value OrientationType|null
     */
    function printScreenOrientation(value) {
        orientationElement.value = value || "The orientation API isn't supported in this browser :(";
    }

    // Read the initial orientation, then keep the field in sync as the device rotates.
    let orientation = getScreenOrientation();
    try {
        screen.orientation.addEventListener('change',
            function () {
                printScreenOrientation(getScreenOrientation());
            });
    } catch (e) {
        // If the change event can't be subscribed to, the API is effectively unsupported here.
        console.debug("Orientation change event not supported", e.message);
        orientation = null;
    }
    printScreenOrientation(orientation);

    // Report whether the Fullscreen API is available, and show the raw user agent for reference.
    document.getElementById("fullscreen-support")
        .innerHTML = ((typeof document.fullscreenEnabled !== "undefined" && document.fullscreenEnabled) ?
        "supported" : "not supported");
    document.getElementById("browserVersion").value = window.navigator.userAgent;
}

(function () {
    "use strict";

    // `_initialized` is a private UIkit field; checked to cover the race where UIkit
    // finished initializing before this script ran (so the `uikit:init` event already fired).
    if (typeof UIkit !== "undefined" && UIkit._initialized) {
        start();
    } else {
        document.addEventListener('uikit:init', () => {
            //UIKit is ready, we can work
            start();
        });
    }
}());

/*exported toggleFullscreenMode, lockOrientation */
