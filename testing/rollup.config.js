/**
 * @typedef {import("rollup").RollupOptions} RollupOptions
 */

import css from "rollup-plugin-parcel-css";

/**
 * @type {RollupOptions}
 */
const config = {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ minify: true, loaders: "sass" })],
};

export default [
  {
    input: "src/main.js",
    output: {
      file: "build/app.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [css({ minify: true })],
  },
  {
    input: "src/sass.js",
    output: {
      file: "build/sass.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [css({ minify: true, loaders: "sass" })],
  },
  {
    input: "src/less.js",
    output: {
      file: "build/less.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [css({ minify: true, loaders: "less" })],
  },
];
