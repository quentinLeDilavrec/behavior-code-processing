"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("@babel/parser");
const fs_1 = require("fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const instrumentation_1 = require("./instrumentation");
const Babel = __importStar(require("@babel/core"));
const core_1 = require("@babel/core");
function serializeNodePath(uri, path) {
    if (path.node.loc === null)
        throw new Error("There is no location in this node.");
    return uri.toString(false) +
        ':' + path.node.loc.start.line +
        ':' + path.node.loc.start.column +
        ':' + path.node.loc.end.line +
        ':' + path.node.loc.end.column;
}
exports.serializeNodePath = serializeNodePath;
function parseLoc(id) {
    const exploded = id.split(/:/g);
    if (exploded.length < 3) {
        throw new Error("no Range in " + id);
    }
    if (exploded.length = 3) {
        return new vscode_1.Location(vscode_1.Uri.file(exploded[0]), new vscode_1.Position(parseInt(exploded[1]), parseInt(exploded[2])));
    }
    if (exploded.length = 4) {
        return new vscode_1.Location(vscode_1.Uri.file(exploded[0] + ':' + exploded[1]), new vscode_1.Position(parseInt(exploded[2]), parseInt(exploded[3])));
    }
    if (exploded.length = 5) {
        return new vscode_1.Location(vscode_1.Uri.file(exploded[0]), new vscode_1.Range(new vscode_1.Position(parseInt(exploded[1]), parseInt(exploded[2])), new vscode_1.Position(parseInt(exploded[3]), parseInt(exploded[4]))));
    }
    if (exploded.length < 5) {
        throw new Error("missing Positions");
    }
    if (exploded.length > 6) {
        throw new Error("to much separator in " + id);
    }
    if (exploded.length = 6) {
        return new vscode_1.Location(vscode_1.Uri.file(exploded[0] + ':' + exploded[1]), new vscode_1.Range(new vscode_1.Position(parseInt(exploded[2]), parseInt(exploded[3])), new vscode_1.Position(parseInt(exploded[4]), parseInt(exploded[5]))));
    }
    return new vscode_1.Location(vscode_1.Uri.file(exploded[0]), new vscode_1.Range(new vscode_1.Position(parseInt(exploded[1]), parseInt(exploded[2])), new vscode_1.Position(parseInt(exploded[3]), parseInt(exploded[4]))));
}
exports.parseLoc = parseLoc;
function serializeLoc(loc) {
    return (loc.uri.toString(false)
        + ':' + (loc.range.start.line)
        + ':' + (loc.range.start.character)
        + ':' + (loc.range.end.line)
        + ':' + (loc.range.end.character));
}
exports.serializeLoc = serializeLoc;
function nodePath2Range(path) {
    if (!path.node.loc) {
        throw new Error("no location in " + path);
    }
    return new vscode_1.Range(new vscode_1.Position(path.node.loc.start.line, path.node.loc.start.column), new vscode_1.Position(path.node.loc.end.line, path.node.loc.end.column));
}
exports.nodePath2Range = nodePath2Range;
// /**
//  * Handle set of IndexerCollection
//  */
// export class MultiRootIndexer {
//     private Instantiated: Map<SerializedLoc, IndexerCollection> = new Map();
//     public get(workspace_uri: Uri) {
//         return (this.Instantiated.get(workspace_uri.toString(false))
//             || (parser => {
//                 this.Instantiated.set(workspace_uri.toString(false), parser);
//                 return parser;
//             })(new IndexerCollection()));
//     }
// }
// require(this.pluginLocation).default
/**
 * Handle set of FileIndexers
 */
class IndexerCollection {
    constructor(raw_plugin) {
        this.raw_plugin = raw_plugin;
        this.Instantiated = new Map();
    }
    get(file_uri) {
        return (this.Instantiated.get(file_uri.toString(false))
            || (parser => {
                this.Instantiated.set(file_uri.toString(false), parser);
                return parser;
            })(new Indexer(file_uri, this.raw_plugin)));
    }
    change_plugin(raw_plugin) {
        throw new Error("Implementation not finished.");
        this.raw_plugin = raw_plugin;
    }
}
exports.IndexerCollection = IndexerCollection;
// TODO security ask for permission to load and run plugin if it has changed, in fact requiring some random file can be risky.
/**
 * Index Locations in file given an extended babel plugin see `tests/example_behavior_*` and `tests/extension.ts`
 */
class Indexer {
    // private static indexing(acc: Map<SerializedLoc, NodePath<Node>>): Visitor<Node> {
    //     // const _this = this
    //     // const r = {}
    //     // for (const m in Parser.display_visitors) {
    //     //     if (typeof (Parser.display_visitors[m]) === "function") {
    //     //         r[m] = function () {
    //     //             const path: NodePath = Parser.display_visitors[m].apply(this, arguments)
    //     //             acc.set(Parser.serializeNodePath(_this.file_uri, path), path);
    //     //         }
    //     //     }
    //     // }
    //     // return r
    //     // if (Indexer.pluginLocation !== undefined) {
    //     //     return constructExtensionPlugin(, acc)
    //     // } else
    //     //     throw new Error("Fill Parser.pluginLocation before parsing files")
    // }
    constructor(file_uri, raw_plugin, defaultMapFilePath) {
        this.file_uri = file_uri;
        this.raw_plugin = raw_plugin;
        this.defaultMapFilePath = defaultMapFilePath;
        this.invalidate = false;
        this.first = true;
    }
    // TODO look at memoize with invalidation mechanism, it would be perfect
    setDocument(document) {
        this.document = document;
    }
    getDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.document) {
                throw new Error("no document for this Parser instance");
            }
            return this.document;
        });
    }
    document2ast(document) {
        return __awaiter(this, void 0, void 0, function* () {
            let acc = this.index || new Map();
            return new Promise((resolve, reject) => {
                try {
                    resolve(parser_1.parse(document.getText(), { sourceFilename: document.fileName, sourceType: 'module', plugins: ['typescript', 'jsx'], startLine: 0 }));
                }
                catch (e) {
                    console.error(e); // TODO look at reject for parsing error when modifications are done on the code
                }
                return acc;
            });
        });
    }
    getAst() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.ast = this.ast || (yield this.document2ast(this.document || (yield this.getDocument())));
        });
    }
    ast2index(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.index) {
                if (!this.document) {
                    throw new Error("no document for this Parser instance");
                }
                const acc = new Map();
                // const a = constructExtensionPlugin<T>(this.raw_plugin, acc)
                this.plugin = this.plugin || (this.index = undefined, instrumentation_1.constructExtensionPlugin(this.raw_plugin, acc)(Babel));
                const tO = { plugins: [this.plugin], sourceType: 'module', filename: this.document.fileName };
                // this.plugin.pre && this.plugin.pre({} as any)
                // await traverse(ast, tO);
                yield core_1.transformFromAstAsync(ast, this.document.getText(), tO);
                // this.plugin.post && this.plugin.post({ store: function (key, value) { acc.set(key, value) } })
                return acc;
            }
            else {
                return this.index;
            }
        });
    }
    // async getProgramPath(): Promise<NodePath<Program>> {
    //     if (!this.programPath) { await this.buildIndex(); }
    //     if (!this.programPath) { throw new Error("no programPath"); }
    //     return this.programPath;
    // }
    getIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.index = this.index || (yield this.ast2index(this.ast || (yield this.getAst())));
        });
    }
    getInitial() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...(this.index || (yield this.getIndex())).values()].map(x => nodePath2Range(x));
        });
    }
    getRanges() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.first) {
                this.first = false;
                return yield this.getInitial();
            }
            return [...(this.index || (yield this.getIndex())).values()].map(x => nodePath2Range(x));
        });
    }
    static instantiateMapping() {
        if (Indexer.defaultMapFileLocation === undefined) {
            throw new Error("should instantiate Parser.defaultMapFileLocation");
        }
        function size2(x) {
            if (x.length !== 2) {
                throw new Error("");
            }
            return [path_1.join(Indexer.defaultMapFileLocation.toString(false), x[0]), parseLoc(x[1])];
        }
        if (!fs_1.existsSync(Indexer.defaultMapFileLocation.toString(false))) {
            return [Indexer.defaultMapFileLocation.toString(false), new Map()];
        }
        const data = fs_1.readFileSync(path_1.join(Indexer.defaultMapFileLocation.toString(false), './vscode', 'behavior-analysis', 'modifications.csv')).toString();
        return Indexer.defaultMapping =
            new Map(data.split('\n').map(x => size2(x.split(' '))));
    }
    static saveChangesMap() {
        if (!Indexer.defaultMapFileLocation) {
            throw new Error("no workspaceFolders");
        }
        if (!fs_1.existsSync(name)) {
            fs_1.mkdirSync(name);
        }
        if (Indexer.defaultMapping === undefined || Indexer.reloadMapping) {
            throw new Error("trying to save an unstable state");
        }
        fs_1.writeFileSync(Indexer.defaultMapFileLocation.toString(false), [...Indexer.defaultMapping.entries()].map(x => x[0].substr(Indexer.defaultMapFileLocation.toString(false).length) + ' ' + x[1]).join('\n'));
    }
    updateMapping(ideLoc, dbLoc) {
        if (Indexer.defaultMapping === undefined) {
            throw new Error("no default mapping, try to fill Parser.defaultMapFileLocation before parsing files");
        }
        Indexer.defaultMapping.set(serializeLoc(ideLoc), dbLoc);
    }
    getSyncedLoc(loc) {
        if (Indexer.defaultMapFileLocation === undefined) {
            return loc;
        }
        if (Indexer.defaultMapping === undefined || Indexer.reloadMapping) {
            Indexer.reloadMapping = false;
            Indexer.instantiateMapping();
        }
        if (Indexer.defaultMapping === undefined) {
            throw new Error("no default mapping, try to fill Parser.defaultMapping before parsing files");
        }
        return Indexer.defaultMapping.get(serializeLoc(loc)) || loc;
    }
}
exports.Indexer = Indexer;
//# sourceMappingURL=indexer.js.map