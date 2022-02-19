import { runtimeRequire } from "./utils";
var less;
const lessLoader = {
    test: /\.less$/,
    type: "less",
    options: {},
    process: async (code, fileName, options) => {
        if (less === undefined) {
            less = runtimeRequire("less");
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
export { lessLoader };
