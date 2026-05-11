import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["**/*.gen.ts"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
