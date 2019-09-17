import * as Babel from "@babel/core";
import { SerializedLoc } from "./type";
import { NodePath } from "@babel/traverse";
import { BehaviorAnalysisContext, ExtendedPluginObj } from "./type";
export declare function constructNodejsPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]): (b: typeof Babel) => Babel.PluginObj<{
    cache: [string, Babel.NodePath<Babel.types.Node>][];
} & T>;
export declare function constructBrowsersPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]): (b: typeof Babel) => Babel.PluginObj<{
    cache: [string, Babel.NodePath<Babel.types.Node>][];
} & T>;
export declare function constructExtensionPlugin<T>(pluginObjFct: ({ types: t }: typeof Babel, ctx: BehaviorAnalysisContext) => ExtendedPluginObj<T>, acc: [SerializedLoc, NodePath][]): (b: typeof Babel) => Babel.PluginObj<{
    cache: [string, Babel.NodePath<Babel.types.Node>][];
} & T>;
