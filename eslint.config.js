import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js"],
    rules: {
      "prefer-const": "warn",
      "no-constant-binary-expression": "error",
    },
  },
]);
