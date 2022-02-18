import { runtimeRequire } from "./utils";
import { pathToFileURL, URL } from "url";
var sass;
const nodeModulesImporter = {
    findFileUrl(url) {
        if (!url.startsWith("~"))
            return null;
        return new URL(url.substring(1), pathToFileURL("node_modules"));
    },
};
export const sassLoader = {
    test: /\.sass|scss$/,
    type: "sass",
    options: {
        importers: [nodeModulesImporter],
    },
    process: (code, fileName, options) => {
        if (sass === undefined) {
            sass = runtimeRequire("sass");
        }
        const result = sass.compileString(code, Object.assign({}, options, { url: pathToFileURL(fileName) }));
        const dependencies = [];
        result.loadedUrls.forEach((url) => {
            if (url.pathname !== fileName) {
                dependencies.push(url.pathname);
            }
        });
        return {
            css: result.css,
            sourceMap: result.sourceMap,
            dependencies: result.loadedUrls.map((url) => url.pathname),
        };
    },
};
