// see https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md
export default {
    extends: 'lighthouse:default',
    settings: {
        // audits can be found here:
        // https://github.com/GoogleChrome/lighthouse/blob/main/core/config/default-config.js
        skipAudits: [
            'is-on-https',
            'canonical', // for staging sites this will always be incorrect
            'maskable-icon',
            'valid-source-maps',
            'unsized-images',
            'offline-start-url',
        ],
    },
};
