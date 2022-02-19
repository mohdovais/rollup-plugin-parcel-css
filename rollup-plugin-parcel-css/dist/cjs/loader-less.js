"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessLoader = void 0;
const utils_1 = require("./utils");
var less;
const lessLoader = {
    test: /\.less$/,
    type: "less",
    options: {},
    process: async (code, fileName, options) => {
        if (less === undefined) {
            less = (0, utils_1.runtimeRequire)("less");
        }
        const { css, imports, map } = await less.render(code, Object.assign({}, options, {
            filename: fileName,
            sourceMap: {},
        }));
        return {
            css: css,
            sourceMap: map,
            dependencies: imports,
        };
    },
};
exports.lessLoader = lessLoader;
