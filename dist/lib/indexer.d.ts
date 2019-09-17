import { File } from "@babel/types";
import * as t from "@babel/types";
import { NodePath } from "@babel/traverse";
import { TextDocument, Location, Uri, Range } from "vscode";
import { SerializedLoc } from "./types";
import * as Babel from "@babel/core";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "./types";
/**
 * Handle set of FileIndexers
 */
export declare class IndexerCollection<T extends t.Node = t.Node> {
    private raw_plugin;
    private Instantiated;
    get(file_uri: Uri): Indexer<T>;
    constructor(raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>);
    change_plugin(raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>): void;
}
/**
 * Index Locations in file given an extended babel plugin see `tests/example_behavior_*` and `tests/extension.ts`
 */
export declare class Indexer<T extends t.Node = t.Node> {
    private file_uri;
    private raw_plugin;
    private defaultMapFilePath?;
    private plugin?;
    private invalidate;
    constructor(file_uri: Uri, raw_plugin: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, defaultMapFilePath?: string | undefined);
    private document?;
    private ast?;
    private programPath?;
    private index?;
    setDocument(document: TextDocument): void;
    getDocument(): Promise<TextDocument>;
    document2ast(document: TextDocument): Promise<File>;
    getAst(): Promise<File>;
    ast2index(ast: File): Promise<Map<SerializedLoc, NodePath>>;
    getIndex(): Promise<Map<SerializedLoc, NodePath>>;
    private first;
    private getInitial;
    getRanges(): Promise<Range[]>;
    static defaultMapFileLocation: Uri;
    static reloadMapping: boolean;
    private static defaultMapping?;
    private static instantiateMapping;
    static saveChangesMap(): void;
    updateMapping(ideLoc: Location, dbLoc: Location): void;
    private getSyncedLoc;
}
