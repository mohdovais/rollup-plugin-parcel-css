"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runLoaders = exports.hasLoaderForFile = exports.resolveLoaders = void 0;
const utils_1 = require("./utils");
const loader_sass_1 = require("./loader-sass");
const loader_less_1 = require("./loader-less");
function applyLoadersConfig(config) {
    if (typeof config === "string") {
        switch (config) {
            case "sass":
                return loader_sass_1.sassLoader;
            case "less":
                return loader_less_1.lessLoader;
            default:
                throw "Unknown loader " + config;
        }
    }
    else if (config != null) {
        switch (config.type) {
            case "sass":
                return Object.assign({}, loader_sass_1.sassLoader, config);
            case "less":
                return Object.assign({}, loader_less_1.lessLoader, config);
        }
    }
    return config;
}
function resolveLoaders(config) {
    const x = (0, utils_1.ensureArray)(config);
    const loaders = new Map();
    for (let i = 0, len = x.length; i < len; i++) {
        const loader = applyLoadersConfig(x[i]);
        if (loader) {
            loaders.set(loader.type, loader);
        }
    }
    return loaders;
}
exports.resolveLoaders = resolveLoaders;
function hasLoaderForFile(loaders, fileName) {
    for (const loader of loaders.values()) {
        if (loader.test.test(fileName)) {
            return true;
        }
    }
    return false;
}
exports.hasLoaderForFile = hasLoaderForFile;
async function runLoaders(loaders, code, fileName, sourceMap) {
    let result = {
        css: code,
        sourceMap,
        dependencies: [],
    };
    for (const loader of loaders.values()) {
        if (loader.test.test(fileName)) {
            const { css, dependencies, sourceMap } = await loader.process(result.css, fileName, loader.options);
            result = {
                css,
                sourceMap,
                dependencies: result.dependencies?.concat((0, utils_1.ensureArray)(dependencies)),
            };
        }
    }
    return result;
}
exports.runLoaders = runLoaders;
