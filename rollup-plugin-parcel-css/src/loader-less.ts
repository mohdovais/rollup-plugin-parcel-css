import { runtimeRequire } from "./utils";
import type Less from "less";
import type { Loader, LoaderProcessResult } from "./types";

var less: typeof Less;

const lessLoader: Loader<Less.Options> = {
  test: /\.less$/,
  type: "less",
  options: {},
  process: async (
    code: string,
    fileName: string,
    options
  ): Promise<LoaderProcessResult> => {
    if (less === undefined) {
      less = runtimeRequire<typeof Less>("less");
    }

    const { css, imports, map } = await less.render(
      code,
      Object.assign({}, options, {
        filename: fileName,
        sourceMap: {},
      })
    );

    return {
      css: css,
      sourceMap: map,
      dependencies: imports,
    };
  },
};

export { lessLoader };
