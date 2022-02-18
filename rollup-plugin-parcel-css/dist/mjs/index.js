import path from "path";
import css from "@parcel/css";
import { base64, mergeSourceMaps } from "./utils";
import { hasLoaderForFile, resolveLoaders, runLoaders } from "./loaders";
import { createFilter } from "rollup-pluginutils";
const cssRe = /\.css$/;
const moduleRe = /\.module\.[a-zA-Z0-9]+$/;
function transformCSSModuleExports(cssModuleExports) {
    const keys = Object.keys(cssModuleExports || {});
    let file = "";
    keys.forEach((key) => {
        file += `export const ${key} = "${cssModuleExports[key].name};"\n`;
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
    const rollupFilter = createFilter(options.include, options.exclude);
    const { minify = false } = options;
    const cache = new Map();
    const seenNonCSSModuleIds = new Map();
    const loaders = resolveLoaders(options.loaders);
    const filter = (fileName) => {
        return (rollupFilter(fileName) &&
            (cssRe.test(fileName) || hasLoaderForFile(loaders, fileName)));
    };
    return {
        name: "parcel-css",
        async resolveId(source, importer) {
            if (filter(source) && importer != null && !moduleRe.test(source)) {
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
        async transform(code, fileName) {
            if (!filter(fileName)) {
                return null;
            }
            const cssModules = moduleRe.test(fileName);
            const preprocess = await runLoaders(loaders, code, fileName);
            console.log(fileName, preprocess.dependencies);
            const result = await tranform({
                code: Buffer.from(preprocess.css),
                filename: fileName,
                cssModules,
                analyzeDependencies: true,
            });
            cache.set(fileName, {
                source: preprocess.css,
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
