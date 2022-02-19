import css from "rollup-plugin-parcel-css";

export default {
  input: "./src/main.js",
  output: {
    dir: "../../test_builds/css-modules",
    format: "esm",
    sourcemap: true,
  },
  plugins: [css({ minify: true, loaders: "less" })],
};
