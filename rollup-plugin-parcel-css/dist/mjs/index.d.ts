import type { Plugin } from "rollup";
declare type PluginOptions = {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    minify?: boolean;
};
declare function plugin(options?: PluginOptions): Plugin;
export default plugin;
