import css from "rollup-plugin-parcel-css";

/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
  input: "src/main.js",
  output: {
    file: "build/app.js",
    format: "umd",
    amd: {
      id: "app",
    },
    sourcemap: true,
  },
  plugins: [css({ minify: true })],
};

export default config;
