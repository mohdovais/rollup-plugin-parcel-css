"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassLoader = void 0;
const utils_1 = require("./utils");
const url_1 = require("url");
var sass;
const nodeModulesImporter = {
    findFileUrl(url) {
        if (!url.startsWith("~"))
            return null;
        return new url_1.URL(url.substring(1), (0, url_1.pathToFileURL)("node_modules"));
    },
};
const importers = [
    nodeModulesImporter,
];
const sassLoader = {
    test: /\.sass|scss$/,
    type: "sass",
    options: {},
    process: (code, fileName, options) => {
        if (sass === undefined) {
            sass = (0, utils_1.runtimeRequire)("sass");
        }
        const { css, loadedUrls, sourceMap } = sass.compileString(code, Object.assign({}, options, {
            url: (0, url_1.pathToFileURL)(fileName),
            importers: importers.concat((0, utils_1.ensureArray)(options.importers)),
        }));
        const dependencies = [];
        loadedUrls.forEach((url) => {
            if (url.pathname !== fileName) {
                dependencies.push(url.pathname);
            }
        });
        return {
            css: css,
            sourceMap,
            dependencies,
        };
    },
};
exports.sassLoader = sassLoader;
