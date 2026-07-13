import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // These effects initiate async I/O or synchronize deliberately-local UI
      // state. The experimental rule reports those valid patterns wholesale.
      "react-hooks/set-state-in-effect": "off",
      // The font stylesheet is defined once in the App Router root layout,
      // despite this legacy Pages Router rule reporting otherwise.
      "@next/next/no-page-custom-font": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/meta/**",
  ]),
]);
