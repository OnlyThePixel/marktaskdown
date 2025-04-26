// @ts-check

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import url from "url";
import react from "eslint-plugin-react";

const gitignorePath = url.fileURLToPath(
  new url.URL(".gitignore", import.meta.url)
);

export default tseslint.config([
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
  },
  eslintConfigPrettier,
]);
