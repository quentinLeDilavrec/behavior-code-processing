import { Program, File } from "@babel/types";
import * as t from "@babel/types";
import { NodePath } from "@babel/traverse";
import { TextDocument, Location, Uri, Range } from "vscode";
import { SerializedLoc } from "./type";
/**
 * Location refer to the vscode interface of the same name
 */
export declare class Parser {
    private file_uri;
    private defaultMapFilePath?;
    private static pluginLocation?;
    private static display_filters;
    private static serializeNodePath;
    private indexing;
    static parseLoc(id: SerializedLoc): Location;
    static serializeLoc(loc: Location): SerializedLoc;
    static nodePath2Range(path: NodePath): Range;
    private static Instantiated;
    static get(file_uri: Uri): Parser;
    constructor(file_uri: Uri, defaultMapFilePath?: string | undefined);
    private document?;
    private ast?;
    private programPath?;
    private index?;
    setDocument(document: TextDocument): void;
    getDocument(): Promise<TextDocument>;
    document2ast(document: TextDocument): Promise<File>;
    buildAst(): Promise<File>;
    getAst(): Promise<File>;
    ast2index(ast: File): Promise<Map<SerializedLoc, NodePath<t.Function>>>;
    buildIndex(): Promise<Map<string, NodePath<t.Function>>>;
    getProgramPath(): Promise<NodePath<Program>>;
    getIndex(): Promise<Map<SerializedLoc, NodePath<t.Function>>>;
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
