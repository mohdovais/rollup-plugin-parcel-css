import type { Dependency, TransformOptions, PseudoClasses } from "@parcel/css";
declare const CSS = "css";
declare const SASS = "sass";
declare const LESS = "less";
declare const SCSS = "scss";
export declare type PluginOptions = {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    minify?: boolean;
    targets?: TransformOptions["targets"];
    cssModules?: boolean;
    pseudoClasses?: PseudoClasses;
    loaders?: LoaderName | Loader | (Loader | LoaderName)[];
};
export declare type Lang = typeof CSS | typeof SASS | typeof SCSS | typeof LESS;
export declare type SourceMapV3 = {
    version: 3;
    mappings: "AAAA";
    sources: string[];
    sourcesContent: string[];
    names: string[];
};
export declare type TransformResult = {
    id: string;
    code: string;
    map: string;
    transformedCode: string;
    dependencies: void | Dependency[];
};
export declare type Cache = {
    source: string;
    isModule: boolean;
};
export declare type LoaderName = "sass" | "less";
export interface Loader<T = any> {
    test: RegExp;
    type: string;
    options?: T;
    process: (code: string, filename: string, options: T) => LoaderProcessResult | Promise<LoaderProcessResult>;
}
export declare type LoaderProcessResult = {
    css: string;
    sourceMap?: any;
    dependencies?: string[];
};
export {};
