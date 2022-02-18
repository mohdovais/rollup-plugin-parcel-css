import path from "path";
import type { SourceMapV3 } from "./types";

const cwd = process.cwd();

function typeOf(subject: any): string {
  const exec = /\[[a-zA-Z]+ ([a-zA-Z]+)\]/.exec(
    Object.prototype.toString.call(subject)
  );
  return exec == null ? "unknown" : exec[1].toLowerCase();
}

function ensureArray<T>(subject: undefined | null | T | T[]): T[] {
  return Array.isArray(subject) ? subject : subject == null ? [] : [subject];
}

function runtimeRequire<T>(module: string) {
  try {
    require.resolve(module);
    return require(module) as T;
  } catch (e) {
    throw `Module ${module} is not installed.`;
  }
}

function base64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function mergeSourceMaps(maps: string[]) {
  const mergedSourceMap: SourceMapV3 = {
    version: 3,
    mappings: "AAAA",
    sources: [],
    sourcesContent: [],
    names: [],
  };

  maps.forEach((mapString) => {
    if (mapString !== "") {
      const mapv3 = JSON.parse(mapString) as SourceMapV3;

      mergedSourceMap.sources = mergedSourceMap.sources.concat(
        mapv3.sources.map((source) => path.relative(cwd, source))
      );
      mergedSourceMap.sourcesContent = mergedSourceMap.sourcesContent.concat(
        mapv3.sourcesContent
      );
    }
  });

  return JSON.stringify(mergedSourceMap);
}

export { typeOf, ensureArray, runtimeRequire, base64, mergeSourceMaps };
