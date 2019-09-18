import * as Babel from "@babel/core";
import { SerializedLoc } from "./types";
import { NodePath } from "@babel/traverse";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "./types";
export declare function constructNodejsPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: Map<SerializedLoc, NodePath>): (b: typeof Babel) => Babel.PluginObj<{
    store: (key: string, value: Babel.NodePath<Babel.types.Node>) => void;
} & T>;
export declare function constructBrowsersPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: Map<SerializedLoc, NodePath>): (b: typeof Babel) => Babel.PluginObj<{
    store: (key: string, value: Babel.NodePath<Babel.types.Node>) => void;
} & T>;
export declare function constructExtensionPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: Map<SerializedLoc, NodePath>): (b: typeof Babel) => Babel.PluginObj<{
    store: (key: string, value: Babel.NodePath<Babel.types.Node>) => void;
} & T>;
