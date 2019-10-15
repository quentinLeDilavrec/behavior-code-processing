import { parse } from "@babel/parser";
import { Program, File } from "@babel/types";
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import { Visitor, NodePath } from "@babel/traverse";
import { inspect } from "util";
import { existsSync, readFileSync, mkdir, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { TextDocument, Location, Uri, Range, Position } from "vscode";
import { SerializedLoc } from "./types";
import { constructExtensionPlugin } from "./instrumentation";
import * as Babel from "@babel/core";
import { BehaviorAnalysisContext } from "./types";
import { ExtendedPluginObj } from "./extended_pluginObj";
import { TransformOptions, transformFromAstAsync } from "@babel/core";

export function serializeNodePath(uri: Uri, path: NodePath): SerializedLoc {
    if (path.node.loc === null)
        throw new Error("There is no location in this node.");

    return uri.toString(false) +
        ':' + path.node.loc.start.line +
        ':' + path.node.loc.start.column +
        ':' + path.node.loc.end.line +
        ':' + path.node.loc.end.column;
}

export function parseLoc(id: SerializedLoc): Location {
    const exploded = id.split(/:/g)
    if (exploded.length < 3) {
        throw new Error("no Range in " + id);
    }
    if (exploded.length = 3) {
        return new Location(
            Uri.file(exploded[0]),
            new Position(parseInt(exploded[1]), parseInt(exploded[2])));
    }
    if (exploded.length = 4) {
        return new Location(
            Uri.file(exploded[0] + ':' + exploded[1]),
            new Position(parseInt(exploded[2]), parseInt(exploded[3])));
    }
    if (exploded.length = 5) {
        return new Location(
            Uri.file(exploded[0]), new Range(
                new Position(parseInt(exploded[1]), parseInt(exploded[2])),
                new Position(parseInt(exploded[3]), parseInt(exploded[4]))));
    }
    if (exploded.length < 5) {
        throw new Error("missing Positions");
    }
    if (exploded.length > 6) {
        throw new Error("to much separator in " + id);
    }
    if (exploded.length = 6) {
        return new Location(
            Uri.file(exploded[0] + ':' + exploded[1]), new Range(
                new Position(parseInt(exploded[2]), parseInt(exploded[3])),
                new Position(parseInt(exploded[4]), parseInt(exploded[5]))));
    }
    return new Location(
        Uri.file(exploded[0]), new Range(
            new Position(parseInt(exploded[1]), parseInt(exploded[2])),
            new Position(parseInt(exploded[3]), parseInt(exploded[4]))));
}
export function serializeLoc(loc: Location): SerializedLoc {
    return (loc.uri.toString(false)
        + ':' + (loc.range.start.line)
        + ':' + (loc.range.start.character)
        + ':' + (loc.range.end.line)
        + ':' + (loc.range.end.character));
}

export function nodePath2Range(path: NodePath): Range {
    if (!path.node.loc) { throw new Error("no location in " + path); }
    return new Range(
        new Position(path.node.loc.start.line, path.node.loc.start.column),
        new Position(path.node.loc.end.line, path.node.loc.end.column));
}

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
export class IndexerCollection<T extends t.Node = t.Node> {
    private Instantiated: Map<SerializedLoc, Indexer<T>> = new Map();
    public get(file_uri: Uri) {
        return (this.Instantiated.get(file_uri.toString(false))
            || (parser => {
                this.Instantiated.set(file_uri.toString(false), parser);
                return parser;
            })(new Indexer(file_uri, this.raw_plugin)));
    }
    constructor(private raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>) {

    }
    public change_plugin(raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>) {
        throw new Error("Implementation not finished.")
        this.raw_plugin = raw_plugin
    }
}

// TODO security ask for permission to load and run plugin if it has changed, in fact requiring some random file can be risky.
/**
 * Index Locations in file given an extended babel plugin see `tests/example_behavior_*` and `tests/extension.ts`
 */
export class Indexer<T extends t.Node = t.Node> {
    // private static display_visitors: { [nodeType: string]: (path: NodePath) => NodePath } = {}

    private plugin?: ExtendedPluginObj<T>
    private invalidate: boolean = false;

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

    constructor(
        private file_uri: Uri,
        private raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>,
        private defaultMapFilePath?: string) { }
    private document?: TextDocument;
    private ast?: File;
    private programPath?: NodePath<Program>; // TODO not sure
    private index?: Map<SerializedLoc, NodePath>;
    // TODO look at memoize with invalidation mechanism, it would be perfect
    setDocument(document: TextDocument) {
        this.document = document;
    }
    async getDocument() {
        if (!this.document) { throw new Error("no document for this Parser instance"); }
        return this.document;
    }
    async document2ast(document: TextDocument) {
        let acc = this.index || new Map();
        return new Promise<File>((resolve, reject) => {
            try {
                resolve(parse(document.getText(), { sourceFilename: document.fileName, sourceType: 'module', plugins: ['typescript', 'jsx'], startLine: 0 }));
            } catch (e) {
                console.error(e); // TODO look at reject for parsing error when modifications are done on the code
            }
            return acc;
        });
    }
    async getAst() {
        return this.ast = this.ast || await this.document2ast(this.document || await this.getDocument());
    }
    async ast2index(ast: File): Promise<Map<SerializedLoc, NodePath>> {
        if (!this.index) {
            if (!this.document) { throw new Error("no document for this Parser instance"); }
            const acc = new Map();
            // const a = constructExtensionPlugin<T>(this.raw_plugin, acc)
            this.plugin = this.plugin || (this.index = undefined, constructExtensionPlugin<T>(this.raw_plugin, acc)(Babel))
            const tO: TransformOptions = { plugins: [this.plugin], sourceType: 'module', filename: this.document.fileName }
            // this.plugin.pre && this.plugin.pre({} as any)
            // await traverse(ast, tO);
            await transformFromAstAsync(ast, this.document.getText(), tO)
            // this.plugin.post && this.plugin.post({ store: function (key, value) { acc.set(key, value) } })
            return acc;
        } else {
            return this.index
        }
    }
    // async getProgramPath(): Promise<NodePath<Program>> {
    //     if (!this.programPath) { await this.buildIndex(); }
    //     if (!this.programPath) { throw new Error("no programPath"); }
    //     return this.programPath;
    // }
    async getIndex(): Promise<Map<SerializedLoc, NodePath>> {
        return this.index = this.index || await this.ast2index(this.ast || await this.getAst());
    }
    private first = true;
    private async getInitial(): Promise<Range[]> { // TODO finish it
        return [...(this.index || await this.getIndex()).values()].map(x => nodePath2Range(x));
    }
    async getRanges(): Promise<Range[]> {
        if (this.first) {
            this.first = false;
            return await this.getInitial();
        }
        return [...(this.index || await this.getIndex()).values()].map(x => nodePath2Range(x));
    }
    public static defaultMapFileLocation: Uri;
    public static reloadMapping: boolean;
    private static defaultMapping?: Map<SerializedLoc, Location>;
    private static instantiateMapping() {
        if (Indexer.defaultMapFileLocation === undefined) {
            throw new Error("should instantiate Parser.defaultMapFileLocation")
        }
        function size2(x: string[]): [SerializedLoc, Location] {
            if (x.length !== 2) { throw new Error(""); }
            return [join(Indexer.defaultMapFileLocation.toString(false), x[0]), parseLoc(x[1])];
        }

        if (!existsSync(Indexer.defaultMapFileLocation.toString(false))) {
            return [Indexer.defaultMapFileLocation.toString(false), new Map()];
        }

        const data = readFileSync(
            join(
                Indexer.defaultMapFileLocation.toString(false),
                './vscode', 'behavior-analysis',
                'modifications.csv')
        ).toString();
        return Indexer.defaultMapping =
            new Map<SerializedLoc, Location>(data.split('\n').map(x => size2(x.split(' '))));
    }
    public static saveChangesMap() {
        if (!Indexer.defaultMapFileLocation) { throw new Error("no workspaceFolders"); }
        if (!existsSync(name)) {
            mkdirSync(name);
        }
        if (Indexer.defaultMapping === undefined || Indexer.reloadMapping) {
            throw new Error("trying to save an unstable state")
        }
        writeFileSync(Indexer.defaultMapFileLocation.toString(false),
            [...Indexer.defaultMapping.entries()].map(x => x[0].substr(Indexer.defaultMapFileLocation.toString(false).length) + ' ' + x[1]).join('\n'));
    }
    updateMapping(ideLoc: Location, dbLoc: Location) {
        if (Indexer.defaultMapping === undefined) {
            throw new Error("no default mapping, try to fill Parser.defaultMapFileLocation before parsing files")
        }
        Indexer.defaultMapping.set(serializeLoc(ideLoc), dbLoc)
    }
    private getSyncedLoc(loc: Location): Location {
        if (Indexer.defaultMapFileLocation === undefined) {
            return loc
        }
        if (Indexer.defaultMapping === undefined || Indexer.reloadMapping) {
            Indexer.reloadMapping = false
            Indexer.instantiateMapping()
        }
        if (Indexer.defaultMapping === undefined) {
            throw new Error("no default mapping, try to fill Parser.defaultMapping before parsing files")
        }
        return Indexer.defaultMapping.get(serializeLoc(loc)) || loc
    }
}