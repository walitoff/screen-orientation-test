/**
 * Locks browser screen orientation
 * @param orientation {"any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" |
 * "portrait-primary" | "portrait-secondary"}
 */
function lockOrientation(orientation) {
    "use strict";

    let oldLockFunction;
    let isNew = false;

    UIkit.notification.closeAll();
    try {
        oldLockFunction = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
    } catch (e) {
        console.debug("Old lock function not found", e.message);
        oldLockFunction = null;
    }
    let myScreenOrientation;
    try {
        myScreenOrientation = window.screen.orientation;
        if (myScreenOrientation && myScreenOrientation.lock) {
            isNew = true;
        }
    } catch (e) {
        console.debug("New lock function not found", e.message);
        myScreenOrientation = null;
    }
    if (!oldLockFunction && !isNew) {
        UIkit.notification("Screen orientation lock functions are not supported by this browser.", {status: 'danger'});
        return;
    }
    const method = isNew ? "new method 'screen.orientation.lock'" : "old method 'screen.lockOrientation'";
    try {
        if (isNew && myScreenOrientation) {
            myScreenOrientation.lock(orientation).then(() => {
                UIkit.notification(`Lock authorized with ${method}`, {status: "success"});
            }).catch((error) => {
                UIkit.notification(`Failed to lock with ${method}. ${error}`, {status: 'danger'});
            });
        } else if (oldLockFunction) {
            if (oldLockFunction(orientation)) {
                UIkit.notification(`Lock authorized with ${method}`, {status: 'success'});
            } else {
                UIkit.notification(`Lock denied with ${method}`, {status: 'danger'});
            }
        }
    } catch (e) {
        UIkit.notification(`Failed to lock with ${method}. ${e}`, {status: 'danger'});
    }
}

function toggleFullscreenMode() {
    "use strict";

    UIkit.notification.closeAll();
    if (!document.fullscreenElement) {
        console.log("Entering fullscreen mode");
        try {
            document.documentElement.requestFullscreen({navigationUI: "hide"}).then(() => {
                UIkit.notification("Entered fullscreen mode", {status: "success"});
            }).catch((error) => {
                UIkit.notification(`Failed to enter fullscreen mode. ${error}`, {status: 'danger'});
            });
        } catch (error) {
            UIkit.notification(`Fullscreen mode not supported. ${error}`, {status: 'danger'});
        }
    } else {
        console.log("Exiting fullscreen mode");
        try {
            document.exitFullscreen().then(() => {
                UIkit.notification("Exited fullscreen mode", {status: "success"});
            }).catch((error) => {
                UIkit.notification(`Failed to exit fullscreen mode. ${error}`, {status: 'danger'});
            });
        } catch (error) {
            UIkit.notification(`Fullscreen mode not supported. ${error}`, {status: 'danger'});
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
            return null;
        }
    }

    /**
     * Updates orientation type on screen
     * @param value OrientationType|null
     */
    function printScreenOrientation(value) {
        if (!value) {
            value = "The orientation API isn't supported in this browser :(";
        }
        orientationElement.value = value;
    }

    let orientation = getScreenOrientation();
    try {
        screen.orientation.addEventListener('change',
            function () {
                printScreenOrientation(getScreenOrientation());
            });
    } catch (e) {
        console.debug("Orientation change event not supported", e.message);
        orientation = null;
    }
    printScreenOrientation(orientation);

    document.getElementById("fullscreen-support")
        .innerHTML = ((typeof document.fullscreenEnabled !== "undefined" && document.fullscreenEnabled) ?
        "supported" : "not supported");
    document.getElementById("browserVersion").value = window.navigator.userAgent;
}

(function () {
    "use strict";

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
