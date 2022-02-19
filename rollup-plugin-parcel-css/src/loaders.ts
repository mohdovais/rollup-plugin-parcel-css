import { ensureArray } from "./utils";
import { sassLoader } from "./loader-sass";
import { lessLoader } from "./loader-less";
import type {
  Loader,
  LoaderName,
  LoaderProcessResult,
  PluginOptions,
} from "./types";

function applyLoadersConfig(config?: Loader | LoaderName) {
  if (typeof config === "string") {
    switch (config) {
      case "sass":
        return sassLoader;
      case "less":
        return lessLoader;
      default:
        throw "Unknown loader " + config;
    }
  } else if (config != null) {
    switch (config.type) {
      case "sass":
        return Object.assign({}, sassLoader, config);
      case "less":
        return Object.assign({}, lessLoader, config);
    }
  }

  return config;
}

function resolveLoaders(config?: PluginOptions["loaders"]) {
  const x = ensureArray<Loader | LoaderName>(config);
  const loaders = new Map<string, Loader>();

  for (let i = 0, len = x.length; i < len; i++) {
    const loader = applyLoadersConfig(x[i]);
    if (loader) {
      loaders.set(loader.type, loader);
    }
  }

  return loaders;
}

function hasLoaderForFile(loaders: Map<string, Loader>, fileName: string) {
  for (const loader of loaders.values()) {
    if (loader.test.test(fileName)) {
      return true;
    }
  }

  return false;
}

async function runLoaders(
  loaders: Map<string, Loader>,
  code: string,
  fileName: string,
  sourceMap?: any
): Promise<LoaderProcessResult> {
  let result: LoaderProcessResult = {
    css: code,
    sourceMap,
    dependencies: [],
  };

  for (const loader of loaders.values()) {
    if (loader.test.test(fileName)) {
      const { css, dependencies, sourceMap } = await loader.process(
        result.css,
        fileName,
        loader.options
      );
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
