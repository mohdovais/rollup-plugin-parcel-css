import { ensureArray } from "./utils";
import { sassLoader } from "./sass-loader";
function applyLoadersConfig(config) {
    if (typeof config === "string") {
        switch (config) {
            case "sass":
                return sassLoader;
            case "less":
            //@TODO
        }
        throw "Unknown loader " + config;
    }
    else if (config != null) {
        switch (config.type) {
            case "sass":
                return Object.assign({}, sassLoader, config);
            case "less":
            //@TODO
        }
    }
    return config;
}
function resolveLoaders(config) {
    const x = ensureArray(config);
    const loaders = new Map();
    for (let i = 0, len = x.length; i < len; i++) {
        const loader = applyLoadersConfig(x[i]);
        if (loader) {
            loaders.set(loader.type, loader);
        }
    }
    return loaders;
}
function hasLoaderForFile(loaders, fileName) {
    for (const loader of loaders.values()) {
        if (loader.test.test(fileName)) {
            return true;
        }
    }
    return false;
}
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
                dependencies: result.dependencies?.concat(ensureArray(dependencies)),
            };
        }
    }
    return result;
}
export { resolveLoaders, hasLoaderForFile, runLoaders };
