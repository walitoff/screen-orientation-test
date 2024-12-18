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
        // Settings for configuration files
        files: [
            "*.js",
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
        ],
    },
    ...eslintPluginYml.configs['flat/recommended']
];
