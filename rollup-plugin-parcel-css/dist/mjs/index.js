import path from "path";
import css from "@parcel/css";
import { createFilter } from "rollup-pluginutils";
const cssRe = /(?:\.(module))?\.((?:le|s?c)ss)$/;
const base64 = (str) => Buffer.from(str, "utf8").toString("base64");
function mergeSourceMaps(maps) {
    const sourcemap = {
        version: 3,
        mappings: "AAAA",
        sources: [],
        sourcesContent: [],
        names: [],
    };
    maps.forEach((mapString) => {
        if (mapString !== "") {
            const map = JSON.parse(mapString);
            sourcemap.sources = sourcemap.sources.concat(map.sources);
            sourcemap.sourcesContent = sourcemap.sourcesContent.concat(map.sourcesContent);
        }
    });
    return JSON.stringify(sourcemap);
}
function transformCSSModuleExports(cssModuleExports) {
    const keys = Object.keys(cssModuleExports || {});
    let file = "";
    keys.forEach((key) => {
        file += `export const ${key} = "${cssModuleExports[key].name}"\n`;
    });
    if (keys.length > 0) {
        file += `export default { ${keys.join(", ")} }\n`;
    }
    else {
        return "const unused = ''; export default { unused };";
    }
    return file;
}
function tranform(options) {
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
function plugin(options = {}) {
    const filter = createFilter(options.include, options.exclude);
    const { minify = false } = options;
    const cache = new Map();
    const seenNonCSSModuleIds = new Map();
    return {
        name: "parcel-css",
        async resolveId(source, importer) {
            const exec = cssRe.exec(source);
            if (filter(source) &&
                exec != null &&
                exec[1] == null &&
                importer != null) {
                const id = path.resolve(path.dirname(importer), source);
                const idArray = seenNonCSSModuleIds.get(importer);
                if (idArray) {
                    idArray.push(id);
                }
                else {
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
                map: null,
            };
        },
        async renderChunk(_, chunk, outputOptions) {
            const { modules } = chunk;
            const fileName = chunk.fileName.replace(/\.[a-zA-Z]+$/, ".css");
            const sourceMapOption = outputOptions.sourcemap;
            const cssModuleIds = [];
            const cssNonModuleIds = new Map();
            Object.keys(modules).forEach((id) => {
                if (cssRe.test(id)) {
                    cssModuleIds.push(id);
                }
                else if (seenNonCSSModuleIds.has(id)) {
                    (seenNonCSSModuleIds.get(id) || []).forEach((seenIds) => {
                        cssNonModuleIds.set(seenIds, true);
                    });
                }
            });
            const results = await Promise.all(Array.from(cssNonModuleIds.keys())
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
            }));
            let sources = results.map((r) => r.transformedCode).join("");
            if (sources !== "") {
                let sourceMaps = mergeSourceMaps(results.map((r) => r.map));
                if (sourceMapOption === "inline") {
                    sources += `\n/*# sourceMappingURL=data:application/json;base64,${base64(sourceMaps)}*/`;
                }
                else if (sourceMapOption === true) {
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
