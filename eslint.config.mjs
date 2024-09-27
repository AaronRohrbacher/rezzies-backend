import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.browser,
    },
    ...pluginJs.configs.recommended,
    rules: {
      "no-unused-vars": "warn",  // Warn about unused variables
    },
  },
];