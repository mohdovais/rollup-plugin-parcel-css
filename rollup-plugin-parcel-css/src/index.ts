import path from "path";
import css from "@parcel/css";
import { createFilter } from "rollup-pluginutils";
import type { Plugin } from "rollup";
import type {
  TransformOptions,
  CSSModuleExports,
  Dependency,
} from "@parcel/css";

const cssRe = /(?:\.(module))?\.((?:le|s?c)ss)$/;

const cwd = process.cwd();

const base64 = (str: string) => Buffer.from(str, "utf8").toString("base64");

type SourceMapV3 = {
  version: 3;
  mappings: "AAAA";
  sources: string[];
  sourcesContent: string[];
  names: string[];
};

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

function transformCSSModuleExports(cssModuleExports: CSSModuleExports) {
  const keys = Object.keys(cssModuleExports || {});
  let file = "";
  keys.forEach((key) => {
    file += `export const ${key} = "${cssModuleExports[key].name}"\n`;
  });
  if (keys.length > 0) {
    file += `export default { ${keys.join(", ")} }\n`;
  } else {
    return "const unused = ''; export default { unused };";
  }
  return file;
}

type TransformResult = {
  id: string;
  code: string;
  map: string;
  transformedCode: string;
  dependencies: void | Dependency[];
};

function tranform(options: TransformOptions): Promise<TransformResult> {
  return new Promise((resolve, reject) => {
    let { code, map, dependencies, exports } = css.transform(options);

    resolve({
      id: options.filename,
      code: exports == null ? "" : transformCSSModuleExports(exports),
      map: (map && map.toString()) || "",
      transformedCode: code.toString(),
      dependencies,
    });
  });
}

type PluginOptions = {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  minify?: boolean;
};

type Cache = {
  source: string;
  isModule: boolean;
};

function plugin(options: PluginOptions = {}): Plugin {
  const filter = createFilter(options.include, options.exclude);
  const { minify = false } = options;
  const cache = new Map<string, Cache>();
  const seenNonCSSModuleIds = new Map<string, string[]>();

  return {
    name: "parcel-css",

    async resolveId(source, importer) {
      const exec = cssRe.exec(source);
      if (
        filter(source) &&
        exec != null &&
        exec[1] == null &&
        importer != null
      ) {
        const id = path.resolve(path.dirname(importer), source);
        const idArray = seenNonCSSModuleIds.get(importer);

        if (idArray) {
          idArray.push(id);
        } else {
          seenNonCSSModuleIds.set(importer, [id]);
        }
      }
      return null;
    },

    async transform(fileContent, fileName) {
      const exec = cssRe.exec(fileName);
      if (!filter(fileName) || exec == null) {
        return null;
      }
      const cssModules = exec[1] === "module";
      const type = exec[2]; // less/scss @todo

      const result = await tranform({
        code: Buffer.from(fileContent),
        filename: fileName,
        cssModules,
        analyzeDependencies: true,
      });

      cache.set(fileName, {
        source: fileContent,
        isModule: cssModules,
      });

      return {
        code: result.code,
        map: { mappings: "" },
      };
    },

    async renderChunk(_, chunk, outputOptions) {
      const { modules } = chunk;
      const fileName = chunk.fileName.replace(/\.[a-zA-Z]+$/, ".css");
      const sourceMapOption = outputOptions.sourcemap;
      const cssModuleIds: string[] = [];
      const cssNonModuleIds = new Map();

      Object.keys(modules).forEach((id) => {
        if (cssRe.test(id)) {
          cssModuleIds.push(id);
        } else if (seenNonCSSModuleIds.has(id)) {
          (seenNonCSSModuleIds.get(id) || []).forEach((seenIds) => {
            cssNonModuleIds.set(seenIds, true);
          });
        }
      });

      const results = await Promise.all(
        Array.from(cssNonModuleIds.keys())
          .concat(cssModuleIds)
          .map((id) => {
            const { source = "", isModule = false } = cache.get(id) || {};
            const unusedSymbols = modules[id]?.removedExports ?? [];

            return tranform({
              filename: id,
              code: Buffer.from(source),
              sourceMap: !!outputOptions.sourcemap,
              cssModules: isModule,
              unusedSymbols,
              minify,
            });
          })
      );

      let sources = results.map((r) => r.transformedCode).join("");

      if (sources !== "") {
        let sourceMaps = mergeSourceMaps(results.map((r) => r.map));

        if (sourceMapOption === "inline") {
          sources += `\n/*# sourceMappingURL=data:application/json;base64,${base64(
            sourceMaps
          )}*/`;
        } else if (sourceMapOption === true) {
          sources += `\n/*# sourceMappingURL=${path.basename(fileName)}.map */`;

          this.emitFile({
            fileName: fileName + ".map",
            type: "asset",
            source: sourceMaps,
          });
        }

        this.emitFile({
          fileName,
          type: "asset",
          source: sources,
        });
      }

      return null;
    },
  };
}
export default plugin;
