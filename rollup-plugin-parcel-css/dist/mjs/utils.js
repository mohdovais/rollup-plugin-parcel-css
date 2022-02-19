import path from "path";
const cwd = process.cwd();
function typeOf(subject) {
    const exec = /\[[a-zA-Z]+ ([a-zA-Z]+)\]/.exec(Object.prototype.toString.call(subject));
    return exec == null ? "unknown" : exec[1].toLowerCase();
}
function ensureArray(subject) {
    return Array.isArray(subject) ? subject : subject == null ? [] : [subject];
}
function runtimeRequire(module) {
    try {
        require.resolve(module);
        return require(module);
    }
    catch (e) {
        throw `Module ${module} is not installed. Please run "npm i ${module} -D"`;
    }
}
function base64(str) {
    return Buffer.from(str, "utf8").toString("base64");
}
function mergeSourceMaps(maps) {
    const mergedSourceMap = {
        version: 3,
        mappings: "AAAA",
        sources: [],
        sourcesContent: [],
        names: [],
    };
    maps.forEach((mapString) => {
        if (mapString !== "") {
            const mapv3 = JSON.parse(mapString);
            mergedSourceMap.sources = mergedSourceMap.sources.concat(mapv3.sources.map((source) => path.relative(cwd, source)));
            mergedSourceMap.sourcesContent = mergedSourceMap.sourcesContent.concat(mapv3.sourcesContent);
        }
    });
    return JSON.stringify(mergedSourceMap);
}
export { typeOf, ensureArray, runtimeRequire, base64, mergeSourceMaps };
