"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const css_1 = __importDefault(require("@parcel/css"));
const utils_1 = require("./utils");
const loaders_1 = require("./loaders");
const rollup_pluginutils_1 = require("rollup-pluginutils");
const cssRe = /\.css$/;
const moduleRe = /\.module\.[a-zA-Z0-9]+$/;
function transformCSSModuleExports(cssModuleExports) {
    let module = "";
    const transformedKeys = new Map();
    const keys = Object.keys(cssModuleExports || {});
    const cleanKeys = keys.map((key) => {
        let k = key;
        if (key.includes("-")) {
            k = key.replace(/-/g, "_");
            transformedKeys.set(k, key);
        }
        return k;
    });
    keys.forEach((key, i) => {
        module += `export const ${cleanKeys[i]} = "${cssModuleExports[key].name}";\n`;
    });
    return {
        module,
        transformedKeys,
    };
}
function tranform(options) {
    return new Promise((resolve, reject) => {
        let { code, map, dependencies, exports } = css_1.default.transform(options);
        const { module, transformedKeys } = transformCSSModuleExports(exports || {});
        resolve({
            id: options.filename,
            code: module,
            map: (map && map.toString()) || "",
            transformedCode: code.toString(),
            transformedKeys,
            dependencies,
        });
    });
}
function plugin(options = {}) {
    const rollupFilter = (0, rollup_pluginutils_1.createFilter)(options.include, options.exclude);
    const { minify = false, targets, cssModules, pseudoClasses } = options;
    const cache = new Map();
    const seenNonCSSModuleIds = new Map();
    const loaders = (0, loaders_1.resolveLoaders)(options.loaders);
    const filter = (fileName) => {
        return (rollupFilter(fileName) &&
            (cssRe.test(fileName) || (0, loaders_1.hasLoaderForFile)(loaders, fileName)));
    };
    return {
        name: "parcel-css",
        async resolveId(source, importer) {
            if (filter(source) && importer != null && !moduleRe.test(source)) {
                const id = path_1.default.resolve(path_1.default.dirname(importer), source);
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
            const isCssModule = cssModules || moduleRe.test(fileName);
            const preprocess = await (0, loaders_1.runLoaders)(loaders, code, fileName);
            preprocess.dependencies?.forEach((id) => {
                this.addWatchFile(id);
            });
            const result = await tranform({
                code: Buffer.from(preprocess.css),
                filename: fileName,
                cssModules: isCssModule,
                analyzeDependencies: true,
                targets,
                pseudoClasses,
            });
            cache.set(fileName, {
                source: preprocess.css,
                isModule: isCssModule,
                transformedKeys: result.transformedKeys,
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
                const { source = "", isModule = false, transformedKeys, } = cache.get(id) || {};
                const unusedSymbols = (0, utils_1.ensureArray)(modules[id]?.removedExports).map((name) => {
                    return transformedKeys != null && transformedKeys.has(name)
                        ? transformedKeys.get(name) || name
                        : name;
                });
                return tranform({
                    filename: id,
                    code: Buffer.from(source),
                    sourceMap: !!outputOptions.sourcemap,
                    cssModules: isModule,
                    unusedSymbols,
                    minify,
                    pseudoClasses,
                    targets,
                });
            }));
            let sources = results.map((r) => r.transformedCode).join("");
            if (sources !== "") {
                let sourceMaps = (0, utils_1.mergeSourceMaps)(results.map((r) => r.map));
                if (sourceMapOption === "inline") {
                    sources += `\n/*# sourceMappingURL=data:application/json;base64,${(0, utils_1.base64)(sourceMaps)}*/`;
                }
                else if (sourceMapOption === true) {
                    sources += `\n/*# sourceMappingURL=${path_1.default.basename(fileName)}.map */`;
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
exports.default = plugin;
