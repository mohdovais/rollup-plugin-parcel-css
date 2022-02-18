"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSourceMaps = exports.base64 = exports.runtimeRequire = exports.ensureArray = exports.typeOf = void 0;
const path_1 = __importDefault(require("path"));
const cwd = process.cwd();
function typeOf(subject) {
    const exec = /\[[a-zA-Z]+ ([a-zA-Z]+)\]/.exec(Object.prototype.toString.call(subject));
    return exec == null ? "unknown" : exec[1].toLowerCase();
}
exports.typeOf = typeOf;
function ensureArray(subject) {
    return Array.isArray(subject) ? subject : subject == null ? [] : [subject];
}
exports.ensureArray = ensureArray;
function runtimeRequire(module) {
    try {
        require.resolve(module);
        return require(module);
    }
    catch (e) {
        throw `Module ${module} is not installed.`;
    }
}
exports.runtimeRequire = runtimeRequire;
function base64(str) {
    return Buffer.from(str, "utf8").toString("base64");
}
exports.base64 = base64;
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
            mergedSourceMap.sources = mergedSourceMap.sources.concat(mapv3.sources.map((source) => path_1.default.relative(cwd, source)));
            mergedSourceMap.sourcesContent = mergedSourceMap.sourcesContent.concat(mapv3.sourcesContent);
        }
    });
    return JSON.stringify(mergedSourceMap);
}
exports.mergeSourceMaps = mergeSourceMaps;
