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
        ignores: [
            "src/public/**/*",
        ],
    },
    ...eslintPluginYml.configs['flat/recommended'],
    {
        rules: {
            // override/add rules settings here, such as:
            // 'yml/rule-name': 'error'
        }
    }
];
