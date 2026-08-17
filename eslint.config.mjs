import js from "@eslint/js";
import globals from "globals";
import eslintPluginYml from 'eslint-plugin-yml';

export default [
    js.configs.recommended, // Recommended config applied to all files
    // Override the recommended config
    {
        files: [
            "src/**/*.js",
        ],
        plugins: {},

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                UIkit: "readonly",
            },

            ecmaVersion: 2015,
            sourceType: "script",
        },

        settings: {},
        rules: {},
    },
    {
        // Settings for configuration files and Node-side scripts
        files: [
            "*.js",
            "*.mjs",
            "scripts/**/*.js",
            "scripts/**/*.mjs",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
    },
    {
        // Unit tests run in Node with jsdom; allow Node globals and modern syntax.
        files: [
            "test/**/*.js",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
    },
    {
        ignores: [
            "src/public/**/*",
            "visual-output/**/*",
        ],
    },
    ...eslintPluginYml.configs['flat/recommended']
];
