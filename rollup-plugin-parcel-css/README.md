# rollup-plugin-parcel-css

A Rollup plugin to use [@parcel/css](https://github.com/parcel-bundler/parcel-css) to handle CSS files

# Usage

```javascript
import css from "rollup-plugin-parcel-css";

export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ minify: true })],
};
```

## Plugin Options

```typescript
import type { TransformOptions, PseudoClasses } from "@parcel/css";

type LoaderName = "sass" | "less";

export type PluginOptions = {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  minify?: boolean;
  targets?: TransformOptions["targets"];
  cssModules?: boolean;
  pseudoClasses?: PseudoClasses;
  loaders?: LoaderName | LoaderName[] | (Loader | Loader)[];
};
```

## CSS Modules

By default any file with name `.module.*` will be treated as CSS module. Setting option `cssModules: true` will force all files to be treated as CSS module. 

`./component.module.css`
```css
.colorMeRed {
  color: red;
}
```

`./component.js`
```js
import { colorMeRed } from './component.module.css';

...
...

```

The selectors are named exported, *Not default*, so if we need `style.colorMeRed` then we can write 

```js
import * as style from './component.module.css';

```

Since hypen `-` cannot be used in JavaScript variable declarations, it is replaced with underscore `_`.  E.g. `.color-me-red` will be exported as `color_me_red`.


## Sass

Enable Sass Loader

```javascript
export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ loaders: "sass" })],
};
```

Sass [options](https://sass-lang.com/documentation/js-api/modules#StringOptions) can be provided:

```javascript
export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [
    css({
      loaders: {
        type: "sass",
        options: {},
      },
    }),
  ],
};
```

## Less

Enable Less Loader

```javascript
export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ loaders: "less" })],
};
```

## Loaders

Webpack-styled loaders. In case of mix project both Less & Sass can be enabled

```javascript
export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ loaders: ["less", "sass"] })],
};
```

Or can bring own loader for cusstom file extensions or preprocessors; see Types definition for more details

```javascript
export default {
  input: "./src/main.js",
  output: {
    file: "./build/app.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [css({ loaders: {
      test: /\.ext/;
  type: "custom-ext";
  options?: T;
  process: (code, filename , options) => {
        // process code, transform into css
        return {
            css: ""
        }
  }
  } })],
};
```
