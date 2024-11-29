import js from "@eslint/js";
import globals from "globals";

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
        ignores: [
            "src/public/**/*",
        ],
    },
];
