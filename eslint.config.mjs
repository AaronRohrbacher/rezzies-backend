import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "module" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
    }
  },
  {
    ignores: ["__tests__/"]
  }
];