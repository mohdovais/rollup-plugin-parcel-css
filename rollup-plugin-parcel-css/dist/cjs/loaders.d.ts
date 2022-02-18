import type { Loader, LoaderName, LoaderProcessResult } from "./types";
declare function resolveLoaders(config?: Loader[] | Loader | LoaderName): Map<string, Loader<any>>;
declare function hasLoaderForFile(loaders: Map<string, Loader>, fileName: string): boolean;
declare function runLoaders(loaders: Map<string, Loader>, code: string, fileName: string, sourceMap?: any): Promise<LoaderProcessResult>;
export { resolveLoaders, hasLoaderForFile, runLoaders };
