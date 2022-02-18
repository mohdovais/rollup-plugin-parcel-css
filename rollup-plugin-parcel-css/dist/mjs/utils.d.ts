declare function typeOf(subject: any): string;
declare function ensureArray<T>(subject: undefined | null | T | T[]): T[];
declare function runtimeRequire<T>(module: string): T;
declare function base64(str: string): string;
declare function mergeSourceMaps(maps: string[]): string;
export { typeOf, ensureArray, runtimeRequire, base64, mergeSourceMaps };
