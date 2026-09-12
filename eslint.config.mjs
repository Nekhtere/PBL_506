import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local Claude Code worktrees are separate checkouts on their own
    // branches — linting them from the main checkout reports errors for code
    // this branch does not own. Already git-ignored; mirror that here.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
