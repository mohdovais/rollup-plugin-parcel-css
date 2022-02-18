/**
 * @typedef {import("rollup").RollupOptions} RollupOptions
 */

import css from "rollup-plugin-parcel-css";

export default {
  input: "src/main.js",
  output: {
    file: "build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ minify: false, loaders: "sass" })],
};
