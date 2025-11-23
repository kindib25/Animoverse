import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // --- TypeScript rules ---
      "@typescript-eslint/no-unused-vars": "off", // disable unused vars warning
      "@typescript-eslint/no-explicit-any": "off", // allow 'any' type

      // --- React rules ---
      "react-hooks/exhaustive-deps": "off", // disable missing deps warning
      "react/no-unescaped-entities": "off", // allow unescaped quotes/apostrophes

      // --- Next.js rules ---
      "@next/next/no-img-element": "off", // allow <img>
      "@next/next/no-html-link-for-pages": "off", // allow <a href> for pages

      // --- Other noise reducers ---
      "no-unused-vars": "off",
      "no-console": "off",
      "prefer-const": "off"
    },
  },
];

export default eslintConfig;
