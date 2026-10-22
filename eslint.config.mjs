import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/lib/fixtures/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/catalog/**", "**/catalog/**", "@/lib/content/compiler", "**/content/compiler"],
          allowTypeImports: true,
          message: "Presentation must consume compiled public queries; authoring data is build-only.",
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".contentlayer/**",
    ".public-content/**",
    ".course-baseline/**",
  ]),
]);

export default eslintConfig;
