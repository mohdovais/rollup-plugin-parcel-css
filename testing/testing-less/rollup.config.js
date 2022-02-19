import css from "rollup-plugin-parcel-css";

export default {
  input: "./src/main.js",
  output: {
    file: "../../test_builds/less/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ minify: true, loaders: "less" })],
};
