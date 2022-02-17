/**
 * @typedef {import("rollup").RollupOptions} RollupOptions
 */

import css from "rollup-plugin-parcel-css";

export default [
  {
    input: "src/main.js",
    output: {
      file: "build/app.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [css({ minify: false })],
  },
  {
    input: "src/main.js",
    output: {
      file: "build/app.min.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [css({ minify: true })],
  },
  {
    input: "src/main.js",
    output: {
      file: "build/app-inline-sourcemap.js",
      format: "iife",
      sourcemap: "inline",
    },
    plugins: [css({ minify: false })],
  },
  {
    input: "src/main.js",
    output: {
      file: "build/app-inline-sourcemap.min.js",
      format: "iife",
      sourcemap: "inline",
    },
    plugins: [css({ minify: true })],
  },
];
