import type { Dependency, TransformOptions, PseudoClasses } from "@parcel/css";

const CSS = "css";
const SASS = "sass";
const LESS = "less";
const SCSS = "scss";

export type PluginOptions = {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  minify?: boolean;
  targets?: TransformOptions["targets"];
  cssModules?: boolean;
  pseudoClasses?: PseudoClasses;
  loaders?: LoaderName | Loader | (Loader | LoaderName)[];
};

export type Lang = typeof CSS | typeof SASS | typeof SCSS | typeof LESS;

export type SourceMapV3 = {
  version: 3;
  mappings: "AAAA";
  sources: string[];
  sourcesContent: string[];
  names: string[];
};

export type TransformResult = {
  id: string;
  code: string;
  map: string;
  transformedCode: string;
  transformedKeys: Map<string, string>;
  dependencies: void | Dependency[];
};

export type Cache = {
  source: string;
  isModule: boolean;
  transformedKeys: TransformResult["transformedKeys"];
};

export type LoaderName = "sass" | "less";

export interface Loader<T = any> {
  test: RegExp;
  type: string;
  options?: T;
  process: (
    code: string,
    filename: string,
    options: T
  ) => LoaderProcessResult | Promise<LoaderProcessResult>;
}

export type LoaderProcessResult = {
  css: string;
  sourceMap?: any; //SourceMapV3;
  dependencies?: string[];
};
