import * as fs from "node:fs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import type { RollupOptions } from "rollup";

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf-8")) as {
  version: string;
  description: string;
};

const isProduction = process.env.NODE_ENV === "production";

const config: RollupOptions = {
  input: "src/ContentScript/main.ts",
  output: {
    file: "dist/src/ContentScript/index.js",
    format: "iife",
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": () => isProduction ? JSON.stringify("production") : JSON.stringify("development"),
      __dirname: (id) => isProduction ? "''" : `'${id}'`,
      __app_version: () => `'${manifest.version}'`,
      __app_description: () => `'${manifest.description}'`,
      preventAssignment: true,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        allowJs: false,
      },
    }),
    ...(isProduction ? [terser()] : []),
  ],
};

export default config;
