import { ensureArray, runtimeRequire } from "./utils";
import { pathToFileURL, URL } from "url";
import type Sass from "sass";
import type { Loader, LoaderProcessResult } from "./types";

var sass: typeof Sass;

const nodeModulesImporter: Sass.FileImporter = {
  findFileUrl(url) {
    if (!url.startsWith("~")) return null;
    return new URL(url.substring(1), pathToFileURL("node_modules"));
  },
};

const importers: (Sass.Importer<"sync"> | Sass.FileImporter<"sync">)[] = [
  nodeModulesImporter,
];

const sassLoader: Loader<Sass.StringOptions<"sync">> = {
  test: /\.sass|scss$/,
  type: "sass",
  options: {},
  process: (code: string, fileName: string, options): LoaderProcessResult => {
    if (sass === undefined) {
      sass = runtimeRequire<typeof Sass>("sass");
    }

    const { css, loadedUrls, sourceMap } = sass.compileString(
      code,
      Object.assign({}, options, {
        url: pathToFileURL(fileName),
        importers: importers.concat(ensureArray(options.importers)),
      })
    );

    const dependencies: string[] = [];
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
