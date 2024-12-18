module.exports = {
    extends: 'lighthouse:default',
    settings: {
        formFactor: 'mobile',
        skipAudits: [
            // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
            'uses-http2',
            // There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
            'bf-cache',
            "is-on-https",
            "server-response-time",
            "network-server-latency",
            //"seo/canonical",
            // The page is blocked from indexing, it's expected for our project
            "is-crawlable",
            // The document does not have a meta description.
            // It's expected because we have a single page for multiple languages, while meta-tag is for a specific
            // single language case.
            "meta-description",
            "valid-source-maps",
            "unsized-images",
            "offline-start-url",
            // Serve static resources with an efficient caching policy. We don't apply caching in this test.
            "uses-long-cache-ttl",
            // Text compression for HTML. It's a feature of a server, not relevant in this test.
            "uses-text-compression",
            // Use modern image formats. We don't need it because our image is injected in page.
            "modern-image-formats",
            // LCP may not show correct values when used in CI
            "largest-contentful-paint",
            "largest-contentful-paint-element",
            // We can't get rid of 3rd-party JS
            "unused-javascript",
        ],
    },
}
