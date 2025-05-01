import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/ui/cli/index.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
