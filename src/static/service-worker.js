// Name of the Cache Storage bucket that holds this version of the app shell.
//
// HOW TO USE / WHEN TO CHANGE IT:
// Bump the version suffix (e.g. "-v1" -> "-v2") whenever you change any file listed
// in SHELL below, or the SHELL list itself. The name acts as a cache-busting key:
//   - On the next visit the browser installs the new worker and precaches under the new name.
//   - The `activate` handler then deletes every cache whose key !== CACHE_NAME,
//     so the old shell is purged and clients stop serving stale assets.
// If you edit a shell file WITHOUT bumping this, returning visitors keep getting the
// cached (old) copy until the cache happens to be evicted. When in doubt, bump it.
const CACHE_NAME = "orientation-test-v1";

// App shell: the files needed to render the page offline. Paths are root-relative
// so they resolve correctly regardless of the deployment base URL's host.
const SHELL = [
    "./",
    "css/styles.css",
    "js/code.js",
    "images/phone.jpg",
    "site.webmanifest"
];

self.addEventListener("install", function (event) {
    "use strict";

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(SHELL);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    "use strict";

    // Drop caches from previous versions so stale assets don't linger.
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
                return undefined;
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    "use strict";

    // Only handle same-origin GET requests; let the CDN (UIkit) and others go to network.
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    // Cache-first: serve the cached shell instantly, fall back to network and cache the result.
    event.respondWith(
        caches.match(event.request).then(function (cached) {
            return cached || fetch(event.request).then(function (response) {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, copy);
                    });
                }
                return response;
            });
        })
    );
});
