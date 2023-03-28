"use strict";

document.addEventListener('uikit:init', () => {
    //UIKit is ready, we can work

    console.log("Started");
    var orientationElement = document.getElementById("activeOrientation");

    /**
     * Gets current screen orientation
     * @returns {OrientationType|null}
     */
    function getScreenOrientation() {
        try {
            if (screen.orientation.type)
                return screen.orientation.type;
        } catch (e) {
        }
        return null;
    }

    /**
     * Updates orientation type on screen
     * @param value OrientationType|null
     */
    function printScreenOrientation(value) {
        if (!value)
            value = "{{.Site.Params.NotSupported}}";
        orientationElement.value = value;
    }

    var orientation=getScreenOrientation();
    printScreenOrientation(orientation);

})
