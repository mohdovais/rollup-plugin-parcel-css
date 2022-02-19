import { ensureArray, runtimeRequire } from "./utils";
import { pathToFileURL, URL } from "url";
var sass;
const nodeModulesImporter = {
    findFileUrl(url) {
        if (!url.startsWith("~"))
            return null;
        return new URL(url.substring(1), pathToFileURL("node_modules"));
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
            sass = runtimeRequire("sass");
        }
        const { css, loadedUrls, sourceMap } = sass.compileString(code, Object.assign({}, options, {
            url: pathToFileURL(fileName),
            importers: importers.concat(ensureArray(options.importers)),
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
export { sassLoader };
