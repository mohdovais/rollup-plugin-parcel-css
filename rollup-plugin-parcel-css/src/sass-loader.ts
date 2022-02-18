import { runtimeRequire } from "./utils";
import { pathToFileURL, URL } from "url";

import type Sass from "sass";
import { Loader, LoaderProcessResult } from "types";

var sass: typeof Sass;

const nodeModulesImporter: Sass.FileImporter = {
  findFileUrl(url) {
    if (!url.startsWith("~")) return null;
    return new URL(url.substring(1), pathToFileURL("node_modules"));
  },
};

export const sassLoader: Loader<Sass.StringOptions<"sync">> = {
  test: /\.sass|scss$/,
  type: "sass",
  options: {
    importers: [nodeModulesImporter],
  },
  process: (code: string, fileName: string, options): LoaderProcessResult => {
    if (sass === undefined) {
      sass = runtimeRequire<typeof Sass>("sass");
    }

    const result = sass.compileString(
      code,
      Object.assign({}, options, { url: pathToFileURL(fileName) })
    );

    const dependencies: string[] = [];
    result.loadedUrls.forEach((url) => {
      if (url.pathname !== fileName) {
        dependencies.push(url.pathname);
      }
    });

    return {
      css: result.css,
      sourceMap: result.sourceMap,
      dependencies,
    };
  },
};
